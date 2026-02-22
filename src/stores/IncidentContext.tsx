// Imports updated
import React, { useState, useCallback } from 'react';
import { ErrorGroup, ErrorLog, ResolutionState, StatusUpdatePayload, BackendIncident } from '../types/incident';

import { v4 as uuidv4 } from 'uuid';

import { DateRange } from 'react-day-picker';
import { IncidentContext } from './incident-context-definition';
import { toast } from 'sonner';
import { ApiClient } from '../lib/api';

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Global Filter State (Moved to top to prevent ReferenceError)
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnv, setSelectedEnv] = useState('prod');
    const [selectedService, setSelectedService] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [groups, setGroups] = useState<ErrorGroup[]>([]);

    // --- DATA FETCHING (Backend Source of Truth) ---
    const refreshIncidents = useCallback(async () => {
        try {
            const realIncidents = await ApiClient.getIncidents();

            if (realIncidents && realIncidents.length > 0) {
                // Map Backend Entity -> Frontend ErrorGroup
                const mappedGroups: ErrorGroup[] = realIncidents.map((inc: BackendIncident) => {
                    const safeMessage = inc.message || 'No Message';
                    return {
                        id: inc.id,
                        title: safeMessage.length > 80 ? safeMessage.substring(0, 80) + '...' : safeMessage,
                        description: safeMessage, // Full message
                        severity: inc.severity,
                        category: 'APPLICATION', // Default for now
                        appId: inc.serviceName || 'unknown-service',
                        status: inc.status,
                        env: (['prod', 'stage', 'dev'].includes(inc.environment?.toLowerCase()) ? inc.environment.toLowerCase() : 'prod') as 'prod' | 'stage' | 'dev',
                        firstSeen: inc.firstSeen,
                        lastSeen: inc.lastSeen,
                        occurrenceCount: inc.occurrenceCount,
                        patternSignature: inc.errorHash,
                        aiSummary: inc.aiSummary,
                        aiSuggestedFix: inc.aiSuggestedFix,
                        aiLocation: inc.aiLocation,
                        logs: [{
                            id: inc.id, // Re-use ID for the representative log
                            timestamp: inc.lastSeen,
                            application: inc.serviceName,
                            level: 'ERROR',
                            message: inc.message,
                            env: (['prod', 'stage', 'dev'].includes(inc.environment?.toLowerCase()) ? inc.environment.toLowerCase() : 'prod') as 'prod' | 'stage' | 'dev',
                            stackTrace: inc.stackTrace,
                            metadata: inc.metadata
                        }],
                        timeline: [{
                            id: inc.id + '-evt',
                            timestamp: inc.firstSeen,
                            actor: 'System',
                            action: 'creation',
                            status: 'OPEN',
                            comment: 'Ingested from Backend'
                        }]
                    };
                });
                setGroups(mappedGroups);
                // toast.success("Données synchronisées", { description: `${mappedGroups.length} incidents chargés.` });
            } else {
                setGroups([]);
            }
        } catch (e) {
            console.error("Failed to sync", e);
            toast.error("Erreur Sync", { description: `Erreur: ${(e as Error).message}` });
        }
    }, []);

    const ingestLog = useCallback(async (log: ErrorLog) => {
        // --- BACKEND INTEGRATION (Sprint 2) ---
        // Single Source of Truth: Send to Backend -> Refresh
        try {
            const { ApiClient } = await import('../lib/api');
            const res = await ApiClient.ingestLog({
                message: log.message,
                serviceName: log.application,
                environment: log.env,
                stackTrace: log.stackTrace,
                metadata: log.metadata,
                timestamp: log.timestamp
            });

            if (res.isNew) {
                toast.success("Backend: Nouvel Incident", { description: `ID: ${res.incidentId.slice(0, 8)}...` });
            } else {
                toast.info("Backend: Doublon détecté", { description: `Compteur incrémenté` });
            }

            // Refresh local state from Backend
            refreshIncidents();

        } catch (err) {
            console.error("Backend Ingest Error:", err);
            toast.error("Backend Error", { description: "Impossible d'envoyer le log" });
        }
    }, [refreshIncidents]);

    const updateGroupStatus = useCallback((groupId: string, status: ResolutionState, payload?: StatusUpdatePayload) => {
        setGroups(currentGroups => currentGroups.map(g => {
            if (g.id !== groupId) return g;

            const updates: Partial<ErrorGroup> = { status };
            const now = new Date().toISOString();

            if (status === 'ACKNOWLEDGED') {
                updates.acknowledgedAt = now;
                // Mock: Assign to "Current User" (Ops Lead)
                updates.assignee = "Seif (Ops)";
                toast.info("Incident Pris en Charge", { description: "Assigné à Seif (Ops)" });
            }
            if (status === 'FIXED') {
                updates.fixedAt = now;
                toast.success("Correctif Appliqué", { description: "En attente de déploiement" });
            }
            if (status === 'DEPLOYED') {
                updates.deployedAt = now;
                if (payload?.version) updates.deployedVersion = payload.version;
                toast.success("Déploiement Effectué", { description: `Version ${payload?.version || 'vPatch'} en prod.` });
            }
            if (status === 'VERIFIED_FIXED') {
                toast.success("Résolution Vérifiée", { description: "Incident clos." });
            }
            if (status === 'IGNORED') {
                toast.info("Incident Ignoré", { description: "Ajouté à la whitelist (Faux Positif)." });
            }

            // Create Timeline Event
            const newEvent: import('../types/incident').TimelineEvent = {
                id: uuidv4(),
                timestamp: now,
                actor: payload?.assignee || g.assignee || 'Seif (Ops)', // Fallback to current user
                action: status === 'ACKNOWLEDGED' ? 'acknowledge' :
                    status === 'FIXED' ? 'fix' :
                        status === 'DEPLOYED' ? 'deploy' :
                            status === 'ARCHIVED' ? 'archive' :
                                status === 'IGNORED' ? 'ignore' : 'qualify', // Simplified mapping
                status: status,
                comment: payload?.comment
            };

            const updatedTimeline = [...(g.timeline || []), newEvent]; // Handle legacy groups without timeline

            return { ...g, ...updates, timeline: updatedTimeline };
        }));
    }, []);

    const updateSeverity = useCallback((groupId: string, severity: ErrorGroup['severity']) => {
        setGroups(currentGroups => currentGroups.map(g => {
            if (g.id !== groupId) return g;
            return { ...g, severity };
        }));
    }, []);



    // Moved to top
    // ...

    // ...

    // --- DATA SYNC (Sprint 2) ---


    // Initial Load - Fetch Real Data instead of Demo
    React.useEffect(() => {
        refreshIncidents();
        // Automatic polling disabled manually
        // const interval = setInterval(refreshIncidents, 10000);
        // return () => clearInterval(interval);
    }, [refreshIncidents]);




    const syncWithSql = useCallback(async () => {
        try {
            toast.loading("Synchronisation SQL...", { id: 'sql-sync' });
            // 1. Trigger Proxy (which pushes to Backend)
            const res = await fetch('http://localhost:3001/manual-sync');
            const newLogs = await res.json();

            // 2. Fetch updated state from Backend (NestJS)
            await refreshIncidents();

            if (newLogs.length === 0) {
                toast.success("SQL: À jour", { id: 'sql-sync', description: "Aucun nouveau log trouvé." });
            } else {
                toast.success(`SQL: ${newLogs.length} logs traités`, { id: 'sql-sync', description: "Envoyés au Backend & Rechargés." });
            }

        } catch (err) {
            console.error(err);
            toast.error("Erreur Sync SQL", { id: 'sql-sync', description: "Impossible de contacter le proxy (3001)." });
        }
    }, [refreshIncidents]);

    const clearAll = useCallback(async () => {
        try {
            // Optimistic update
            setGroups([]);

            // 1. Clear NestJS (Postgres)
            const { ApiClient } = await import('../lib/api');
            await ApiClient.clearIncidents();

            // 2. Reset Proxy Counters (SQL LastCheck)
            try {
                await fetch('http://localhost:3001/reset', { method: 'POST' });
            } catch (proxyError) {
                console.error("Proxy Reset Failed", proxyError);
                // Non-blocking warning
                toast.warning("Attention", { description: "DB vidée, mais échec du reset Proxy." });
            }

            toast.success("Système Réinitialisé", { description: "DB vidée & Compteurs SQL reset (1970)." });
        } catch (e) {
            console.error("Clear failed", e);
            toast.error("Erreur Nettoyage", { description: "Impossible de vider la base Postgres." });
        }
    }, []);

    const getAnalyticsData = useCallback(() => {
        // If we are in demo mode (have history), use it to generate analytics data
        // Otherwise fallback to simulation engine
        if (groups.length > 20) {
            // Aggregate from real groups
            const dailyData: Record<string, { errors: number, deployments: number, traffic: number }> = {};

            // Initialize last 30 days
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                // Enforce weekly deployments rule for visualization
                dailyData[key] = {
                    errors: 0,
                    deployments: (i % 7 === 0) ? 1 : 0,
                    traffic: Math.floor(Math.random() * 3000) + 2000 // Simulated Traffic
                };
            }

            groups.forEach(g => {
                const key = g.firstSeen.split('T')[0];
                if (dailyData[key]) {
                    dailyData[key].errors += g.occurrenceCount > 100 ? Math.ceil(g.occurrenceCount / 10) : 1;
                    if (g.status === 'DEPLOYED' || g.status === 'VERIFIED_FIXED') {
                        dailyData[key].deployments += 1;
                    }
                }
            });

            return Object.entries(dailyData).map(([date, stats]) => ({
                date,
                errors: stats.errors,
                deployments: stats.deployments, // Removed random noise
                traffic: stats.traffic
            })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        return [];
    }, [groups]);

    const getAppStats = useCallback((appName: string): import('../types/incident').AppStats => {
        let appGroups = groups.filter(g => g.appId === appName);

        // Apply Date Range Filter if set
        if (dateRange?.from) {
            appGroups = appGroups.filter(g => {
                const incidentDate = new Date(g.lastSeen);
                if (incidentDate < dateRange.from!) return false;
                if (dateRange.to && incidentDate > dateRange.to) return false;
                return true;
            });
        }

        const active = appGroups.filter(g => g.status === 'OPEN' || g.status === 'ACKNOWLEDGED').length;
        const regressions = appGroups.filter(g => g.status === 'REGRESSION').length;
        const total = appGroups.reduce((acc, g) => acc + g.occurrenceCount, 0);
        const uniqueErrors = appGroups.length;

        // Calculate tech debt ratio
        const fixed = appGroups.filter(g => g.status === 'FIXED' || g.status === 'DEPLOYED').length;
        const totalAddressable = active + fixed + regressions;
        const healthScore = totalAddressable === 0 ? 100 : Math.round((fixed / totalAddressable) * 100);

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (regressions > 0) status = 'critical';
        else if (active > 3) status = 'warning';

        // 7-day Sliding Window Logic
        // In a real app, this would be computed by backend. Here we simulate it from logs.
        const dailyStats = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i)); // Past 6 days + today
            const dayKey = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Count logs for this day for this app (count removed because unused for now logic)
            let dailyRegressions = 0;

            appGroups.forEach(g => {
                // Count occurrences on this day
                // Note: In real world, we'd need log-level granularity access here, OR aggregated day buckets on the group.
                // For this demo, we can just randomly distribute the group's total count if it was "Active" around lastSeen?
                // OR better: Just map 'lastSeen' of the group to today if it matches?
                // Let's simplify: Use SimulationEngine logic or approximations based on 'lastSeen'

                const gDate = new Date(g.lastSeen).toISOString().split('T')[0];
                if (gDate === dayKey) {
                    if (g.status === 'REGRESSION') dailyRegressions++;
                }
            });

            return { date: dayLabel, count: Math.floor(Math.random() * 5), regressions: dailyRegressions }; // Fallback random for nice sparkline visual in demo
        });

        return { appName, active, total, regressions, healthScore, uniqueErrors, status, dailyStats };
    }, [groups, dateRange]);



    const [sortStrategy, setSortStrategy] = useState<import('../types/incident').SortStrategy>('urgency');

    // Derived filtered groups
    const filteredGroups = useCallback(() => {
        return groups.filter(g => {
            // Env Filter
            if (selectedEnv !== 'all' && g.env !== selectedEnv) return false;

            // Date Filter
            if (dateRange?.from) {
                const incidentDate = new Date(g.lastSeen);
                if (incidentDate < dateRange.from) return false;
                if (dateRange.to && incidentDate > dateRange.to) return false;
            }

            // Service Filter
            if (selectedService !== 'all' && g.appId !== selectedService) return false;

            // Search Filter
            if (searchTerm) {
                const query = searchTerm.toLowerCase();
                return (
                    g.title.toLowerCase().includes(query) ||
                    g.logs?.[0]?.message.toLowerCase().includes(query) ||
                    g.appId.toLowerCase().includes(query) ||
                    g.id.toLowerCase().includes(query)
                );
            }
            return true;
        }).sort((a, b) => {
            // --- STRATEGY: URGENCY (Default / Pompier) ---
            if (sortStrategy === 'urgency') {
                // 1. Severity: UNQUALIFIED > CRITICAL > MEDIUM > MINOR
                const severityWeight: Record<ErrorGroup['severity'], number> = {
                    'UNQUALIFIED': 4,
                    'CRITICAL': 3,
                    'MEDIUM': 2,
                    'MINOR': 1
                };
                const scoreA = severityWeight[a.severity] || 0;
                const scoreB = severityWeight[b.severity] || 0;
                if (scoreA !== scoreB) return scoreB - scoreA;

                // 2. Volume and Recency
                if (a.occurrenceCount !== b.occurrenceCount) return b.occurrenceCount - a.occurrenceCount;
                return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
            }

            // --- STRATEGY: VOLUME (Flood / Jardinier) ---
            if (sortStrategy === 'volume') {
                if (a.occurrenceCount !== b.occurrenceCount) return b.occurrenceCount - a.occurrenceCount;
                // Fallback to severity
                const sWeight: Record<ErrorGroup['severity'], number> = { 'CRITICAL': 3, 'MEDIUM': 2, 'MINOR': 1, 'UNQUALIFIED': 0 };
                return (sWeight[b.severity] || 0) - (sWeight[a.severity] || 0);
            }

            // --- STRATEGY: RECENCY (Freshness / Sentinelle) ---
            if (sortStrategy === 'recency') {
                return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
            }

            // --- STRATEGY: DEBT (Dette Technique) ---
            if (sortStrategy === 'debt') {
                // Oldest First Seen first
                return new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime();
            }

            return 0;
        });
    }, [groups, searchTerm, selectedService, selectedEnv, dateRange, sortStrategy]);

    return (
        <IncidentContext.Provider value={{
            groups,
            ingestLog,
            updateGroupStatus,
            updateSeverity,
            syncWithSql,
            clearAll,
            getAnalyticsData,
            getAppStats,
            // Filters
            searchTerm, setSearchTerm,
            selectedEnv, setSelectedEnv,
            selectedService, setSelectedService,
            dateRange, setDateRange,
            sortStrategy, setSortStrategy,
            getFilteredGroups: filteredGroups
        }}>
            {children}
        </IncidentContext.Provider>
    );
};
