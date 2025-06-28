"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { User, Settings, LogOut, Gamepad2, Search, Home } from "lucide-react"
import type { User as UserType, Game, Guide, NewsArticle } from "@/lib/types"

interface SearchResult {
  type: 'game' | 'guide' | 'news'
  id: string
  title: string
  subtitle?: string
  url: string
}

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setIsLoggedIn(true)
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single()
          
          if (profile) {
            setUser(profile as unknown as UserType)
          } else {
            setUser({
              id: authUser.id,
              email: authUser.email || "",
              name: authUser.email?.split("@")[0] || "User",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    
    return () => {
      listener?.subscription.unsubscribe()
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const results: SearchResult[] = []

      // Search games
      const { data: games } = await supabase
        .from('games')
        .select('id, name, genre')
        .ilike('name', `%${query}%`)
        .limit(3)

      if (games) {
        games.forEach(game => {
          results.push({
            type: 'game',
            id: game.id as string,
            title: game.name as string,
            subtitle: game.genre as string,
            url: `/tracker`
          })
        })
      }

      // Search guides
      const { data: guides } = await supabase
        .from('guides')
        .select('id, title, difficulty_level, game_id')
        .ilike('title', `%${query}%`)
        .limit(3)

      if (guides) {
        // Get game names for guides
        const guideIds = guides.map(guide => guide.game_id)
        const { data: gamesData } = await supabase
          .from('games')
          .select('id, name')
          .in('id', guideIds)

        const gamesMap = new Map()
        if (gamesData) {
          gamesData.forEach(game => gamesMap.set(game.id, game.name))
        }

        guides.forEach(guide => {
          results.push({
            type: 'guide',
            id: guide.id as string,
            title: guide.title as string,
            subtitle: `${guide.difficulty_level as string} • ${gamesMap.get(guide.game_id) || 'Unknown Game'}`,
            url: `/guide`
          })
        })
      }

      // Search news articles
      const { data: news } = await supabase
        .from('news_articles')
        .select('id, title, genre, source')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .limit(3)

      if (news) {
        news.forEach(article => {
          results.push({
            type: 'news',
            id: article.id as string,
            title: article.title as string,
            subtitle: `${article.genre as string} • ${article.source as string}`,
            url: `/`
          })
        })
      }

      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query)
    }, 300)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUser(null)
  }

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Gamepad2 className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold text-white">GameTracker</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 border-b border-purple-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">GameTracker</span>
            </Link>
            
            {isLoggedIn && (
              <>
                <Link href="/">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/tracker">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Tracker
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Guides
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    About
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search games, guides, news..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 w-80 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.url}
                        onClick={() => {
                          setShowSearchResults(false)
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                        className="block px-4 py-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{result.title}</div>
                            <div className="text-gray-400 text-sm">{result.subtitle}</div>
                          </div>
                          <div className="text-xs text-purple-400 uppercase">{result.type}</div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || "/placeholder-user.jpg"} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close search results */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </nav>
  )
}
