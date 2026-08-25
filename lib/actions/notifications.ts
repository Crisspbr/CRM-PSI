"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { appointments, patients, followups } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { and, eq, gte, lte, asc, or } from "drizzle-orm"

export async function getUpcomingAppointmentsForUser() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() })
    if (!session?.user) {
      return { appointments: [], followups: [] }
    }
    const user = session.user
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    
    // Obter agendamentos próximos dentro de 1 hora
    const upcomingAppointments = await db.select({
      id: appointments.id,
      title: appointments.title,
      startsAt: appointments.startsAt,
      patientName: patients.name,
      type: "appointment"
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(
      and(
        eq(appointments.userId, user.id),
        gte(appointments.startsAt, now),
        lte(appointments.startsAt, oneHourFromNow),
        eq(appointments.status, "agendada")
      )
    )
    .orderBy(appointments.startsAt)
    
    // Obter follow-ups com vencimento dentro de 1 hora
    const upcomingFollowups = await db.select({
      id: followups.id,
      contactName: followups.contactName,
      dueDate: followups.dueDate,
      channel: followups.channel,
      relatedType: followups.relatedType,
      type: "followup"
    })
    .from(followups)
    .where(
      and(
        eq(followups.userId, user.id),
        eq(followups.status, "pendente"),
        gte(followups.dueDate, now),
        lte(followups.dueDate, oneHourFromNow)
      )
    )
    .orderBy(followups.dueDate)
    
    return { 
      appointments: upcomingAppointments,
      followups: upcomingFollowups
    }
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return { appointments: [], followups: [] }
  }
}