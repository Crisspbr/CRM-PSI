"use client"

import { useState, useEffect, useCallback } from "react"
import { AddButton, Empty, PageTitle } from "@/components/crm/clinical-ui"
import { Input } from "@/components/ui/input"
import { Trash2, AlertTriangle, RotateCcw } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Bell, CalendarDays } from "lucide-react"

export default function AgendaPage() { 
  const [items, setItems] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)

  // Fetch upcoming appointments for the bell notification (next 60 minutes)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch real dashboard data from API
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const data = await res.json()
          // Set upcoming appointments from the dashboard data (next 5 appointments)
          setUpcomingAppointments(data.nextAppointments || [])
        }
      } catch (err) {
        console.error("API not available:", err)
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

  // Fetch initial data
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        setItems(data.items || [])
        setPeople(data.people || [])
        setNames(new Map((data.people || []).map((p: any) => [p.id, p.name])))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este agendamento?")) return
    
    try {
      const res = await fetch(`/api/agenda/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }, [])

  const handleNoShow = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/agenda/${id}/no-show`, { method: 'PATCH' })
      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, status: "faltou" } : item
        ))
      }
    } catch (error) {
      console.error("Erro ao marcar não veio:", error)
    }
  }, [])

  const handleCleanPast = useCallback(async () => {
    if (!window.confirm("Tem certeza que deseja remover todos os agendamentos passados?")) return
    
    try {
      const res = await fetch('/api/agenda/clean-past', { method: 'POST' })
      if (res.ok) {
        const data = await fetch('/api/agenda').then(r => r.json())
        setItems(data.items || [])
        setPeople(data.people || [])
        setNames(new Map((data.people || []).map((p: any) => [p.id, p.name])))
      }
    } catch (error) {
      console.error("Erro ao limpar agendamentos passados:", error)
    }
  }, [])

  const handleCreateAppointment = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        body: formData
      })
      
      if (res.ok) {
        // Refresh the data
        const data = await fetch('/api/agenda').then(r => r.json())
        setItems(data.items || [])
        setPeople(data.people || [])
        setNames(new Map((data.people || []).map((p: any) => [p.id, p.name])))
        // Reset form
        e.currentTarget.reset()
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
    }
  }, [])

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <PageTitle title="Agenda" description="Organize sessões, avaliações e primeiras consultas." action={
        <div className="flex items-center gap-2">
          <AddButton formId="agenda-form">Agendar sessão</AddButton>
          <button 
            onClick={handleCleanPast}
            className="rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            title="Remover agendamentos passados"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar passados
          </button>
        </div>
      } />
      <form id="agenda-form" onSubmit={handleCreateAppointment} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input required name="title" placeholder="Título / nome da sessão" />
        <select name="patientId" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="">Paciente (opcional)</option>
          {people.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Input required type="datetime-local" name="startsAt" />
        <Input name="durationMin" type="number" defaultValue="50" min="10" placeholder="Duração (min)" />
        <select name="type" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="sessao">Sessão</option>
          <option value="primeira">Primeira consulta</option>
          <option value="avaliacao">Avaliação</option>
        </select>
        <select name="modality" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="presencial">Presencial</option>
          <option value="online">Online</option>
        </select>
        <button className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
          Agendar
        </button>
      </form>
      {items.length ? (
        <div className="space-y-3">
          {items.map((a: any) => (
            <article key={a.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-center text-xs font-semibold text-primary">
                {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(a.startsAt))}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 line-clamp-1 font-medium">{a.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {a.patientId ? names.get(a.patientId) || "Paciente não encontrado" : "Consulta avulsa"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(a.startsAt))} •
                  {a.durationMin}min • {a.modality === "online" ? "Online" : "Presencial"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${a.status === "agendada" ? "bg-primary/10 text-primary" : a.status === "concluida" ? "bg-success/10 text-success" : a.status === "cancelada" ? "bg-destructive/10 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
                  {a.status === "agendada" ? "Agendada" : a.status === "concluida" ? "Concluída" : a.status === "cancelada" ? "Cancelada" : "Faltou"}
                </span>
                {a.status === "agendada" && (
                  <>
                    <button 
                      onClick={() => handleNoShow(a.id)} 
                      className="hover:text-destructive/70 transition-colors p-1 rounded hover:bg-destructive/5 text-xs"
                      title="Marcar como não veio"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(a.id)} 
                      className="hover:text-destructive/70 transition-colors p-1 rounded hover:bg-destructive/5 text-xs ml-2"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                {a.status !== "agendada" && (
                  <button 
                    onClick={() => handleDelete(a.id)} 
                    className="hover:text-destructive/70 transition-colors p-1 rounded hover:bg-destructive/5 text-xs"
                    title="Excluir agendamento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty>
          Nenhum agendamento futuro. Comece agendando sua primeira sessão!
        </Empty>
      )}
    </main>
  )
}