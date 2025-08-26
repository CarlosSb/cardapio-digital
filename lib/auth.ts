import { cookies } from "next/headers"
import { sql } from "./db"
import { redirect } from "next/navigation"
import { hashPassword } from "./utils"

export interface AuthUser {
  id: string
  email: string
  name: string | null
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const userEmail = cookieStore.get("user_email")?.value

  if (!userEmail) {
    return null
  }

  try {
    const users = await sql`
      SELECT id, email, name 
      FROM public.users 
      WHERE email = ${userEmail}
      LIMIT 1
    `

    return users[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const users = await sql`
      SELECT id, email, name 
      FROM public.users 
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return { success: false, error: "Usuário não encontrado" }
    }

    const cookieStore = await cookies()
    cookieStore.set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function signUp(
  email: string,
  name: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingUsers = await sql`
      SELECT id FROM public.users 
      WHERE email = ${email}
      LIMIT 1
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "Usuário já existe" }
    }

    const password_hash = await hashPassword(password)

    const newUsers = await sql`
      INSERT INTO public.users (email, name, password_hash)
      VALUES (${email}, ${name}, ${password_hash})
      RETURNING id, email, name
    `

    const cookieStore = await cookies()
    cookieStore.set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("user_email")
  redirect("/login")
}
