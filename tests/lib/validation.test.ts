import { describe, it, expect } from "vitest"
import {
  validateFile,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validation"

describe("validateFile", () => {
  it("accepts a valid JPEG under 5MB", () => {
    const result = validateFile("image/jpeg", 1024 * 1024)
    expect(result).toEqual({ valid: true })
  })

  it("accepts a valid PNG under 5MB", () => {
    const result = validateFile("image/png", 2 * 1024 * 1024)
    expect(result).toEqual({ valid: true })
  })

  it("accepts a valid WebP under 5MB", () => {
    const result = validateFile("image/webp", 500_000)
    expect(result).toEqual({ valid: true })
  })

  it("rejects a non-image file type", () => {
    const result = validateFile("application/pdf", 1024)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("rejects a file over 5MB", () => {
    const result = validateFile("image/jpeg", 6 * 1024 * 1024)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("rejects a file at exactly 5MB + 1 byte", () => {
    const result = validateFile("image/jpeg", MAX_FILE_SIZE + 1)
    expect(result.valid).toBe(false)
  })

  it("accepts a file at exactly 5MB", () => {
    const result = validateFile("image/jpeg", MAX_FILE_SIZE)
    expect(result).toEqual({ valid: true })
  })
})

describe("constants", () => {
  it("ALLOWED_TYPES contains jpeg, png, webp", () => {
    expect(ALLOWED_TYPES).toContain("image/jpeg")
    expect(ALLOWED_TYPES).toContain("image/png")
    expect(ALLOWED_TYPES).toContain("image/webp")
  })

  it("MAX_FILE_SIZE is 5MB", () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024)
  })
})
