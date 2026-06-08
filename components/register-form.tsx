"use client"

import { useActionState } from "react"
import { register } from "@/app/actions/auth"
import type { RegisterState } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    register,
    null
  )

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>
          Enter your details to start scoring smiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
