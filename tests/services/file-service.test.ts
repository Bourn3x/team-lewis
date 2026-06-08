import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { FileService } from "@/services/file-service"
import fs from "fs/promises"
import path from "path"
import os from "os"

describe("FileService", () => {
  let fileService: FileService
  let testDir: string

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), "smile-test-"))
    fileService = new FileService(testDir)
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true })
  })

  describe("store", () => {
    it("writes the file to disk and returns a filename", async () => {
      const buffer = Buffer.from("fake-image-data")
      const filename = await fileService.store("photo.jpg", buffer)

      expect(filename).toMatch(/\.jpg$/)
      const stored = await fs.readFile(path.join(testDir, filename))
      expect(stored).toEqual(buffer)
    })

    it("generates unique filenames for the same original name", async () => {
      const buffer = Buffer.from("data")
      const name1 = await fileService.store("photo.jpg", buffer)
      const name2 = await fileService.store("photo.jpg", buffer)
      expect(name1).not.toBe(name2)
    })

    it("preserves the file extension", async () => {
      const buffer = Buffer.from("data")
      const jpg = await fileService.store("test.jpg", buffer)
      const png = await fileService.store("test.png", buffer)
      const webp = await fileService.store("test.webp", buffer)

      expect(jpg).toMatch(/\.jpg$/)
      expect(png).toMatch(/\.png$/)
      expect(webp).toMatch(/\.webp$/)
    })

    it("creates the upload directory if it does not exist", async () => {
      const nestedDir = path.join(testDir, "nested", "dir")
      const service = new FileService(nestedDir)
      const buffer = Buffer.from("data")

      await service.store("test.jpg", buffer)

      const stat = await fs.stat(nestedDir)
      expect(stat.isDirectory()).toBe(true)
    })
  })

  describe("read", () => {
    it("reads a stored file back", async () => {
      const buffer = Buffer.from("hello-image")
      const filename = await fileService.store("test.png", buffer)
      const result = await fileService.read(filename)
      expect(result).toEqual(buffer)
    })

    it("throws when file does not exist", async () => {
      await expect(fileService.read("nonexistent.jpg")).rejects.toThrow()
    })
  })
})
