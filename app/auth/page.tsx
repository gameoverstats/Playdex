"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSignUp} className="space-y-4 w-full max-w-xs">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-purple-700 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  )
}
