const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });
if (dotenvResult.error) console.error("Dotenv Error:", dotenvResult.error);
console.log("Dotenv Parsed:", dotenvResult.parsed);
const sql = require('mssql');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const SOURCES_FILE = path.join(__dirname, 'sources.json');

console.log("DEBUG: Env Check");
console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "MISSING"); 

// Helper: Load Sources
function loadSources() {
    if (!fs.existsSync(SOURCES_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Helper: Save Sources
function saveSources(sources) {
    fs.writeFileSync(SOURCES_FILE, JSON.stringify(sources, null, 2));
}

const { pollSingleSource } = require('./lib/poller');
const { pushToBackend } = require('./lib/pusher');

// ... (Load Sources helper remains)

// 3. Configuration Routes
app.get('/config/sources', (req, res) => {
    res.json(loadSources());
});

app.post('/config/sources', (req, res) => {
    const newSource = req.body;
    if (!newSource.host || !newSource.database) {
        return res.status(400).json({ error: "Missing host or database" });
    }
    let sources = loadSources();
    sources.push({ ...newSource, lastCheck: '1970-01-01T00:00:00Z' });
    saveSources(sources);
    res.json({ message: "Source added", source: newSource });
});

app.delete('/config/sources/:index', (req, res) => {
    const idx = parseInt(req.params.index);
    let sources = loadSources();
    if (idx >= 0 && idx < sources.length) {
        const removed = sources.splice(idx, 1);
        saveSources(sources);
        res.json({ message: "Source removed", source: removed });
    } else {
        res.status(404).json({ error: "Source not found" });
    }
});

// 4. GET /manual-sync (Sync ALL sources)
app.get('/manual-sync', async (req, res) => {
    console.log("📥 Multi-Source Sync Triggered");
    let sources = loadSources();
    let allLogs = [];
    let updatedSources = false;

    for (let source of sources) {
        console.log(`🔄 Syncing source: ${source.name}...`);
        const { newLastCheck, logs } = await pollSingleSource(source);

        if (logs.length > 0) {
            await pushToBackend(logs); // PUSH TO NESTJS
            allLogs = [...allLogs, ...logs];
        }

        if (newLastCheck) {
            source.lastCheck = newLastCheck;
            updatedSources = true;
        }
    }

    if (updatedSources) {
        saveSources(sources);
    }

    res.json(allLogs);
});

// 5. POST /reset (Reset all counters)
app.post('/reset', (req, res) => {
    let sources = loadSources();
    // Reset to 1970 to force full re-sync
    sources = sources.map(s => ({ ...s, lastCheck: '1970-01-01T00:00:00Z' }));
    saveSources(sources);
    console.log("🔄 All counters reset to 1970-01-01");
    res.json({ message: "Counters reset to 1970 (Full Sync)" });
});


const PORT = 3001;
server.listen(PORT, () => {
    console.log(`✅ Proxy Server Running on port ${PORT}`);
    console.log(`   ➜ Config: http://localhost:${PORT}/config/sources`);
    console.log(`   ➜ Sync:   http://localhost:${PORT}/manual-sync`);
});
