import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum IncidentStatus {
    OPEN = 'OPEN',
    ACKNOWLEDGED = 'ACKNOWLEDGED',
    FIXED = 'FIXED',
    REGRESSION = 'REGRESSION',
    IGNORED = 'IGNORED',
}

export enum Severity {
    CRITICAL = 'CRITICAL',
    MEDIUM = 'MEDIUM',
    MINOR = 'MINOR',
    UNQUALIFIED = 'UNQUALIFIED',
}

@Entity()
export class Incident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    errorHash: string; // The "Signature" used by Gatekeeper

    @Column({ type: 'text', nullable: true }) // Allow nulls to fix migration crash
    message: string;

    @Column({ type: 'text', nullable: true })
    stackTrace: string;

    @Column({ nullable: true })
    @Index()
    serviceName: string;

    @Column({ nullable: true })
    @Index()
    environment: string;

    @Column({
        type: 'enum',
        enum: Severity,
        default: Severity.UNQUALIFIED,
    })
    severity: Severity;

    @Column({
        type: 'enum',
        enum: IncidentStatus,
        default: IncidentStatus.OPEN,
    })
    @Index() // Optimized for filtering by Status (Open/Fixed)
    status: IncidentStatus;

    @Column({ default: 1 })
    occurrenceCount: number;

    @CreateDateColumn()
    firstSeen: Date;

    @UpdateDateColumn()
    @Index() // Optimized for sorting by "Most Recent"
    lastSeen: Date;

    @Column({ default: 1 })
    version: number;

    @Column({ type: 'uuid', nullable: true })
    regressionOf: string; // ID of the previous incident if this is a regression

    @Column({ nullable: true })
    runbookUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown>; // Extra context (Git, etc.)

    @Column({ type: 'text', nullable: true })
    aiSummary: string;

    @Column({ type: 'text', nullable: true })
    aiSuggestedFix: string;

    @Column({ type: 'text', nullable: true })
    aiLocation: string;
}
