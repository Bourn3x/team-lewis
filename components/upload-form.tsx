"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileImage, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/validation"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setError(null)
  }

  function removeFile() {
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ""
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError("Please select an image")
      return
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type as (typeof ALLOWED_TYPES)[number])) {
      setError("File must be JPEG, PNG, or WebP")
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File must be under 5MB")
      return
    }

    setPending(true)
    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed")
        return
      }

      removeFile()
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
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Click to choose an image</span>
              <span className="text-xs">JPEG, PNG, or WebP up to 5 MB</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileImage className="h-8 w-8 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 shrink-0 p-0"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending || !selectedFile}>
            {pending ? "Analyzing..." : "Get Smile Score"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
