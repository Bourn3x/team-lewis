import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export class FileService {
  constructor(
    private uploadDir: string = path.join(process.cwd(), "uploads")
  ) {}

  async store(originalName: string, buffer: Buffer): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true })
    const ext = path.extname(originalName)
    const filename = `${randomUUID()}${ext}`
    await fs.writeFile(path.join(this.uploadDir, filename), buffer)
    return filename
  }

  async read(filename: string): Promise<Buffer> {
    return fs.readFile(path.join(this.uploadDir, filename))
  }
}
