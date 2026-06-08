"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/validation"

export function UploadForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError("Please select an image")
      return
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      setError("File must be JPEG, PNG, or WebP")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File must be under 5MB")
      return
    }

    setPending(true)
    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed")
        return
      }

      if (fileRef.current) fileRef.current.value = ""
      router.refresh()
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload a Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Choose an image</Label>
            <Input
              id="image"
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Analyzing..." : "Get Smile Score"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
