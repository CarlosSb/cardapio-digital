import { cookies } from "next/headers"
import { sql } from "./db"
import { redirect } from "next/navigation"
import { hashPassword } from "./utils"
import bcrypt from "bcryptjs"

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

    return users[0] as AuthUser || null
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

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  // Check role in platform_users; fallback to env var list
  const role = await getPlatformUserRole(user.email)
  const isAdmin = role === "admin" || role === "super_admin"
  if (!isAdmin) {
    redirect("/dashboard")
  }

  return user
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }

  const role = await getPlatformUserRole(user.email)
  if (role !== "super_admin") {
    throw new Error("REQUIRES_SUPER_ADMIN")
  }

  return user
}

export async function requireAdminApi(): Promise<AuthUser> {
  const user = await getUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }

  const role = await getPlatformUserRole(user.email)
  const isAdmin = role === "admin" || role === "super_admin"
  if (!isAdmin) {
    throw new Error("FORBIDDEN")
  }

  return user
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const users = await sql`
      SELECT id, email, name, password_hash 
      FROM public.users 
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return { success: false, error: "Usuário não encontrado" }
    }

    const user = users[0] as { id: string; email: string; name: string | null; password_hash: string }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: "Credenciais inválidas" }
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

async function getPlatformUserRole(email: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT role FROM platform_users
      WHERE email = ${email}
      LIMIT 1
    `
    if (result.length > 0 && result[0]?.role) {
      return result[0].role as string
    }
    // Fallback to env if no platform_user found
    const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean)
    if (superAdmins.includes(email)) return "super_admin"
    const admins = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean)
    if (admins.includes(email)) return "admin"
    return null
  } catch (error) {
    console.error("Error fetching platform user role:", error)
    return null
  }
}
