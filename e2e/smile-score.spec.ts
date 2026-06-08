import { test, expect } from "@playwright/test"
import path from "path"

test.describe("Smile Score App", () => {
  const testEmail = `test-${Date.now()}@example.com`

  test("full flow: register, upload image, see score", async ({ page }) => {
    // 1. Visit home — should redirect to /register
    await page.goto("/")
    await expect(page).toHaveURL(/\/register/)

    // 2. Register
    await page.fill('[name="name"]', "Test User")
    await page.fill('[name="email"]', testEmail)
    await page.click('button[type="submit"]')

    // 3. Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole("heading", { name: "Welcome, Test User" })).toBeVisible()

    // 4. Upload an image
    const filePath = path.resolve("e2e/fixtures/test-image.jpg")
    await page.locator('input[type="file"]').setInputFiles(filePath)
    await page.click('button:has-text("Get Smile Score")')

    // 5. Should see smile score (router.refresh() re-renders server component with new upload)
    await expect(page.locator('[data-testid="smile-score"]')).toBeVisible({
      timeout: 10000,
    })

    const scoreText = await page
      .locator('[data-testid="smile-score"]')
      .textContent()
    const score = parseInt(scoreText || "0")
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  test("shows validation error for non-image file", async ({ page }) => {
    // Register first
    await page.goto("/register")
    await page.fill('[name="name"]', "Validator")
    await page.fill('[name="email"]', `validate-${Date.now()}@example.com`)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)

    // Try uploading a text file
    const buffer = Buffer.from("not an image")
    await page.locator('input[type="file"]').setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer,
    })
    await page.click('button:has-text("Get Smile Score")')

    // Should see validation error
    await expect(page.getByText(/JPEG|PNG|WebP/i)).toBeVisible()
  })

  test("register page redirects to dashboard if already logged in", async ({
    page,
  }) => {
    // Register
    await page.goto("/register")
    await page.fill('[name="name"]', "Redirect Test")
    await page.fill('[name="email"]', `redirect-${Date.now()}@example.com`)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)

    // Visit /register again — should redirect back to dashboard
    await page.goto("/register")
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
