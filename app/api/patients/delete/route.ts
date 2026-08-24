import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { patients } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }
    const formData = await request.formData()
    const id = Number(formData.get("id"))
    
    await db.delete(patients)
      .where(
        and(
          eq(patients.id, id),
          eq(patients.userId, session.user.id)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}