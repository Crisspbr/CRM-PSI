const { readFile } = require("node:fs/promises")
const { loadEnvConfig } = require("@next/env")
const { Client } = require("pg")

async function main() {
  loadEnvConfig(process.cwd())

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não foi definida.")
  }

  const sql = await readFile("drizzle/0000_initial.sql", "utf8")
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  let connected = false

  try {
    await client.connect()
    connected = true
    await client.query(sql)
    console.log("Estrutura inicial do CRM aplicada com sucesso.")
  } finally {
    if (connected) await client.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
