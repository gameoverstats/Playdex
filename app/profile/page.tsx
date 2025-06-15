"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, Trophy, Target, Calendar, Flame, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User, UserGame, UserProgress } from "@/lib/types"
import Image from "next/image"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userGames, setUserGames] = useState<UserGame[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError) throw profileError
      setUser(profile as unknown as User)

      // Fetch user games
      const { data: games, error: gamesError } = await supabase
        .from("user_games")
        .select(`
          *,
          game:games(*)
        `)
        .eq("user_id", authUser.id)

      if (gamesError) throw gamesError
      setUserGames((games as unknown as UserGame[]) || [])

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", authUser.id)

      if (progressError) throw progressError
      setUserProgress((progress as unknown as UserProgress[]) || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      if (!user) return

      const username = formData.get("username") as string
      const bio = formData.get("bio") as string

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: username,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, full_name: username, bio })
      setIsEditing(false)

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getTotalXP = () => {
    return userProgress.reduce((total, progress) => total + progress.total_xp, 0)
  }

  const getCompletedTasks = () => {
    return userProgress.length
  }

  const getCurrentStreak = () => {
    // Simple streak calculation
    return userProgress.length > 0 ? Math.max(...userProgress.map((p) => p.streak_count)) : 0
  }

  const getTotalHours = () => {
    return userGames.reduce((total, game) => total + game.hours_played, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Please sign in to view your profile</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {isEditing ? (
                    <form action={handleUpdateProfile} className="space-y-3">
                      <div>
                        <Label htmlFor="username" className="text-gray-300">
                          Username
                        </Label>
                        <Input
                          id="username"
                          name="username"
                          defaultValue={user.full_name}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-gray-300">
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          defaultValue={user.bio || ""}
                          placeholder="Tell us about yourself..."
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          className="border-gray-600 text-gray-300 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-white">{user.full_name}</h1>
                      <p className="text-gray-300 mt-1">{user.bio || "No bio yet - click edit to add one!"}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getTotalXP()}</div>
              <div className="text-sm text-gray-400">Total XP</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getCompletedTasks()}</div>
              <div className="text-sm text-gray-400">Tasks Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getCurrentStreak()}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{getTotalHours()}</div>
              <div className="text-sm text-gray-400">Hours Played</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger
              value="games"
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
            >
              My Games
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
            >
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            {userGames.length === 0 ? (
              <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm text-center py-8">
                <CardContent>
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-white mb-2">No games tracked yet</CardTitle>
                  <CardDescription className="text-gray-300">Start tracking games to see them here</CardDescription>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {userGames.map((userGame) => (
                  <Card key={userGame.id} className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Image
                          src={userGame.game?.icon_url || "/placeholder.svg?height=40&width=40"}
                          alt={userGame.game?.name || "Game"}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-white">{userGame.game?.name}</h3>
                          <p className="text-sm text-gray-400">{userGame.game?.platform}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Rank</span>
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {userGame.rank || "Unranked"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Hours</span>
                          <span className="text-white">{userGame.hours_played}</span>
                        </div>
                        {userGame.kd_ratio && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">K/D</span>
                            <span className="text-white">{userGame.kd_ratio}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm text-center py-8">
              <CardContent>
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-white mb-2">Achievements Coming Soon</CardTitle>
                <CardDescription className="text-gray-300">
                  We're working on an achievement system to celebrate your progress!
                </CardDescription>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
