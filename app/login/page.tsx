import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const user = await getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-2">
            Entre na sua conta para gerenciar seu cardápio
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
