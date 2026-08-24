import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { appointments } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    
    await db.delete(appointments).where(
      and(
        eq(appointments.id, Number(id)),
        eq(appointments.userId, user.id)
      )
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Erro ao excluir agendamento" }, { status: 500 })
  }
}