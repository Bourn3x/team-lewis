import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { fileService, scoreProvider } from "@/lib/services"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get("session")
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.value

  // Parse form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const image = formData.get("image")
  if (!image || !(image instanceof File)) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 })
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(image.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    )
  }

  // Validate file size
  if (image.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    )
  }

  // Store file
  const filename = await fileService.store(image)

  // Score the image
  const score = await scoreProvider.score(image)

  // Save to DB
  const upload = await prisma.upload.create({
    data: {
      userId,
      filename,
      score,
    },
  })

  return NextResponse.json({ id: upload.id, filename, score }, { status: 200 })
}
