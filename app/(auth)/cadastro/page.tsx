"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function AuthShell({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { 
  return <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
    <section className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-sm">
      <div className="mb-8">
        <div className="mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  </main> 
}

export default function SignupPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const f = new FormData(event.currentTarget)
    const result = await authClient.signUp.email({
      name: String(f.get("name")),
      email: String(f.get("email")),
      password: String(f.get("password")),
      // Removido callbackURL para lidar com redirecionamento manualmente após sucesso
    })
    setLoading(false)
    if (result.error) {
      setError(result.error.message ?? "Não foi possível criar a conta.")
    } else {
      setSuccess("Cadastro realizado com sucesso!")
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    }
  }
  
  if (success) {
    return <AuthShell title="Cadastro realizado" subtitle="Sua conta foi criada com sucesso!">
      <div className="text-center space-y-6">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold">{success}</h2>
        <p className="text-sm text-muted-foreground">
          Você será redirecionado para a página de login em alguns segundos...
        </p>
        <Link href="/login" className="btn-link">
          <Button variant="outline">Ir para login agora</Button>
        </Link>
      </div>
    </AuthShell>
  }
  
  return <AuthShell title="Comece sua clínica" subtitle="Crie seu acesso em poucos segundos.">
    <form onSubmit={submit} className="space-y-4">
      <label className="grid gap-1.5 text-sm font-medium">
        Seu nome
        <Input required name="name" className="h-10" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        E-mail
        <Input required name="email" type="email" className="h-10" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Senha
        <Input required name="password" type="password" minLength={8} className="h-10" />
      </label>
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {success && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">{success}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="animate-spin"/>}
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      Já possui acesso? <Link className="font-medium text-primary hover:underline" href="/login">Entrar</Link>
    </p>
  </AuthShell>
}
