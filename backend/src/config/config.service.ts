import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface SqlSource {
    id: string;
    name: string;
    host: string;
    database: string;
    table: string;
    user: string;
    password?: string;
    lastCheck?: string;
    env?: string;
}

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);
    // Relative to backend root
    private readonly configPath = path.join(process.cwd(), '../server/sources.json');

    private readSources(): SqlSource[] {
        try {
            if (!fs.existsSync(this.configPath)) return [];
            const data = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            this.logger.error('Failed to read sources.json', error);
            return [];
        }
    }

    private writeSources(sources: SqlSource[]): void {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(this.configPath, JSON.stringify(sources, null, 2), 'utf8');
        } catch (error) {
            this.logger.error('Failed to write sources.json', error);
        }
    }

    getSources(): SqlSource[] {
        return this.readSources();
    }

    addSource(source: Omit<SqlSource, 'id'>): SqlSource {
        const sources = this.readSources();
        const newSource: SqlSource = {
            ...source,
            id: uuidv4(),
            lastCheck: new Date(0).toISOString(),
        };
        sources.push(newSource);
        this.writeSources(sources);
        return newSource;
    }

    deleteSource(id: string): void {
        const sources = this.readSources();
        const filtered = sources.filter(s => s.id !== id);
        this.writeSources(filtered);
    }

    resetSources(): void {
        const sources = this.readSources();
        const updated = sources.map(s => ({
            ...s,
            lastCheck: new Date(0).toISOString()
        }));
        this.writeSources(updated);
    }
}
