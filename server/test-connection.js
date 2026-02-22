const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function testConnection() {
    console.log("⏳ Tentative de connexion à SQL Server...");
    console.log(`   Serveur: ${config.server}`);
    console.log(`   Base: ${config.database}`);
    console.log(`   Utilisateur: ${config.user}`);

    try {
        await sql.connect(config);
        console.log("✅ SUCCÈS ! Connexion établie.");
        console.log("   La base de données est accessible.");
        process.exit(0);
    } catch (err) {
        console.error("❌ ÉCHEC de la connexion.");
        console.error("   Message:", err.message);
        console.error("   Code:", err.code);
        process.exit(1);
    }
}

testConnection();
