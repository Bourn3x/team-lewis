import { execSync } from "child_process"

export default function globalSetup() {
  execSync(
    "npx prisma db push --force-reset --url file:./prisma/test.db",
    {
      env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "I confirm this is a test database reset" },
      stdio: "inherit",
    }
  )
}
