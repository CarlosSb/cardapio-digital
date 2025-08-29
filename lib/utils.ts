import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Defina a função hashPassword
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

//aplica um deley na requisição
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function getOriginUrl(headersList: any): string {
  const proto = headersList["x-forwarded-proto"] || "http"
  const host = headersList["x-forwarded-host"] || headersList.host
  const origin = `${proto}://${host}`
  return origin
}