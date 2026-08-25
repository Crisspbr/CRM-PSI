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

        <div className="ml-auto flex items-center gap-2">
          <Button className="hidden shrink-0 sm:inline-flex" render={<Link href="/leads" />} nativeButton={true}>
            <Plus data-icon="inline-start" />
            Novo contato
          </Button>
        </div>
      </header>
    )
}