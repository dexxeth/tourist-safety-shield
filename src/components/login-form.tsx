"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"

export function LoginForm() {
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginMethod, setLoginMethod] = useState("email")
  const router = useRouter()
  const { login } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const identifier = loginData.emailOrPhone.trim()
    if (!identifier || !loginData.password) {
      toast({ title: "Missing credentials", description: "Please enter your email/phone and password." })
      setIsSubmitting(false)
      return
    }

    try {
      const ok = await login(identifier, loginData.password)
      if (ok) {
        toast({ title: "Welcome back", description: "Redirecting to your dashboard..." })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Something went wrong", description: "Please try again later." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    toast({ title: "Password reset", description: "A reset link would be sent to your email/phone." })
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <TabsContent value="email" className="space-y-4 mt-0">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.emailOrPhone}
                  onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 mt-0">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={loginData.emailOrPhone}
                  onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-border text-primary focus:ring-primary"
                  title="Remember me"
                  placeholder="Remember me"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary hover:underline p-0"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one here
            </Link>
          </p>
        </div>

        {/* Emergency Access */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Emergency Access</p>
            <Button variant="destructive" size="sm" className="w-full">
              Emergency SOS (No Login Required)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              For immediate emergency assistance without account access
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
