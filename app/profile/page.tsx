"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, Trophy, Target, Calendar, Flame, Star, Camera, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User, UserGame, UserProgress } from "@/lib/types"
import Image from "next/image"

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark",
  "Finland", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Greece",
  "Portugal", "Ireland", "Australia", "New Zealand", "Japan", "South Korea", "China",
  "India", "Brazil", "Argentina", "Mexico", "Chile", "Colombia", "Peru", "Venezuela",
  "South Africa", "Egypt", "Nigeria", "Kenya", "Morocco", "Algeria", "Tunisia",
  "Russia", "Ukraine", "Belarus", "Kazakhstan", "Uzbekistan", "Azerbaijan", "Georgia",
  "Armenia", "Turkey", "Iran", "Iraq", "Saudi Arabia", "UAE", "Qatar", "Kuwait",
  "Bahrain", "Oman", "Yemen", "Jordan", "Lebanon", "Syria", "Israel", "Palestine"
].sort()

interface ProfileFormData {
  name: string
  email: string
  gender: string
  phone: string
  country: string
  bio: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userGames, setUserGames] = useState<UserGame[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProfileFormData>({
    name: "",
    email: "",
    gender: "",
    phone: "",
    country: "",
    bio: ""
  })
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

      let userProfile: User | null = null
      if (profileError && profileError.code !== "PGRST116") throw profileError
      if (profile) {
        userProfile = profile as unknown as User
        setForm({
          name: (profile.name as string) || "",
          email: (profile.email as string) || authUser.email || "",
          gender: (profile.gender as string) || "",
          phone: (profile.phone as string) || "",
          country: (profile.country as string) || "",
          bio: (profile.bio as string) || ""
        })
      } else {
        // Fallback: create a default profile from authUser
        userProfile = {
          id: authUser.id,
          email: authUser.email ?? "",
          name: authUser.email?.split("@")[0] ?? "User",
          avatar_url: undefined,
          bio: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setForm({
          name: authUser.email?.split("@")[0] || "",
          email: authUser.email || "",
          gender: "",
          phone: "",
          country: "",
          bio: ""
        })
      }
      setUser(userProfile)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message);

      // ✅ Save to Supabase
      const imageUrl = json.url;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: imageUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (updateError) throw updateError;

      setUser({ ...user, avatar_url: imageUrl });
      toast({ title: "Avatar updated!", description: "Success!" });

    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)

      // Validate required fields
      if (!form.name.trim()) {
        throw new Error("Username is required")
      }

      if (!form.email.trim()) {
        throw new Error("Email is required")
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: form.name.trim(),
          email: form.email.trim(),
          gender: form.gender.trim(),
          phone: form.phone.trim(),
          country: form.country.trim(),
          bio: form.bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({ 
        ...user, 
        name: form.name.trim(),
        email: form.email.trim()
      })
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
    } finally {
      setLoading(false)
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
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name || "User"} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-300">Username *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="bg-gray-800 border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-300">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="bg-gray-800 border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                          <Select value={form.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="country" className="text-gray-300">Country</Label>
                          <Select value={form.country} onValueChange={(value) => handleSelectChange("country", value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
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
                      <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                      <p className="text-gray-300 mt-1">{user.bio || "No bio yet - click edit to add one!"}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.gender && (
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {user.gender}
                          </Badge>
                        )}
                        {user.country && (
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                            {user.country}
                          </Badge>
                        )}
                        {user.phone && (
                          <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                            {user.phone}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {!isEditing && (
                <div className="flex space-x-2">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative overflow-hidden border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                      disabled={loading}
                    >
                      <Camera className="h-10 w-4 mr-2" />
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">Total XP</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTotalXP()}</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Tasks Completed</span>
              </div>
              <p className="text-2xl font-bold text-white">{getCompletedTasks()}</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-gray-300">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{getCurrentStreak()}</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">Hours Played</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTotalHours()}</p>
            </CardContent>
          </Card>
        </div>

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
