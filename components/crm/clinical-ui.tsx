"use client"

import Link from "next/link"
import { ReactNode, useEffect, useState } from "react"
import { Plus, RotateCcw, Bell, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function PageTitle({ title, description, upcomingAppointments }: { title:string; description:string; upcomingAppointments?: any[] }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {upcomingAppointments && upcomingAppointments.length > 0 ? (
        <DropdownMenu className="ml-4">
          <DropdownMenuTrigger className="p-1 rounded-hover bg-muted hover:bg-muted/50">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2">
            {upcomingAppointments
              .filter(appt => {
                const apptTime = new Date(appt.startsAt)
                const now = new Date()
                const diffMs = apptTime - now
                return diffMs >= 0 && diffMs <= 60 * 60 * 1000
              })
              .map((appt) => {
                const apptTime = new Date(appt.startsAt)
                const timeString = apptTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo',
                })
                return (
                  <DropdownMenuItem key={appt.id} className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{timeString}</p>
                      <p className="text-white">{appt.patientName} - {appt.title}</p>
                    </div>
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

export function AddButton({ children, formId }: { children:ReactNode; formId?:string }) { 
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  // Quando não há formId, é um botão de submit - não precisa de onClick
  if (!formId) {
    return <Button type="submit"><Plus data-icon="inline-start" />{children}</Button>
  }
  
  // Quando formId é fornecido, é um botão de reset do lado do cliente
  return <Button 
    type={mounted ? "button" : "submit"} 
    onClick={mounted ? () => { const form = document.getElementById(formId); if (form) form.reset(); } : undefined}
  >
    <Plus data-icon="inline-start" />{children}
  </Button> 
}

export function Status({ value }: { value:string }) { 
  const styles:Record<string,string> = {
    ativo: "bg-emerald-100 text-emerald-700",
    novo: "bg-blue-100 text-blue-700",
    contatado: "bg-amber-100 text-amber-700",
    agendado: "bg-violet-100 text-violet-700",
    convertido: "bg-emerald-100 text-emerald-700",
    pendente: "bg-amber-100 text-amber-700",
    concluido: "bg-emerald-100 text-emerald-700",
    cancelada: "bg-red-100 text-red-700"
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] ?? "bg-muted text-muted-foreground"}`}>{value.replaceAll("_", " ")}</span> 
}

export function Empty({ message, href, label }: { message:string;href?:string;label?:string }) { 
  return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
    {message}
    {href && (
      <div className="mt-4">
        <Button render={<Link href={href}/>} size="sm">
          {label}
        </Button>
      </div>
    )}
  </div>
}