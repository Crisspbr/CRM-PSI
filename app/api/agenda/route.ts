import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { appointments, patients } from "@/lib/db/schema"
import { and, asc, eq, gte } from "drizzle-orm"

export async function GET() {
  try {
    const user = await requireUser()
    
    const [items, people] = await Promise.all([
      db.select().from(appointments).where(and(eq(appointments.userId, user.id), gte(appointments.startsAt, new Date()))).orderBy(asc(appointments.startsAt)),
      db.select().from(patients).where(eq(patients.userId, user.id)).orderBy(asc(patients.name))
    ])
    
    return NextResponse.json({ items, people })
  } catch (error) {
    console.error("Error fetching agenda:", error)
    return NextResponse.json({ error: "Erro ao buscar agenda" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const formData = await request.formData()
    
    const title = String(formData.get("title") ?? "").trim()
    const patientId = formData.get("patientId") ? Number(formData.get("patientId")) : null
    const startsAt = new Date(String(formData.get("startsAt") ?? ""))
    const durationMin = Number(formData.get("durationMin") ?? 50)
    const type = String(formData.get("type") ?? "sessao")
    const modality = String(formData.get("modality") ?? "presencial")
    const notes = String(formData.get("notes") ?? "").trim() || null
    
    if (!title || isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    
    await db.insert(appointments).values({
      userId: user.id,
      patientId,
      title,
      startsAt,
      durationMin,
      type,
      modality,
      notes
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 })
  }
}