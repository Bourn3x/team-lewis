import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/db"

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("@/lib/services", () => ({
  fileService: {
    store: vi.fn().mockResolvedValue("test-uuid.jpg"),
  },
  scoreProvider: {
    score: vi.fn().mockResolvedValue(75),
  },
}))

import { POST } from "@/app/api/uploads/route"
import { cookies } from "next/headers"
import { fileService, scoreProvider } from "@/lib/services"

function createUploadRequest(file?: File): Request {
  const formData = new FormData()
  if (file) {
    formData.append("image", file)
  }
  return new Request("http://localhost/api/uploads", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/uploads", () => {
  let testUser: { id: string }

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: { name: "Test User", email: "test@example.com" },
    })
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: testUser.id }),
      set: vi.fn(),
    } as any)
  })

  it("returns 401 when no session cookie", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    } as any)

    const request = createUploadRequest(
      new File([Buffer.from("img")], "test.jpg", { type: "image/jpeg" })
    )
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it("returns 400 when no file is provided", async () => {
    const request = createUploadRequest()
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it("returns 400 for invalid file type", async () => {
    const file = new File([Buffer.from("data")], "doc.pdf", {
      type: "application/pdf",
    })
    const request = createUploadRequest(file)
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/JPEG|PNG|WebP/i)
  })

  it("returns 400 for file over 5MB", async () => {
    const bigBuffer = Buffer.alloc(6 * 1024 * 1024)
    const file = new File([bigBuffer], "big.jpg", { type: "image/jpeg" })
    const request = createUploadRequest(file)
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/5MB/i)
  })

  it("stores file, generates score, and creates DB record", async () => {
    const file = new File([Buffer.from("image-data")], "smile.jpg", {
      type: "image/jpeg",
    })
    const request = createUploadRequest(file)

    const response = await POST(request)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.filename).toBe("test-uuid.jpg")
    expect(body.score).toBe(75)
    expect(body.id).toBeDefined()

    expect(fileService.store).toHaveBeenCalled()
    expect(scoreProvider.score).toHaveBeenCalled()

    const dbRecord = await prisma.upload.findFirst({
      where: { userId: testUser.id },
    })
    expect(dbRecord).not.toBeNull()
    expect(dbRecord!.score).toBe(75)
    expect(dbRecord!.filename).toBe("test-uuid.jpg")
  })
})
