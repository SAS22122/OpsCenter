async function pushToBackend(logs) {
    if (!logs || logs.length === 0) return;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
    console.log(`📤 Pushing ${logs.length} logs to Backend (${BACKEND_URL})...`);

    let success = 0;
    for (const log of logs) {
        try {
            // Map SQL Log to Ingest Payload (Similar to Frontend logic)
            const payload = {
                message: log.Exception ? (log.Exception.substring(0, 200) + '...') : (log.Message || 'Unknown SQL Error'),
                serviceName: log.__sourceName || 'GeneDoc',
                environment: log.__sourceEnv || 'prod',
                stackTrace: log.Exception || log.StackTrace,
                timestamp: log.CreatedOn,
                metadata: {
                    source: 'SQL_SERVER',
                    dbSource: log.__sourceName,
                    originalId: log.Id,
                    logger: log.Logger,
                    callsite: log.Callsite
                }
            };

            // Using Node 18+ native fetch
            const res = await fetch(`${BACKEND_URL}/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) success++;
            else console.error(`   ❌ Failed to ingest log ${log.Id}: ${res.status} ${res.statusText}`);

        } catch (e) {
            console.error(`   ❌ Error pushing log ${log.Id}:`, e.message);
        }
    }
    console.log(`   ✅ Synced ${success}/${logs.length} logs to Backend.`);
}

module.exports = { pushToBackend };
