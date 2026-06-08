export interface ScoreProvider {
  score(imageBuffer: Buffer): Promise<number>
}

export class MockScoreProvider implements ScoreProvider {
  private delayMs: number

  constructor(delayMs = 800) {
    this.delayMs = delayMs
  }

  async score(_imageBuffer: Buffer): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    return Math.round(Math.random() * 100)
  }
}
