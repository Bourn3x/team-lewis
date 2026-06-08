import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Upload {
  id: string
  filename: string
  score: number
  createdAt: Date
}

interface UploadHistoryProps {
  uploads: Upload[]
}

export function UploadHistory({ uploads }: UploadHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Previous Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <img
                src={`/api/images/${upload.filename}`}
                alt="Upload"
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-muted-foreground text-sm">
                  {upload.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-base">
                {upload.score}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
