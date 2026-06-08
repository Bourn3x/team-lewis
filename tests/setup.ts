import { beforeEach, afterAll } from "vitest"
import { prisma } from "@/lib/db"

beforeEach(async () => {
  await prisma.upload.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
