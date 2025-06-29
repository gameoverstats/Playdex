"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Gamepad2, Mail, Lock, User } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Form submit event fired');
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const username = formData.get("username") as string
    const isSignUp = e.currentTarget.dataset.mode === "signup"

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: username,
            }
          }
        })

        if (error) throw error

        if (data.user) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          })
          router.push("/profile")
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in.",
          })
          router.push("/")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication")
      console.error("Authentication error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-black/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">GameTracker</CardTitle>
          <CardDescription className="text-gray-300">
            Track your games, improve your skills, dominate the leaderboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
              <TabsTrigger
                value="signin"
                className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSubmit} data-mode="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                  onClick={() => console.log('Sign In button clicked')}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} data-mode="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-gray-300">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      required
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                  onClick={() => console.log('Sign Up button clicked')}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {error && (
            <div className="text-red-500 text-sm text-center mt-4">{error}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
