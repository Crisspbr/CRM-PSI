import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Autenticação necessária. Entre em /login para continuar.")
  return session.user
}
