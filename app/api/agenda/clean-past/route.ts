import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { appointments } from "@/lib/db/schema"
import { and, eq, lt } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }
    const now = new Date()
    
    await db.delete(appointments)
      .where(
        and(
          eq(appointments.userId, session.user.id),
          lt(appointments.startsAt, now)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cleaning past appointments:", error)
    return NextResponse.json({ error: "Failed to clean past appointments" }, { status: 500 })
  }
}