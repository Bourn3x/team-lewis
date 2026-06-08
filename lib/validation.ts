export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024

export function validateFile(
  type: string,
  size: number
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    return { valid: false, error: "File must be JPEG, PNG, or WebP" }
  }
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be under 5MB" }
  }
  return { valid: true }
}
