import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus } from '../entities/incident.entity';
import * as crypto from 'crypto';
import { AiService } from '../ai/ai.service';

export interface IngestPayload {
    message: string;
    stackTrace?: string;
    serviceName: string;
    environment: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date | string;
}

export interface IngestResult {
    status: 'ACCEPTED' | 'IGNORED' | 'UPDATED';
    incidentId: string;
    isNew: boolean;
}

@Injectable()
export class IngestService {
    constructor(
        @InjectRepository(Incident)
        private incidentRepo: Repository<Incident>,
        private aiService: AiService,
    ) { }

    async processLog(payload: IngestPayload): Promise<IngestResult> {
        // 1. Normalize Message (Remove Dynamic IDs, Dates, Emails)
        const normalizedMessage = this.normalizeMessage(payload.message);

        // 2. Calculate Hash (Signature)
        const signature = this.computeHash(payload.serviceName, normalizedMessage);

        // Determine Occurrence Date
        const occurrenceDate = payload.timestamp ? new Date(payload.timestamp) : new Date();

        // 3. Find Existing Group (Open or Closed)
        const existing = await this.incidentRepo.findOne({
            where: { errorHash: signature },
            order: { version: 'DESC' } //Get latest version
        });

        if (existing) {
            // REGRESSION CHECK
            // If the existing group is "Resolved" (Closed lifecycle)
            const isResolved = [IncidentStatus.FIXED, 'DEPLOYED', 'VERIFIED_FIXED', IncidentStatus.IGNORED].includes(existing.status);

            if (isResolved) {
                // If IGNORED, we usually ignore unless strict override.
                if (existing.status === IncidentStatus.IGNORED) {
                    return { status: 'IGNORED', incidentId: existing.id, isNew: false };
                }

                // REGRESSION: Create NEW Incident (v2)
                const newVersion = (existing.version || 1) + 1;
                const newIncident = this.incidentRepo.create({
                    errorHash: signature,
                    message: payload.message,
                    stackTrace: payload.stackTrace,
                    serviceName: payload.serviceName,
                    environment: payload.environment,

                    status: IncidentStatus.REGRESSION, // Mark as Regression
                    version: newVersion,
                    regressionOf: existing.id, // Link to previous

                    occurrenceCount: 1,
                    firstSeen: occurrenceDate,
                    lastSeen: occurrenceDate,
                    metadata: { ...payload.metadata, normalizedSignature: normalizedMessage, triggeredBy: 'regression' },
                    runbookUrl: this.getRunbookUrl(payload.message),
                });

                const saved = await this.incidentRepo.save(newIncident);

                // TRIGGER AI ANALYSIS (Async) for Regression
                this.aiService.generateAnalysis(saved.message, saved.stackTrace)
                    .then(async (analysis) => {
                        if (analysis) {
                            saved.aiSummary = analysis.summary;
                            saved.aiSuggestedFix = analysis.fix;
                            await this.incidentRepo.save(saved);
                        }
                    })
                    .catch(err => console.error("AI Analysis Failed", err));

                return { status: 'ACCEPTED', incidentId: saved.id, isNew: true };
            } else {
                // ACTIVE INCIDENT: Update stats
                existing.occurrenceCount++;
                if (occurrenceDate > existing.lastSeen) {
                    existing.lastSeen = occurrenceDate;
                }
                await this.incidentRepo.save(existing);
                return { status: 'UPDATED', incidentId: existing.id, isNew: false };
            }
        }

        // 4. New Incident -> Create (v1)
        const newIncident = this.incidentRepo.create({
            errorHash: signature,
            message: payload.message,
            stackTrace: payload.stackTrace,
            serviceName: payload.serviceName,
            environment: payload.environment,

            status: IncidentStatus.OPEN,
            version: 1,

            occurrenceCount: 1,
            firstSeen: occurrenceDate,
            lastSeen: occurrenceDate,
            metadata: { ...payload.metadata, normalizedSignature: normalizedMessage },
            runbookUrl: this.getRunbookUrl(payload.message),
        });

        const saved = await this.incidentRepo.save(newIncident);

        // TRIGGER AI ANALYSIS (Async)
        this.aiService.generateAnalysis(saved.message, saved.stackTrace)
            .then(async (analysis) => {
                if (analysis) {
                    saved.aiSummary = analysis.summary;
                    saved.aiSuggestedFix = analysis.fix;
                    saved.aiLocation = analysis.location;
                    await this.incidentRepo.save(saved);
                }
            })
            .catch(err => console.error("AI Analysis Failed", err));

        return { status: 'ACCEPTED', incidentId: saved.id, isNew: true };
    }

    async processBulkLogs(payloads: IngestPayload[]): Promise<number> {
        if (!payloads.length) return 0;

        let processedCount = 0;

        // 1. Group payloads by signature in memory to prevent race conditions and DB spam
        const grouped = new Map<string, { signature: string, payloads: IngestPayload[] }>();

        for (const payload of payloads) {
            const normalizedMessage = this.normalizeMessage(payload.message);
            const signature = this.computeHash(payload.serviceName, normalizedMessage);

            if (!grouped.has(signature)) {
                grouped.set(signature, { signature, payloads: [] });
            }
            grouped.get(signature)!.payloads.push(payload);
        }

        // 2. Process each unique signature sequentially to avoid deadlocks
        for (const [signature, group] of grouped.entries()) {
            const latestPayload = group.payloads[group.payloads.length - 1]; // Sort of arbitrary, but gets context
            const normalizedMessage = this.normalizeMessage(latestPayload.message);

            // Find most recent occurrence of this log
            const occurrenceDates = group.payloads.map(p => p.timestamp ? new Date(p.timestamp) : new Date());
            const firstSeenInBatch = new Date(Math.min(...occurrenceDates.map(d => d.getTime())));
            const lastSeenInBatch = new Date(Math.max(...occurrenceDates.map(d => d.getTime())));
            const occurrencesInBatch = group.payloads.length;

            const existing = await this.incidentRepo.findOne({
                where: { errorHash: signature },
                order: { version: 'DESC' }
            });

            if (existing) {
                // REGRESSION CHECK
                const isResolved = [IncidentStatus.FIXED, 'DEPLOYED', 'VERIFIED_FIXED', IncidentStatus.IGNORED].includes(existing.status);

                if (isResolved && existing.status !== IncidentStatus.IGNORED) {
                    // Create NEW version (Regression)
                    const newIncident = this.incidentRepo.create({
                        errorHash: signature,
                        message: latestPayload.message,
                        stackTrace: latestPayload.stackTrace,
                        serviceName: latestPayload.serviceName,
                        environment: latestPayload.environment,
                        status: IncidentStatus.REGRESSION,
                        version: (existing.version || 1) + 1,
                        regressionOf: existing.id,
                        occurrenceCount: occurrencesInBatch,
                        firstSeen: firstSeenInBatch,
                        lastSeen: lastSeenInBatch,
                        metadata: { ...latestPayload.metadata, normalizedSignature: normalizedMessage, triggeredBy: 'batch-regression' },
                        runbookUrl: this.getRunbookUrl(latestPayload.message),
                    });

                    const saved = await this.incidentRepo.save(newIncident);

                    // Fire AI once per NEW regression
                    this.aiService.generateAnalysis(saved.message, saved.stackTrace)
                        .then(async (analysis) => {
                            if (analysis) {
                                saved.aiSummary = analysis.summary;
                                saved.aiSuggestedFix = analysis.fix;
                                await this.incidentRepo.save(saved);
                            }
                        }).catch(() => { });
                } else if (!isResolved) {
                    // UPDATE ACTIVE INCIDENT
                    existing.occurrenceCount += occurrencesInBatch;
                    if (lastSeenInBatch > existing.lastSeen) {
                        existing.lastSeen = lastSeenInBatch;
                    }
                    if (firstSeenInBatch < existing.firstSeen) {
                        existing.firstSeen = firstSeenInBatch;
                    }
                    await this.incidentRepo.save(existing);
                }
            } else {
                // CREATE BRAND NEW INCIDENT
                const newIncident = this.incidentRepo.create({
                    errorHash: signature,
                    message: latestPayload.message,
                    stackTrace: latestPayload.stackTrace,
                    serviceName: latestPayload.serviceName,
                    environment: latestPayload.environment,
                    status: IncidentStatus.OPEN,
                    version: 1,
                    occurrenceCount: occurrencesInBatch,
                    firstSeen: firstSeenInBatch,
                    lastSeen: lastSeenInBatch,
                    metadata: { ...latestPayload.metadata, normalizedSignature: normalizedMessage },
                    runbookUrl: this.getRunbookUrl(latestPayload.message),
                });

                const saved = await this.incidentRepo.save(newIncident);

                // Fire AI once per NEW incident class
                this.aiService.generateAnalysis(saved.message, saved.stackTrace)
                    .then(async (analysis) => {
                        if (analysis) {
                            saved.aiSummary = analysis.summary;
                            saved.aiSuggestedFix = analysis.fix;
                            saved.aiLocation = analysis.location;
                            await this.incidentRepo.save(saved);
                        }
                    }).catch(() => { });
            }

            processedCount += occurrencesInBatch;
        }

        return processedCount;
    }

    private getRunbookUrl(message: string): string | undefined {
        // Simple heuristic mapping
        if (/timeout|connection/i.test(message)) return "https://wiki.company.com/runbooks/network-timeout";
        if (/database|sql/i.test(message)) return "https://wiki.company.com/runbooks/db-connectivity";
        if (/memory|outofmemory/i.test(message)) return "https://wiki.company.com/runbooks/oom-killer";
        return undefined; // No specific runbook
    }

    async updateStatus(id: string, status: IncidentStatus): Promise<Incident> {
        const incident = await this.incidentRepo.findOne({ where: { id } });
        if (!incident) throw new Error('Incident not found');

        incident.status = status;
        return this.incidentRepo.save(incident);
    }

    async findAll(): Promise<Incident[]> {
        return this.incidentRepo.find({
            order: { lastSeen: 'DESC' }
        });
    }

    async deleteAll(): Promise<void> {
        await this.incidentRepo.clear();
    }

    private computeHash(serviceName: string, message: string): string {
        // Simple hash on message + service. 
        // In production, we should normalize stacktrace to confirm uniqueness.
        const data = `${serviceName}:${message}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }

    private normalizeMessage(message: string): string {
        return message
            // UUIDs (e.g. 123e4567-e89b-12d3-a456-426614174000)
            .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '<UUID>')
            // Emails
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<EMAIL>')
            // Dates (Simple ISO-like or common formats)
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, '<DATE>')
            .replace(/\d{4}-\d{2}-\d{2}/g, '<DATE>')
            // Hex Addresses (0x123...)
            .replace(/0x[0-9a-fA-F]+/g, '<HEX>')
            // Position indicators in parsers (e.g., "Line 1, position 27766")
            .replace(/Line \d+, position \d+/gi, 'Line <L>, position <P>')
            // Stack trace line numbers (e.g. "line 4340" or ":line 42")
            .replace(/line \d+/gi, 'line <L>')
            // SQL Deadlock Process IDs (e.g., "Process ID 56")
            .replace(/\(Process ID \d+\)/gi, '(Process ID <PID>)')
            // Full system file paths (e.g. "D:\a\1\s\GeneDoc\Models\GenerateDocument.cs"), just keep the file name
            .replace(/[a-zA-Z]:\\[\\\w.\-]+\\([\w.\-]+)/g, '$1') // Windows paths
            .replace(/(?:\/[^\/]+)+\/([\w.\-]+)/g, '$1') // Unix paths
            // Remove random quotes that might have distinct variable names 
            .replace(/'[^']*'/g, "'<VAR>'")
            .replace(/"[^"]*"/g, '"<VAR>"');
    }
}
