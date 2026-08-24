import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./lib/db/schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:***@localhost:5432/clinica_crm";
const pool = new Pool({ connectionString });
const db = drizzle({ client: pool, schema });

async function main() {
  const users = await db.select().from(schema.user);
  console.log("Users in database:", users.length);
  users.forEach(u => {
    console.log(`  - ${u.id}: ${u.email} (${u.name})`);
  });
}

main().catch(console.error);