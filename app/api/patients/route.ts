import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { patients } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }
    const items = await db.select().from(patients).where(eq(patients.userId, session.user.id)).orderBy(desc(patients.createdAt))
    return NextResponse.json({ user: { id: session.user.id, name: session.user.name }, patients: items })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }
    const formData = await request.formData()
    
    const name = String(formData.get("name") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim() || null
    const email = String(formData.get("email") ?? "").trim() || null
    const birthDate = String(formData.get("birthDate") ?? "").trim() || null
    const mainComplaint = String(formData.get("mainComplaint") ?? "").trim() || null
    const frequency = String(formData.get("frequency") ?? "semanal")
    const sessionPrice = Number(formData.get("sessionPrice") ?? 0) * 100
    
    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }
    
    await db.insert(patients).values({
      userId: session.user.id,
      name,
      phone,
      email,
      birthDate,
      mainComplaint,
      frequency,
      sessionPriceCents: sessionPrice
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}