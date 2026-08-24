import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { leads } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const items = await db.select().from(leads).where(eq(leads.userId, user.id)).orderBy(desc(leads.createdAt))
    return NextResponse.json({ user: { id: user.id }, items })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}