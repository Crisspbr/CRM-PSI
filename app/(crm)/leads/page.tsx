"use client"

import { desc, eq } from "drizzle-orm"
import { createLead, updateLeadStatus } from "../actions"
import { db } from "@/lib/db"
import { leads } from "@/lib/db/schema"
import { requireUser } from "@/lib/current-user"
import { AddButton, Empty, PageTitle, Status } from "@/components/crm/clinical-ui"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export default function LeadsPage() { 
  const [user, setUser] = useState<{id: string} | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/leads')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setItems(data.items || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  return <main className="space-y-6 p-4 md:p-6">
    <PageTitle title="Leads" description="Acompanhe novos contatos até a conversão em paciente." action={<AddButton formId="leads-form">Novo lead</AddButton>}/>
    <form id="leads-form" action={createLead} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
      <input type="hidden" name="returnTo" value="/leads"/>
      <Input required name="name" placeholder="Nome completo"/>
      <Input name="phone" placeholder="WhatsApp"/>
      <Input type="email" name="email" placeholder="E-mail"/>
      <select name="source" className="h-8 rounded-lg border bg-background px-2 text-sm">
        <option value="instagram">Instagram</option>
        <option value="indicacao">Indicação</option>
        <option value="google">Google</option>
        <option value="outro">Outro</option>
      </select>
      <Input name="concern" placeholder="Queixa inicial" className="md:col-span-3"/>
      <button className="rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">Adicionar</button>
    </form>
    {items.length ? <div className="overflow-hidden rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="p-4">Contato</th><th className="p-4">Origem</th><th className="p-4">Queixa</th><th className="p-4">Status</th><th className="p-4">Atualizar</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-t"><td className="p-4"><p className="font-medium">{item.name}</p><p className="text-muted-foreground">{item.phone || item.email || "Sem contato"}</p></td><td className="p-4 capitalize">{item.source}</td><td className="p-4 text-muted-foreground">{item.concern || "—"}</td><td className="p-4"><Status value={item.status}/></td><td className="p-4"><form action={updateLeadStatus} className="flex gap-2"><input type="hidden" name="id" value={item.id}/><select name="status" defaultValue={item.status} className="h-8 rounded-lg border bg-background px-2 text-sm w-full" onChange={e => e.currentTarget.closest("form")?.submit()}><option value="novo">Novo</option><option value="contatado">Contatado</option><option value="agendado">Agendado</option><option value="convertido">Convertido</option><option value="perdido">Perdido</option></select></form></td></tr>)}</tbody></table></div> : <Empty message="Cadastre o primeiro lead para começar a acompanhar."/>}
  </main> 
}
