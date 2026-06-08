import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/register-form"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  if (userId) redirect("/dashboard")

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <RegisterForm />
    </main>
  )
}
