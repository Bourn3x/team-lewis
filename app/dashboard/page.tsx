import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { UploadForm } from "@/components/upload-form"
import { ScoreHero } from "@/components/score-hero"
import { UploadHistory } from "@/components/upload-history"
import { LogoutButton } from "@/components/logout-button"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value
  if (!userId) redirect("/register")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { uploads: { orderBy: { createdAt: "desc" } } },
  })

  if (!user) redirect("/register")

  const [latest, ...history] = user.uploads

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Upload a photo to get your smile score</p>
        </div>
        <LogoutButton />
      </div>

      <UploadForm />

      {latest && <ScoreHero upload={latest} />}

      {history.length > 0 && <UploadHistory uploads={history} />}

      {!latest && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          <p>No uploads yet. Upload your first photo above!</p>
        </div>
      )}
    </main>
  )
}
