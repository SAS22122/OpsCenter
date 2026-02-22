import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    DEVELOPER = 'DEVELOPER',
    VIEWER = 'VIEWER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    passwordHash: string; // Nullable for SSO-only users

    @Column({ nullable: true })
    microsoftId: string; // For linking SSO

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;

    @Column({ type: 'jsonb', default: { theme: 'system' } })
    preferences: {
        theme?: 'light' | 'dark' | 'system';
        defaultEnvironment?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
