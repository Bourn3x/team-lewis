import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // No globalSetup — skip prisma db push for pure unit tests
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
