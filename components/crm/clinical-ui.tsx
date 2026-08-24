"use client"

import Link from "next/link"
import { ReactNode, useEffect, useState } from "react"
import { Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PageTitle({ title, description }: { title:string; description:string }) { return <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div> }

export function AddButton({ children, formId }: { children:ReactNode; formId?:string }) { 
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  // When no formId, it's a submit button - no onClick needed
  if (!formId) {
    return <Button type="submit"><Plus data-icon="inline-start" />{children}</Button>
  }
  
  // When formId is provided, it's a client-side reset button
  return <Button 
    type={mounted ? "button" : "submit"} 
    onClick={mounted ? () => { const form = document.getElementById(formId); if (form) form.reset(); } : undefined}
  >
    <Plus data-icon="inline-start" />{children}
  </Button> 
}

export function Status({ value }: { value:string }) { const styles:Record<string,string>={ativo:"bg-emerald-100 text-emerald-700",novo:"bg-blue-100 text-blue-700",contatado:"bg-amber-100 text-amber-700",agendado:"bg-violet-100 text-violet-700",convertido:"bg-emerald-100 text-emerald-700",pendente:"bg-amber-100 text-amber-700",concluido:"bg-emerald-100 text-emerald-700",cancelada:"bg-red-100 text-red-700"}; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] ?? "bg-muted text-muted-foreground"}`}>{value.replaceAll("_"," ")}</span> }

export function Empty({ message, href, label }: { message:string;href?:string;label?:string }) { return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{message}{href && <div className="mt-4"><Button render={<Link href={href}/>} size="sm">{label}</Button></div>}</div> }