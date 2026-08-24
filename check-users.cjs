const { loadEnvConfig } = require("@next/env");
const { Client } = require("pg");

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não foi definida.");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  let connected = false;
  try {
    await client.connect();
    connected = true;
    
    // Use double quotes for case-sensitive column names
    const res = await client.query('SELECT id, email, name, "emailVerified" FROM "user" ORDER BY id;');
    console.log("Usuários no banco:");
    console.table(res.rows);
    
    if (res.rowCount === 0) {
      console.log("Nenhum usuário encontrado.");
    }
  } finally {
    if (connected) await client.end();
  }
}

main().catch((error) => {
  console.error("Erro:", error.message);
  process.exit(1);
});