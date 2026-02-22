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

async function fetchId(id) {
    try {
        await sql.connect(config);
        console.log(`🔎 Recherche de l'ID ${id}...`);

        const result = await sql.query(`SELECT * FROM ${process.env.DB_TABLE} WITH (NOLOCK) WHERE Id = ${id}`);

        if (result.recordset.length === 0) {
            console.log("❌ Aucun enregistrement trouvé avec cet ID.");
        } else {
            console.log("✅ Trouvé :");
            console.log(JSON.stringify(result.recordset[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error("❌ Erreur :", err.message);
        process.exit(1);
    }
}

fetchId(22);
