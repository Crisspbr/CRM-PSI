import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:***@localhost:5432/clinica_crm"
// Mask password for logging
const masked = connectionString.replace(/:[^:@]+@/, ':***@')
console.log('DATABASE_URL (masked):', masked)
const pool = new Pool({ connectionString })

export const db = drizzle({ client: pool, schema })
export const databaseConfigured = Boolean(process.env.DATABASE_URL)