import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ScoreHeroProps {
  upload: {
    id: string
    filename: string
    score: number
    createdAt: Date
  }
}

function getScoreLabel(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (score >= 80) return { label: "Great smile!", variant: "default" }
  if (score >= 50) return { label: "Nice!", variant: "secondary" }
  return { label: "Keep smiling!", variant: "outline" }
}

export function ScoreHero({ upload }: ScoreHeroProps) {
  const { label, variant } = getScoreLabel(upload.score)

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
        <img
          src={`/api/images/${upload.filename}`}
          alt="Latest upload"
          className="h-32 w-32 rounded-lg object-cover"
        />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold" data-testid="smile-score">
              {upload.score}
            </span>
            <span className="text-muted-foreground text-lg">/100</span>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <Progress value={upload.score} className="h-3" />
          <p className="text-muted-foreground text-sm">
            Uploaded {upload.createdAt.toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
