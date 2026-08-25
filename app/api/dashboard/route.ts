import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { appointments, followups, leads, patients, records } from "@/lib/db/schema"
import { eq, and, count, desc, gte, lte, sql, sum, avg, ilike } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Obter todos os dados em paralelo
    const [
      leadCountResult,
      patientCountResult,
      activePatientsResult,
      appointmentsThisWeekResult,
      completedAppointmentsThisMonthResult,
      revenueThisMonthResult,
      revenueLastMonthResult,
      nextAppointmentsResult,
      pendingFollowupsResult,
      patientStatusResult,
      // Dados adicionais para gráficos e tabelas
      leadsByStatusResult,
      avgSessionPriceResult,
      leadsSourceResult,
      appointmentsByWeekdayResult,
      recentPatientsResult,
      monthlyRevenueResult
    ] = await Promise.all([
      // Total de leads
      db.select({ value: count() }).from(leads).where(eq(leads.userId, user.id)),

      // Total de pacientes
      db.select({ value: count() }).from(patients).where(eq(patients.userId, user.id)),

      // Pacientes ativos
      db.select({ value: count() }).from(patients).where(and(eq(patients.userId, user.id), eq(patients.status, "ativo"))),

      // Agendamentos desta semana
      db.select({ value: count() }).from(appointments).where(
        and(
          eq(appointments.userId, user.id),
          eq(appointments.status, "agendada"),
          gte(appointments.startsAt, startOfWeek),
          lte(appointments.startsAt, endOfWeek)
        )
      ),

      // Agendamentos concluídos este mês (para receita)
      db.select().from(appointments).where(
        and(
          eq(appointments.userId, user.id),
          eq(appointments.status, "concluida"),
          gte(appointments.startsAt, startOfMonth),
          lte(appointments.startsAt, endOfMonth)
        )
      ),

      // Receita este mês (soma dos preços das sessões dos pacientes para agendamentos concluídos)
      db.select({
        total: sum(patients.sessionPriceCents)
      }).from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(
          and(
            eq(appointments.userId, user.id),
            eq(appointments.status, "concluida"),
            gte(appointments.startsAt, startOfMonth),
            lte(appointments.startsAt, endOfMonth)
          )
        ),

      // Receita mês passado (para comparação)
      db.select({
        total: sum(patients.sessionPriceCents)
      }).from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(
          and(
            eq(appointments.userId, user.id),
            eq(appointments.status, "concluida"),
            gte(appointments.startsAt, new Date(now.getFullYear(), now.getMonth() - 1, 1)),
            lte(appointments.startsAt, new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59))
          )
        ),

      // Próximos 5 agendamentos
      db.select({
        id: appointments.id,
        title: appointments.title,
        startsAt: appointments.startsAt,
        patientId: appointments.patientId,
        patientName: patients.name,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .where(
          and(
            eq(appointments.userId, user.id),
            eq(appointments.status, "agendada"),
            gte(appointments.startsAt, now)
          )
        )
        .orderBy(appointments.startsAt)
        .limit(5),

      // Follow-ups pendentes
      db.select().from(followups).where(
        and(
          eq(followups.userId, user.id),
          eq(followups.status, "pendente")
        )
      ).orderBy(followups.dueDate).limit(5),

      // Breakdown do status dos pacientes
      db.select({
        status: patients.status,
        count: count()
      }).from(patients)
        .where(eq(patients.userId, user.id))
        .groupBy(patients.status),

      // Leads por status para pipeline
      db.select({
        status: leads.status,
        count: count()
      }).from(leads)
        .where(eq(leads.userId, user.id))
        .groupBy(leads.status),

      // Preço médio da sessão
      db.select({
        avg: avg(patients.sessionPriceCents)
      }).from(patients).where(eq(patients.userId, user.id)),

      // Leads por origem para dados dos canais
      db.select({
        source: leads.source,
        count: count()
      }).from(leads)
        .where(eq(leads.userId, user.id))
        .groupBy(leads.source),

      // Agendamentos por dia da semana para gráfico semanal (últimas 4 semanas)
      db.select({
        dow: sql<number>`EXTRACT(DOW FROM "startsAt")`,
        agendadas: sum(sql<boolean>`CASE WHEN status = 'agendada' THEN 1 ELSE 0 END`).mapWith(Number),
        realizadas: sum(sql<boolean>`CASE WHEN status = 'concluida' THEN 1 ELSE 0 END`).mapWith(Number),
        canceladas: sum(sql<boolean>`CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END`).mapWith(Number)
      }).from(appointments)
        .where(
          and(
            eq(appointments.userId, user.id),
            gte(appointments.startsAt, new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)) // últimas 4 semanas
          )
        )
        .groupBy(sql<number>`EXTRACT(DOW FROM "startsAt")`)
        .orderBy(sql<number>`EXTRACT(DOW FROM "startsAt")`),

      // Pacientes recentes (mais recentes por createdAt) - buscar último registro e próximo agendamento separadamente via subqueries
      db.select({
        id: patients.id,
        name: patients.name,
        lastVisit: sql<Date>`(
          SELECT "sessionDate" FROM records r 
          WHERE r."patientId" = patients.id 
          ORDER BY r."sessionDate" DESC 
          LIMIT 1
        )`,
        nextVisit: sql<Date>`(
          SELECT a."startsAt" FROM appointments a 
          WHERE a."patientId" = patients.id 
            AND a.status = 'agendada' 
            AND a."startsAt" >= ${now.toISOString()}
          ORDER BY a."startsAt" ASC 
          LIMIT 1
        )`,
        status: patients.status,
        therapist: sql<string>`'Therapist'` // placeholder, não temos therapist no schema
      }).from(patients)
        .where(eq(patients.userId, user.id))
        .orderBy(desc(patients.createdAt))
        .limit(5),

      // Receita mensal dos últimos 6 meses
      db.select({
        month: sql<string>`to_char("startsAt", 'Mon')`,
        receita: sum(patients.sessionPriceCents).mapWith(Number)
      }).from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(
          and(
            eq(appointments.userId, user.id),
            eq(appointments.status, "concluida"),
            gte(appointments.startsAt, new Date(now.getFullYear(), now.getMonth() - 5, 1))
          )
        )
        .groupBy(sql<string>`to_char("startsAt", 'Mon')`)
        .orderBy(sql<string>`to_char("startsAt", 'Mon')`)
    ])

    // Calcular KPIs
    const leadCount = leadCountResult[0]?.value ?? 0
    const patientCount = patientCountResult[0]?.value ?? 0
    const activePatients = activePatientsResult[0]?.value ?? 0
    const appointmentsThisWeek = appointmentsThisWeekResult[0]?.value ?? 0

    // Calcular receita
    const revenueThisMonthCents = revenueThisMonthResult[0]?.total ?? 0
    const revenueLastMonthCents = revenueLastMonthResult[0]?.total ?? 0
    const revenueThisMonth = revenueThisMonthCents / 100
    const revenueLastMonth = revenueLastMonthCents / 100
    const revenueDelta = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : "+0"
    const revenueTrend = revenueThisMonth >= revenueLastMonth ? "up" : "down"

    // Calcular taxa de ocupação (agendamentos concluídos vs máximo teórico - 8h/dia * 5 dias/semana * 4 semanas = 160 slots/mês)
    const totalSlotsPerMonth = 160 // 8h * 5 days * 4 weeks
    const completedAppointmentsThisMonth = completedAppointmentsThisMonthResult.length
    const occupancyRate = totalSlotsPerMonth > 0
      ? ((completedAppointmentsThisMonth / totalSlotsPerMonth) * 100).toFixed(1)
      : "0"

    // Breakdown do status dos pacientes
    const statusCounts = {
      "Em tratamento": 0,
      "Aguardando retorno": 0,
      "Novos este mês": 0,
      "Alta médica": 0
    }
    patientStatusResult.forEach(({ status, count: c }) => {
      if (status === "ativo") statusCounts["Em tratamento"] = c
      else if (status === "pausado") statusCounts["Aguardando retorno"] = c
      else if (status === "inativo") statusCounts["Alta médica"] = c
    })
    // Novos este mês
    const newPatientsThisMonthResult = await db.select({ value: count() })
      .from(patients)
      .where(
        and(
          eq(patients.userId, user.id),
          gte(patients.createdAt, startOfMonth)
        )
      )
    statusCounts["Novos este mês"] = newPatientsThisMonthResult[0]?.value ?? 0

    // Calcular preço médio da sessão
    const avgSessionPriceCents = avgSessionPriceResult[0]?.avg ?? 0

    // Dados do pipeline baseados no status dos leads
    const pipelineData = []
    const leadsByStatus = leadsByStatusResult.reduce((acc, { status, count: c }) => {
      acc[status] = c
      return acc
    }, {})

    // Mapeamento do status dos leads para estágios do pipeline
    const stageMapping: Record<string, { stage: string, color: string }> = {
      novo: { stage: "Prospecção", color: "hsl(40, 70%, 55%)" },
      contatado: { stage: "Avaliação", color: "hsl(160, 60%, 45%)" },
      agendado: { stage: "Avaliação", color: "hsl(160, 60%, 45%)" }, // também Avaliação
      convertido: { stage: "Tratamento", color: "hsl(200, 60%, 45%)" },
      perdido: { stage: "Finalização", color: "hsl(320, 60%, 50%)" }
    }

    // Também precisamos considerar pacientes para alguns estágios
// Para simplificar, vamos calcular o pipeline baseado apenas nos leads por enquanto
// Vamos agregar por estágio
    const stageCounts: Record<string, { count: number, valor: number }> = {}
    Object.keys(stageMapping).forEach(status => {
      const { stage, color } = stageMapping[status]
      const count = leadsByStatus[status] ?? 0
      // Valor: valor estimado baseado no preço médio da sessão vezes a contagem (para leads que virarão pacientes)
      // Por enquanto, usaremos um valor placeholder de count * avgSessionPrice (mas nem todos os leads convertem)
      // Vamos usar apenas count * 1000 como placeholder (para corresponder à escala dos dados mock)
      if (!stageCounts[stage]) {
        stageCounts[stage] = { count: 0, valor: 0, color }
      }
      stageCounts[stage].count += count
      stageCounts[stage].valor += count * (avgSessionPriceCents > 0 ? avgSessionPriceCents : 10000) // em centavos
    })

    // converter para array
    Object.keys(stageCounts).forEach(stage => {
      const { count, valor, color } = stageCounts[stage]
      pipelineData.push({
        stage,
        valor: Math.round(valor / 1000), // converter para milhares de reais
        pacientes: count,
        color
      })
    })

    // Dados dos canais a partir dos leads por origem
    const channelData = leadsSourceResult.map(({ source, count: value }) => {
      // Mapear origem para uma cor (mapeamento expandido com mais cores)
      const colorMap: Record<string, string> = {
        // Origens padrão do sistema
        indicacao: "hsl(40, 85%, 55%)",           // Amarelo/dourado
        "busca orgânica": "hsl(160, 60%, 45%)",   // Verde
        "google ads": "hsl(200, 60%, 45%)",       // Azul
        "redes sociais": "hsl(280, 60%, 50%)",    // Roxo
        convênios: "hsl(320, 60%, 50%)",          // Rosa
        instagram: "hsl(330, 70%, 55%)",          // Rosa/Instagram
        facebook: "hsl(220, 70%, 50%)",           // Azul/Facebook
        linkedin: "hsl(200, 80%, 45%)",           // Azul/LinkedIn
        google: "hsl(45, 90%, 55%)",              // Amarelo/Google
        site: "hsl(120, 60%, 45%)",               // Verde/Site
        whatsapp: "hsl(150, 70%, 40%)",           // Verde/WhatsApp
        "google ads": "hsl(25, 90%, 55%)",        // Laranja/Ads
        youtube: "hsl(0, 75%, 55%)",              // Vermelho/YouTube
        twitter: "hsl(200, 80%, 50%)",            // Azul/Twitter (X)
        tiktok: "hsl(300, 80%, 55%)",             // Magenta/TikTok
        email: "hsl(210, 70%, 50%)",              // Azul/Email
        telefone: "hsl(30, 80%, 50%)",            // Laranja/Telefone
        presencial: "hsl(180, 60%, 45%)",         // Ciano/Presencial
        evento: "hsl(60, 70%, 55%)",              // Amarelo/Evento
        outro: "hsl(0, 0%, 55%)",                 // Cinza/Outro
      }
      const fill = colorMap[source.toLowerCase()] || `hsl(${Math.abs(source.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 65%, 50%)`
      return {
        source,
        value,
        fill
      }
    })

    // Dados de agendamentos semanais (últimas 4 semanas, agregados por dia da semana)
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const weeklyAppointments = weekdays.map((day, index) => {
      const found = appointmentsByWeekdayResult.find(row => Number(row.dow) === index)
      if (found) {
        return {
          day,
          agendadas: found.agendadas ?? 0,
          realizadas: found.realizadas ?? 0,
          canceladas: found.canceladas ?? 0
        }
      }
      return { day, agendadas: 0, realizadas: 0, canceladas: 0 }
    })

    // Dados dos pacientes recentes
    const recentPatients = recentPatientsResult.map(patient => ({
      name: patient.name,
      lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toISOString().split('T')[0] : "",
      nextVisit: patient.nextVisit ? new Date(patient.nextVisit).toISOString().split('T')[0] : "",
      status: patient.status,
      therapist: patient.therapist || ""
    }))

    // Dados de receita mensal (últimos 6 meses)
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const revenueData = months.map(month => {
      const found = monthlyRevenueResult.find(row => row.month.startsWith(month))
      if (found) {
        return {
          month,
          receita: Math.round((found.receita ?? 0) / 100), // converter centavos para reais
          meta: Math.round(((found.receita ?? 0) * 1.2) / 100), // meta dummy 20% maior
          sessoes: Math.round(((found.receita ?? 0) / (avgSessionPriceCents > 0 ? avgSessionPriceCents : 15000)) / 1) // sessões dummy
        }
      }
      return { month, receita: 0, meta: 0, sessoes: 0 }
    }).slice(-6) // últimos 6 meses

    return NextResponse.json({
      user: { id: user.id, name: user.name },
      kpis: {
        revenue: {
          value: `R$ ${revenueThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          delta: `${revenueTrend === "up" ? "+" : ""}${revenueDelta}%`,
          trend: revenueTrend,
          hint: "vs. mês anterior"
        },
        activePatients: {
          value: activePatients.toLocaleString("pt-BR"),
          delta: `+${newPatientsThisMonthResult[0]?.value ?? 0} novos`,
          trend: "up",
          hint: "este mês"
        },
        scheduledSessions: {
          value: appointmentsThisWeek.toString(),
          delta: "+0%",
          trend: "up",
          hint: "esta semana"
        },
        occupancyRate: {
          value: `${occupancyRate}%`,
          delta: "-0%",
          trend: "down",
          hint: "meta 90%"
        }
      },
      patientStatus: {
        emTratamento: statusCounts["Em tratamento"],
        aguardandoRetorno: statusCounts["Aguardando retorno"],
        novosEsteMes: statusCounts["Novos este mês"],
        altaMedica: statusCounts["Alta médica"]
      },
      nextAppointments: nextAppointmentsResult,
      pendingFollowups: pendingFollowupsResult,
      // Dados adicionais para gráficos e tabelas
      pipelineData,
      revenueData,
      channelData,
      weeklyAppointments,
      recentPatients
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}