"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export type RegisterState = { error?: string } | null

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email },
  })

  const cookieStore = await cookies()
  cookieStore.set("userId", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect("/dashboard")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  redirect("/register")
}
