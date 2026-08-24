"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { AddButton, Empty, PageTitle, Status } from "@/components/crm/clinical-ui"
import { Input } from "@/components/ui/input"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Bell, CalendarDays } from "lucide-react"

export default function FollowupPage() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([]) // followups
  const [loading, setLoading] = useState(true)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  // Fetch user data, upcoming appointments for bell, and followups from dashboard API
  useEffect(() => {
    setMounted(true)
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setUpcomingAppointments(data.nextAppointments || [])
          setItems(data.pendingFollowupsResult || [])
        }
      } catch (err) {
        console.error("API not available:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()

    // Automatically clean past sessions when page loads
    const cleanPastSessions = async () => {
      try {
        const res = await fetch("/api/agenda/clean-past", {
          method: "POST",
          credentials: "include"
        })
        if (!res.ok) {
          console.error("Erro ao limpar sessões passadas")
        }
      } catch (error) {
        console.error("Erro ao limpar sessões passadas:", error)
      }
    }

    cleanPastSessions()
  }, [])

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  if (!user) {
    return <div className="text-center py-12">Autenticação necessária</div>
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <PageTitle title="Acompanhamento" description="Não perca nenhum retorno de lead ou paciente." action={<AddButton>Novo contato</AddButton>} upcomingAppointments={upcomingAppointments} />
      <form action={createFollowup} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input required name="contactName" placeholder="Nome do contato"/>
        <select name="channel" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="whatsapp">WhatsApp</option>
          <option value="ligacao">Ligação</option>
          <option value="email">E-mail</option>
        </select>
        <Input required type="datetime-local" name="dueDate"/>
        <select name="relatedType" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="lead">Lead</option>
          <option value="paciente">Paciente</option>
          <option value="outro">Outro</option>
        </select>
        <Input name="note" placeholder="Motivo ou lembrete" className="md:col-span-3"/>
        <button className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">Criar tarefa</button>
      </form>
      {items.length ? (
        <div className="space-y-3">
          {items.map((f) => (
            <article key={f.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
              <div className="min-w-52 flex-1">
                <h2 className="font-semibold">{f.contactName}</h2>
                <p className="text-sm text-muted-foreground">{f.note || "Sem observação"}</p>
              </div>
              <p className="text-sm capitalize">{f.channel}</p>
              <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(f.dueDate)}</p>
              <Status value={f.status} />
              {f.status === "pendente" && (
                <form action={completeFollowup}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="text-sm font-medium text-primary">Concluir</button>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : (
        <Empty message="Você não tem acompanhamentos pendentes." />
      )}
    </main>
  )
}