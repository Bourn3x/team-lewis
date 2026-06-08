import { describe, it, expect } from "vitest"
import { MockScoreProvider } from "@/services/score-provider"
import type { ScoreProvider } from "@/services/score-provider"

describe("ScoreProvider interface", () => {
  it("MockScoreProvider implements ScoreProvider", () => {
    const provider: ScoreProvider = new MockScoreProvider()
    expect(provider.score).toBeTypeOf("function")
  })
})

describe("MockScoreProvider", () => {
  it("returns a score between 0 and 100", async () => {
    const provider = new MockScoreProvider()
    const score = await provider.score(Buffer.from("fake-image"))
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it("returns an integer", async () => {
    const provider = new MockScoreProvider()
    const score = await provider.score(Buffer.from("fake-image"))
    expect(Number.isInteger(score)).toBe(true)
  })

  it("returns a number (not NaN)", async () => {
    const provider = new MockScoreProvider()
    const score = await provider.score(Buffer.from("fake-image"))
    expect(score).not.toBeNaN()
  })

  it("simulates processing delay", async () => {
    const provider = new MockScoreProvider()
    const start = Date.now()
    await provider.score(Buffer.from("fake-image"))
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(100)
  })
})
