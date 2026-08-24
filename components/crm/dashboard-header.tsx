"use client"

import { Search, Bell, Plus, X, AlertCircle, CalendarClock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getUpcomingAppointmentsForUser } from "@/lib/actions/notifications"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<{
    appointments: Array<{id: number, title: string, startsAt: string, patientName: string | null, type: string}>
    followups: Array<{id: number, contactName: string, dueDate: string, channel: string, relatedType: string, type: string}>
  }>({ appointments: [], followups: [] })

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getUpcomingAppointmentsForUser()
        setNotifications({
          appointments: result.appointments || [],
          followups: result.followups || []
        })
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }
    fetchNotifications()
  }, [])

  const totalNotifications = notifications.appointments.length + notifications.followups.length

  const handleOpenNotifications = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNotifications(true)
  }

  const handleCloseNotifications = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setShowNotifications(false)
  }

  const formatDateTime = (dateStr: string) => {
      if (!dateStr) return "";
      try {
        return new Intl.DateTimeFormat("pt-BR", { 
          dateStyle: "short", 
          timeStyle: "short" 
        }).format(new Date(dateStr));
      } catch (error) {
        console.error("Invalid date format:", dateStr, error);
        return "";
      }
    };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-6" />

      <div className="hidden flex-col leading-tight md:flex">
        <h1 className="text-sm font-semibold text-foreground">
          Gestão clínica
        </h1>
        <p className="text-xs text-muted-foreground">
          Pacientes, sessões e contatos
        </p>
      </div>

      <div className="relative ml-auto w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate_y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar no CRM..."
          className="pl-9"
          aria-label="Buscar"
        />
      </div>

      <Button 
        variant="outline" 
        size="icon" 
        aria-label="Notificações" 
        className={`relative shrink-0 ${totalNotifications > 0 ? 'text-primary' : ''}`}
        onClick={handleOpenNotifications}
      >
        <Bell />
        {totalNotifications > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        )}
      </Button>

      {showNotifications && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          onClick={handleCloseNotifications}
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseNotifications} />
          <div className="relative bg-background rounded-xl border max-w-sm w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-lg font-semibold">Notificações</h1>
              <p className="text-sm text-muted-foreground">
                Próximos agendamentos e acompanhamentos (~1 hora)
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCloseNotifications}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {totalNotifications > 0 ? (
                <div className="space-y-2">
                  {notifications.appointments.map((appt: {id: number, title: string, startsAt: string, patientName: string | null, type: string}) => (
                    <div key={`appt-${appt.id}`} className="p-3 rounded-lg border border-muted/20 bg-card">
                      <div className="flex items-start gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                          <CalendarClock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{appt.title}</p>
                          {appt.patientName && (
                            <p className="text-xs text-muted-foreground">Paciente: {appt.patientName}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(appt.startsAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.followups.map((followup: {id: number, contactName: string, dueDate: string, channel: string, relatedType: string, type: string}) => (
                    <div key={`followup-${followup.id}`} className="p-3 rounded-lg border border-muted/20 bg-card">
                      <div className="flex items-start gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shrink-0">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">Acompanhamento: {followup.contactName}</p>
                          <p className="text-xs text-muted-foreground">
                            Canal: {followup.channel} • Tipo: {followup.relatedType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vence em: {formatDateTime(followup.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum agendamento ou acompanhamento nas próximas 1 hora
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    
      <Button className="hidden shrink-0 sm:inline-flex" render={<Link href="/leads" />} nativeButton={false}>
        <Plus data-icon="inline-start" />
        Novo contato
      </Button>
    </header>
  )
}