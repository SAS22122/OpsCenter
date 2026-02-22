require('dotenv').config({ path: require('path').join(__dirname, '.env') });
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

async function checkSchema() {
    try {
        await sql.connect(config);
        console.log("✅ Connexion OK. Vérification du schéma de la table...");

        // Fetch 1 row to see columns
        const result = await sql.query(`SELECT TOP 1 * FROM ${process.env.DB_TABLE} WITH (NOLOCK)`);

        if (result.recordset.length === 0) {
            console.log("⚠️ La table est vide, mais accessible.");
            // Get columns from metadata if empty
            // (Simplified: just saying empty for now)
        } else {
            const columns = Object.keys(result.recordset[0]);
            console.log("✅ Colonnes trouvées :", columns.join(", "));

            // Check for potential date columns
            const dateCols = columns.filter(c => c.toLowerCase().includes('date') || c.toLowerCase().includes('time'));
            if (dateCols.length > 0) {
                console.log("📅 Colonnes de temps candidates :", dateCols.join(", "));
            } else {
                console.warn("⚠️ ATTENTION : Aucune colonne de type date détectée (par nom).");
            }
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Erreur de lecture :", err.message);
        process.exit(1);
    }
}

checkSchema();
