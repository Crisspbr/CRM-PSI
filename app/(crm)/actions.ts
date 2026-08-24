"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { appointments, followups, leads, patients, records } from "@/lib/db/schema"
import { requireUser } from "@/lib/current-user"

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim()
const path = (form: FormData) => text(form, "returnTo") || "/"

export async function createLead(form: FormData) {
  const user = await requireUser()
  await db.insert(leads).values({
    userId: user.id,
    name: text(form, "name"),
    phone: text(form, "phone") || null,
    email: text(form, "email") || null,
    source: text(form, "source") || "outro",
    concern: text(form, "concern") || null,
    notes: text(form, "notes") || null
  })
  revalidatePath(path(form))
}

export async function updateLeadStatus(form: FormData) {
  const user = await requireUser()
  const { eq, and } = await import("drizzle-orm")
  await db.update(leads)
    .set({ status: text(form, "status") })
    .where(
      and(
        eq(leads.id, Number(form.get("id"))),
        eq(leads.userId, user.id)
      )
    )
  revalidatePath("/leads")
}

export async function createPatient(form: FormData) {
  const user = await requireUser()
  await db.insert(patients).values({
    userId: user.id,
    name: text(form, "name"),
    phone: text(form, "phone") || null,
    email: text(form, "email") || null,
    birthDate: text(form, "birthDate") || null,
    mainComplaint: text(form, "mainComplaint") || null,
    frequency: text(form, "frequency") || "semanal",
    sessionPriceCents: Number(form.get("sessionPrice") || 0) * 100
  })
  revalidatePath("/pacientes")
}

export async function addRecord(form: FormData) {
  const user = await requireUser()
  await db.insert(records).values({
    userId: user.id,
    patientId: Number(form.get("patientId")),
    content: text(form, "content"),
    sessionDate: new Date(text(form, "sessionDate") || Date.now())
  })
  revalidatePath(`/pacientes/${form.get("patientId")}`)
}

export async function updateRecord(form: FormData) {
  const user = await requireUser()
  const { eq, and } = await import("drizzle-orm")
  await db.update(records)
    .set({ content: text(form, "content") })
    .where(
      and(
        eq(records.id, Number(form.get("id"))),
        eq(records.userId, user.id)
      )
    )
  revalidatePath(`/pacientes/${form.get("patientId")}`)
}

export async function deleteRecord(form: FormData) {
  const user = await requireUser()
  const { eq, and } = await import("drizzle-orm")
  await db.delete(records)
    .where(
      and(
        eq(records.id, Number(form.get("id"))),
        eq(records.userId, user.id)
      )
    )
  revalidatePath(`/pacientes/${form.get("patientId")}`)
}

export async function createAppointment(form: FormData) {
  const user = await requireUser()
  await db.insert(appointments).values({
    userId: user.id,
    patientId: form.get("patientId") ? Number(form.get("patientId")) : null,
    title: text(form, "title"),
    startsAt: new Date(text(form, "startsAt")),
    durationMin: Number(form.get("durationMin") || 50),
    type: text(form, "type") || "sessao",
    modality: text(form, "modality") || "presencial",
    notes: text(form, "notes") || null
  })
  revalidatePath("/agenda")
}

export async function createFollowup(form: FormData) {
  const user = await requireUser()
  await db.insert(followups).values({
    userId: user.id,
    contactName: text(form, "contactName"),
    channel: text(form, "channel") || "whatsapp",
    relatedType: text(form, "relatedType") || "lead",
    relatedId: form.get("relatedId") ? Number(form.get("relatedId")) : null,
    dueDate: new Date(text(form, "dueDate")),
    note: text(form, "note") || null
  })
  revalidatePath("/acompanhamento")
}

export async function completeFollowup(form: FormData) {
  const user = await requireUser()
  const { eq, and } = await import("drizzle-orm")
  await db.update(followups)
    .set({ status: "concluido" })
    .where(
      and(
        eq(followups.id, Number(form.get("id"))),
        eq(followups.userId, user.id)
      )
    )
  revalidatePath("/acompanhamento")
}

export async function deletePatient(form: FormData) {
  const user = await requireUser()
  const { eq, and } = await import("drizzle-orm")
  await db.delete(patients)
    .where(
      and(
        eq(patients.id, Number(form.get("id"))),
        eq(patients.userId, user.id)
      )
    )
  revalidatePath("/pacientes")
}

export async function cleanPastAppointments(form: FormData) {
  const user = await requireUser()
  const { and, eq, lt } = await import("drizzle-orm")
  const now = new Date()
  await db.delete(appointments)
    .where(
      and(
        eq(appointments.userId, user.id),
        lt(appointments.startsAt, now)
      )
    )
  revalidatePath("/")
  revalidatePath("/agenda")
}

export async function getUpcomingAppointments(input: FormData | { patientId: number | string }) {
  const user = await requireUser()
  const { and, eq, gte, lte, asc } = await import("drizzle-orm")
  const { appointments, patients } = await import("@/lib/db/schema")
  
  // Handle both FormData and plain object
  let patientId: number
  if (input instanceof FormData) {
    patientId = Number(input.get("patientId"))
  } else if (typeof input === "object" && "patientId" in input) {
    patientId = Number(input.patientId)
  } else {
    throw new Error("Invalid input for getUpcomingAppointments")
  }
  
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  
  const upcomingAppointments = await db.select({
    id: appointments.id,
    title: appointments.title,
    startsAt: appointments.startsAt,
    patientName: patients.name,
  })
  .from(appointments)
  .leftJoin(patients, eq(appointments.patientId, patients.id))
  .where(
    and(
      eq(appointments.userId, user.id),
      eq(appointments.patientId, patientId),
      gte(appointments.startsAt, now),
      lte(appointments.startsAt, oneHourFromNow)
    )
  )
  .orderBy(asc(appointments.startsAt))
  
  return { appointments: upcomingAppointments }
}

export async function getPatientWithRecords(form: FormData) {
  const user = await requireUser()
  const { and, eq, desc } = await import("drizzle-orm")
  
  const patientId = Number(form.get("patientId"))
  const page = Number(form.get("page") || 0)
  const limit = 10
  
  const patient = await db.query.patients.findFirst({
    where: and(eq(patients.id, patientId), eq(patients.userId, user.id))
  })
  
  if (!patient) {
      return { patient: null, records: [], totalRecords: 0, totalPages: 0 }
    }

    const totalRecords = await db.$count(
      records,
      and(eq(records.patientId, patientId), eq(records.userId, user.id))
    )

    const recordsData = await db.select().from(records)
      .where(and(eq(records.patientId, patientId), eq(records.userId, user.id)))
      .orderBy(desc(records.sessionDate))
      .limit(limit)
      .offset(page * limit)

    const totalPages = Math.max(1, Math.ceil(totalRecords / limit))
  
  return { patient, records: recordsData, totalRecords, totalPages }
}