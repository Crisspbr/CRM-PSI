"use client"

import { useState, useEffect, useCallback } from "react"
import { AddButton, Empty, PageTitle } from "@/components/crm/clinical-ui"
import { Input } from "@/components/ui/input"
import { Trash2, AlertTriangle, RotateCcw, CheckCircle2, XCircle, Bell, CalendarDays } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function AgendaPage() { 
  const [items, setItems] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)

  // Buscar agendamentos próximos para a notificação do sino (próximos 60 minutos)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Buscar dados reais do dashboard da API
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard")
        if (res.ok) {
          const data = await res.json()
          // Definir agendamentos próximos dos dados do dashboard (próximos 5 agendamentos)
          setUpcomingAppointments(data.nextAppointments || [])
        }
      } catch (err) {
        console.error("API not available:", err)
      }
    }
    fetchDashboardData()

    // Limpar sessões passadas automaticamente quando a página carrega
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

  // Buscar dados iniciais
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

  const handleConcluded = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/agenda/${id}/concluida`, { method: 'PATCH' })
      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, status: "concluida" } : item
        ))
      }
    } catch (error) {
      console.error("Erro ao marcar como realizada:", error)
    }
  }, [])

  const handleCancelled = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/agenda/${id}/cancelada`, { method: 'PATCH' })
      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, status: "cancelada" } : item
        ))
      }
    } catch (error) {
      console.error("Erro ao marcar como cancelada:", error)
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
        // Atualizar os dados
        const data = await fetch('/api/agenda').then(r => r.json())
        setItems(data.items || [])
        setPeople(data.people || [])
        setNames(new Map((data.people || []).map((p: any) => [p.id, p.name])))
        // Resetar formulário
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:bg-muted/50 transition-colors p-1 rounded text-xs" title="Alterar status">
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleConcluded(a.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Marcar como realizada
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCancelled(a.id)}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                        Marcar como cancelada
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleNoShow(a.id)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Marcar como não veio
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <button 
                  onClick={() => handleDelete(a.id)} 
                  className="hover:text-destructive/70 transition-colors p-1 rounded hover:bg-destructive/5 text-xs ml-2"
                  title="Excluir agendamento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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