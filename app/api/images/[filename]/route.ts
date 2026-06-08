import { NextResponse } from "next/server"
import { fileService } from "@/lib/services"
import path from "path"

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  try {
    const buffer = await fileService.read(filename)
    const ext = path.extname(filename).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
