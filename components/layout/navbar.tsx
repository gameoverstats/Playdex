"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserName(user.email || "User")
        // Optionally fetch profile for avatar
        // setAvatarUrl(profile.avatar_url)
      } else {
        setIsLoggedIn(false)
        setUserName("")
        setAvatarUrl("")
      }
    }
    getUser()
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName("")
    setAvatarUrl("")
  }

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Link href="/home-page" className="font-bold text-xl">
          Gaming Tracker
        </Link>
        <div className="ml-8 flex space-x-4">
          <Link href="/home-page">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/tracker">
            <Button variant="ghost">Tracker</Button>
          </Link>
          <Link href="/guide">
            <Button variant="ghost">Guides</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Avatar>
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <Link href="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
