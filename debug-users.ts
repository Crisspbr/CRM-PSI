import { loadEnvConfig } from "@next/env";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@/lib/db/schema";

loadEnvConfig(process.cwd());

async function debugUsers() {
  try {
    console.log("Fetching users from database...");
    
    const users = await db.select().from(user);
    console.log(`Found ${users.length} users:`);
    users.forEach((u, index) => {
      console.log(`${index + 1}:`, {
        id: u.id,
        email: u.email,
        name: u.name,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      });
    });
    
    if (users.length === 0) {
      console.log("No users found in database");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    process.exit(0);
  }
}

debugUsers();