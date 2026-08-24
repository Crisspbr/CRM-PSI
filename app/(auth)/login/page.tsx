"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { HeartPulse, Loader2, CheckCircle2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const form = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({ 
      email: String(form.get("email")), 
      password: String(form.get("password")), 
      callbackURL: "/" 
    })
    setLoading(false)
    if (result.error) {
      setError(result.error.message ?? "Não foi possível entrar.")
    } else {
      setSuccess("Login realizado com sucesso!")
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    }
  }
  
  if (success) {
    return <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <section className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-sm">
        <div className="mb-8">
          <div className="mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse/>
          </div>
          <h1 className="text-2xl font-semibold">Login realizado</h1>
          <p className="mt-1 text-sm text-muted-foreground">Seu acesso foi autorizado com sucesso!</p>
        </div>
        <div className="text-center space-y-6">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">{success}</h2>
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para o painel em alguns segundos...
          </p>
          <Link href="/" className="btn-link">
            <Button variant="outline">Ir para o painel agora</Button>
          </Link>
        </div>
      </section>
    </main>
  }
  
  return <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
    <section className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-sm">
      <div className="mb-8">
        <div className="mb-5 grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse/>
        </div>
        <h1 className="text-2xl font-semibold">Boas-vindas de volta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Entre para acessar sua clínica.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="grid gap-1.5 text-sm font-medium">
          E-mail
          <Input required name="email" type="email" className="h-10" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Senha
          <Input required name="password" type="password" className="h-10" />
        </label>
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {success && <p className="rounded-lg bg-success/10 p-3 text-sm text-success">{success}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="animate-spin"/>}
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem acesso? <Link className="font-medium text-primary hover:underline" href="/cadastro">Criar conta</Link>
      </p>
    </section>
  </main>
}
