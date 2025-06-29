"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trophy, Clock, Target, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Game, UserGame, GameStatLog } from "@/lib/types"
import Image from "next/image"
import { GameStatForm } from "@/components/profile/game-stat-form"
import { differenceInDays, parseISO } from "date-fns"

export default function TrackerPage() {
  const [userGames, setUserGames] = useState<UserGame[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
  const [statLogs, setStatLogs] = useState<Record<string, GameStatLog[]>>({})
  const [logModal, setLogModal] = useState<{ open: boolean; userGameId?: string }>({ open: false })

  useEffect(() => {
    fetchUserGames()
    fetchGames()
  }, [])

  useEffect(() => {
    if (userGames.length > 0) {
      fetchAllStatLogs()
    }
    // eslint-disable-next-line
  }, [userGames])

  const fetchUserGames = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("user_games")
        .select(`
          *,
          game:games(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUserGames((data as unknown as UserGame[]) || [])
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

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase.from("games").select("*").order("name")

      if (error) throw error
      setGames((data as unknown as Game[]) || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchAllStatLogs = async () => {
    const logs: Record<string, GameStatLog[]> = {}
    for (const ug of userGames) {
      const { data, error } = await supabase
        .from("game_stat_logs")
        .select("*")
        .eq("user_game_id", ug.id)
        .order("created_at", { ascending: false })
        .limit(2)
      if (!error && data) logs[ug.id] = data as unknown as GameStatLog[]
    }
    setStatLogs(logs)
  }

  const handleAddGame = async (formData: FormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const gameId = formData.get("game_id") as string
      const rank = formData.get("rank") as string
      const hoursPlayed = Number.parseInt(formData.get("hours_played") as string) || 0
      const kdRatio = Number.parseFloat(formData.get("kd_ratio") as string) || null
      const gameTag = formData.get("game_tag") as string
      const notes = formData.get("notes") as string

      const { error } = await supabase.from("user_games").insert([
        {
          user_id: user.id,
          game_id: gameId,
          rank,
          hours_played: hoursPlayed,
          kd_ratio: kdRatio,
          game_tag: gameTag,
          notes,
        },
      ])

      if (error) throw error

      toast({
        title: "Game added!",
        description: "Your game has been added to your tracker.",
      })

      setIsAddDialogOpen(false)
      fetchUserGames()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase.from("user_games").delete().eq("id", gameId)

      if (error) throw error

      toast({
        title: "Game removed",
        description: "The game has been removed from your tracker.",
      })

      fetchUserGames()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading your games...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Tracker</h1>
            <p className="text-gray-300">Track your progress across all your favorite games</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New Game</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Add a game to your tracker to monitor your progress
                </DialogDescription>
              </DialogHeader>
              <form action={handleAddGame} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game_id">Game</Label>
                  <Select name="game_id" required disabled={games.length === 0}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder={games.length === 0 ? "No games found" : "Select a game"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id} className="text-white">
                          {game.name}
                        </SelectItem>
                      ))}
                      {games.length === 0 && (
                        <div className="px-4 py-2 text-gray-400">No games found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rank">Current Rank</Label>
                    <Input id="rank" name="rank" placeholder="e.g., Gold 2" className="bg-gray-800 border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours_played">Hours Played</Label>
                    <Input
                      id="hours_played"
                      name="hours_played"
                      type="number"
                      placeholder="0"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kd_ratio">K/D Ratio</Label>
                    <Input
                      id="kd_ratio"
                      name="kd_ratio"
                      type="number"
                      step="0.01"
                      placeholder="1.25"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game_tag">Game Tag</Label>
                    <Input
                      id="game_tag"
                      name="game_tag"
                      placeholder="Username#1234"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any additional notes about your gameplay..."
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  Add Game
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {userGames.length === 0 ? (
          <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-white mb-2">No games tracked yet</CardTitle>
              <CardDescription className="text-gray-300 mb-6">
                Start tracking your favorite games to monitor your progress and improvement
              </CardDescription>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Game
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGames.map((userGame) => {
              const logs = statLogs[userGame.id] || []
              const latest = logs[0]
              const prev = logs[1]
              // Growth comparison helpers
              const growth = (field: keyof GameStatLog) => {
                if (!latest || !prev || typeof latest[field] !== "number" || typeof prev[field] !== "number") return null
                const diff = (latest[field] as number) - (prev[field] as number)
                if (diff === 0) return <span className="text-gray-400 ml-2">+0</span>
                return (
                  <span className={diff > 0 ? "text-green-400 ml-2" : "text-red-400 ml-2"}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                  </span>
                )
              }
              // Cooldown logic
              let cooldownDays = 0
              let cooldownActive = false
              if (latest?.created_at) {
                const last = parseISO(latest.created_at)
                cooldownDays = 7 - differenceInDays(new Date(), last)
                cooldownActive = cooldownDays > 0
              }
              return (
                <Card key={userGame.id} className="bg-black/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-colors">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="flex items-center space-x-3 flex-1">
                      <Image
                        src={userGame.game?.icon_url || "/placeholder.svg?height=40&width=40"}
                        alt={userGame.game?.name || "Game"}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                      <div>
                        <CardTitle className="text-white text-lg">{userGame.game?.name}</CardTitle>
                        <CardDescription className="text-gray-400">{userGame.game?.platform}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400"
                        onClick={() => handleDeleteGame(userGame.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Rank</span>
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                        {latest?.rank || userGame.rank || "Unranked"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Matches
                      </span>
                      <span className="text-white font-medium">{latest?.matches_played ?? "-"}</span>
                      {growth("matches_played")}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        K/D
                      </span>
                      <span className="text-white font-medium">{latest?.kd_ratio ?? "-"}</span>
                      {growth("kd_ratio")}
                    </div>
                    {/* Growth comparison for F/D, headshot %, etc. */}
                    {typeof latest?.f_d_ratio === "number" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">F/D Ratio</span>
                        <span className="text-white font-medium">{latest.f_d_ratio}</span>
                        {growth("f_d_ratio")}
                      </div>
                    )}
                    {typeof latest?.headshot_percent === "number" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Headshot %</span>
                        <span className="text-white font-medium">{latest.headshot_percent}</span>
                        {growth("headshot_percent")}
                      </div>
                    )}
                    {latest?.season && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Season</span>
                        <span className="text-white font-medium">{latest.season}</span>
                      </div>
                    )}
                    {latest?.notes && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-gray-300 text-sm">{latest.notes}</p>
                      </div>
                    )}
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                      onClick={() => setLogModal({ open: true, userGameId: userGame.id })}
                      disabled={cooldownActive}
                    >
                      Log Weekly Stats
                    </Button>
                    {cooldownActive && (
                      <div className="text-yellow-400 text-xs mt-1">Come back in {cooldownDays} day{cooldownDays !== 1 ? "s" : ""} to log new stats.</div>
                    )}
                    <GameStatForm
                      open={logModal.open && logModal.userGameId === userGame.id}
                      onOpenChange={(open) => setLogModal({ open, userGameId: open ? userGame.id : undefined })}
                      userGameId={userGame.id}
                      lastLog={latest}
                      onSubmitSuccess={fetchAllStatLogs}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
