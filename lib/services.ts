import { MockScoreProvider } from "@/services/score-provider"
import { FileService } from "@/services/file-service"

export const scoreProvider = new MockScoreProvider()
export const fileService = new FileService()
