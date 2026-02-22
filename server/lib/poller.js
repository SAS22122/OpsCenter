const sql = require('mssql');

async function pollSingleSource(sourceConfig) {
    const config = {
        user: sourceConfig.user || process.env.DB_USER,
        password: sourceConfig.password || process.env.DB_PASSWORD,
        server: sourceConfig.host,
        database: sourceConfig.database,
        options: { encrypt: true, trustServerCertificate: true }
    };
    console.log(`DEBUG [${sourceConfig.name}] Connecting with User: '${config.user}'`);

    // Default to Epoch (1970) to fetch ALL logs if no lastCheck is set
    let lastCheckTime = sourceConfig.lastCheck ? new Date(sourceConfig.lastCheck) : new Date('1970-01-01T00:00:00Z');
    let pool = null;

    try {
        // Use a local ConnectionPool instead of the global sql.connect()
        pool = new sql.ConnectionPool(config);
        await pool.connect();

        const result = await pool.request()
            .input('lastCheck', sql.DateTime, lastCheckTime)
            .query(`
                SELECT * 
                FROM ${sourceConfig.table} WITH (NOLOCK) 
                WHERE CreatedOn > @lastCheck
                AND Level IN ('Error', 'Fatal')
                ORDER BY CreatedOn ASC
            `);

        if (result.recordset.length > 0) {
            console.log(`[${sourceConfig.name}] 📡 Found ${result.recordset.length} new logs`);

            const newestLog = result.recordset[result.recordset.length - 1];

            // Enrich logs with source metadata
            return {
                newLastCheck: newestLog.CreatedOn,
                logs: result.recordset.map(log => ({
                    ...log,
                    __sourceName: sourceConfig.name,
                    __sourceEnv: sourceConfig.env || 'prod'
                }))
            };
        }
        return { newLastCheck: null, logs: [] };

    } catch (err) {
        console.error(`[${sourceConfig.name}] ❌ Error:`, err.message);
        return { newLastCheck: null, logs: [] };
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = { pollSingleSource };
