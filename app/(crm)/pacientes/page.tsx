"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { AddButton, Empty, PageTitle, Status } from "@/components/crm/clinical-ui"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Bell, CalendarDays } from "lucide-react"

export default function PatientsPage() {
  const [user, setUser] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/patients')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setPatients(data.patients)
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja remover este paciente?")) return
    setDeletingId(id)
    try {
      const formData = new FormData()
      formData.append("id", String(id))
      const res = await fetch('/api/patients/delete', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert("Erro ao remover paciente")
      }
    } catch (error) {
      alert("Erro ao remover paciente")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  if (!user) {
    return <div className="text-center py-12">Autenticação necessária</div>
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      <PageTitle title="Pacientes" description="Cadastros e acesso seguro ao prontuário clínico." action={<AddButton>Cadastrar novo paciente</AddButton>} upcomingAppointments={upcomingAppointments} />
      <form action="/api/patients" method="POST" className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <Input required name="name" placeholder="Nome completo" />
        <Input name="phone" placeholder="WhatsApp" />
        <Input type="email" name="email" placeholder="E-mail" />
        <Input type="date" name="birthDate" />
        <Input name="mainComplaint" placeholder="Queixa principal" className="md:col-span-2" />
        <select name="frequency" className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="semanal">Semanal</option>
          <option value="quinzenal">Quinzenal</option>
          <option value="mensal">Mensal</option>
        </select>
        <Input name="sessionPrice" type="number" placeholder="Valor da sessão (R$)" step="0.01" min="0" />
        <button className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">Cadastrar</button>
      </form>
      {patients.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((p) => (
            <Link href={`/pacientes/${p.id}`} key={p.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{p.phone || p.email || "Sem contato"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Status value={p.status} />
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-75 hover:opacity-100"
                    title="Remover paciente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{p.mainComplaint || "Sem queixa registrada"}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">{p.frequency}</p>
            </Link>
          ))}
        </div>
      ) : (
        <Empty message="Cadastre o primeiro paciente para iniciar os prontuários." />
      )}
    </main>
  )
}