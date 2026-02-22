import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import * as dotenv from 'dotenv';
dotenv.config();
import { SqlSource } from './config.service';
import { IngestPayload } from '../ingest/ingest.service';

@Injectable()
export class PollerService {
    private readonly logger = new Logger(PollerService.name);

    async pollSingleSource(sourceConfig: SqlSource): Promise<{ newLastCheck: string | null, logs: IngestPayload[] }> {
        const config: sql.config = {
            user: sourceConfig.user || process.env.DB_USER,
            password: sourceConfig.password || process.env.DB_PASSWORD,
            server: sourceConfig.host,
            database: sourceConfig.database,
            options: { encrypt: true, trustServerCertificate: true },
            requestTimeout: 30000,
            connectionTimeout: 30000
        };

        this.logger.debug(`[${sourceConfig.name}] Connecting to SQL Server: '${config.server}' as '${config.user}'`);

        // Default to Epoch (1970) to fetch ALL logs if no lastCheck is set
        let lastCheckTime = sourceConfig.lastCheck ? new Date(sourceConfig.lastCheck) : new Date('1970-01-01T00:00:00Z');
        let pool: sql.ConnectionPool | null = null;

        try {
            pool = new sql.ConnectionPool(config);
            await pool.connect();

            // Sanitize table name to prevent basic SQL injection issues
            const safeTable = sourceConfig.table.replace(/[^a-zA-Z0-9_.[\]]/g, '');

            const result = await pool.request()
                .input('lastCheck', sql.DateTime, lastCheckTime)
                .query(`
                    SELECT * 
                    FROM ${safeTable} WITH (NOLOCK) 
                    WHERE CreatedOn > @lastCheck
                    AND Level IN ('Error', 'Fatal')
                    ORDER BY CreatedOn ASC
                `);

            if (result.recordset && result.recordset.length > 0) {
                this.logger.log(`[${sourceConfig.name}] 📡 Found ${result.recordset.length} new logs`);

                const newestLog = result.recordset[result.recordset.length - 1];

                // Adapt SQL ResultSet to IngestPayload format
                const logs: IngestPayload[] = result.recordset.map(log => ({
                    message: log.Message || log.Exception || 'Erreur SQL sans message',
                    stackTrace: log.Exception,
                    serviceName: sourceConfig.name,
                    environment: sourceConfig.env || 'prod',
                    metadata: {
                        sourceId: sourceConfig.id,
                        type: 'sql-sync',
                        sqlLevel: log.Level,
                        sqlLogger: log.Logger,
                        sqlUrl: log.Url
                    },
                    timestamp: log.CreatedOn
                }));

                return {
                    newLastCheck: newestLog.CreatedOn.toISOString(),
                    logs: logs
                };
            }
            return { newLastCheck: null, logs: [] };

        } catch (err: any) {
            this.logger.error(`[${sourceConfig.name}] ❌ Error during polling: ${err.message}`, err.stack);
            return { newLastCheck: null, logs: [] };
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
}
