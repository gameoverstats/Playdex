"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, CheckCircle, Circle, Flame } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Guide, DailyTask, WeeklyMission, UserProgress } from "@/lib/types"
import Image from "next/image"

export default function GuidePage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [weeklyMissions, setWeeklyMissions] = useState<WeeklyMission[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchGuides()
  }, [])

  useEffect(() => {
    if (selectedGuide) {
      fetchGuideTasks(selectedGuide.id)
      fetchUserProgress(selectedGuide.id)
    }
  }, [selectedGuide])

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from("guides")
        .select(`
          *,
          game:games(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setGuides(data || [])
      if (data && data.length > 0) {
        setSelectedGuide(data[0])
      }
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

  const fetchGuideTasks = async (guideId: string) => {
    try {
      const [tasksResult, missionsResult] = await Promise.all([
        supabase.from("daily_tasks").select("*").eq("guide_id", guideId).order("task_order"),
        supabase.from("weekly_missions").select("*").eq("guide_id", guideId),
      ])

      if (tasksResult.error) throw tasksResult.error
      if (missionsResult.error) throw missionsResult.error

      setDailyTasks(tasksResult.data || [])
      setWeeklyMissions(missionsResult.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchUserProgress = async (guideId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("guide_id", guideId)

      if (error) throw error
      setUserProgress(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async (taskId: string, xpReward: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !selectedGuide) return

      // Check if task is already completed today
      const today = new Date().toISOString().split("T")[0]
      const existingProgress = userProgress.find(
        (p) => p.daily_task_id === taskId && new Date(p.completed_at).toISOString().split("T")[0] === today,
      )

      if (existingProgress) {
        toast({
          title: "Already completed",
          description: "You've already completed this task today!",
        })
        return
      }

      const { error } = await supabase.from("user_progress").insert([
        {
          user_id: user.id,
          guide_id: selectedGuide.id,
          daily_task_id: taskId,
          total_xp: xpReward,
        },
      ])

      if (error) throw error

      toast({
        title: "Task completed!",
        description: `You earned ${xpReward} XP!`,
      })

      fetchUserProgress(selectedGuide.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const isTaskCompletedToday = (taskId: string) => {
    const today = new Date().toISOString().split("T")[0]
    return userProgress.some(
      (p) => p.daily_task_id === taskId && new Date(p.completed_at).toISOString().split("T")[0] === today,
    )
  }

  const getTotalXP = () => {
    return userProgress.reduce((total, progress) => total + progress.total_xp, 0)
  }

  const getStreakCount = () => {
    // Simple streak calculation - in a real app, this would be more sophisticated
    const today = new Date().toISOString().split("T")[0]
    const todayProgress = userProgress.filter((p) => new Date(p.completed_at).toISOString().split("T")[0] === today)
    return todayProgress.length > 0 ? Math.max(...todayProgress.map((p) => p.streak_count)) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading guides...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Improvement Guides</h1>
          <p className="text-gray-300">Follow structured plans to rank up and improve your gameplay</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Guide Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Available Guides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guides.map((guide) => (
                  <Button
                    key={guide.id}
                    variant={selectedGuide?.id === guide.id ? "default" : "ghost"}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      selectedGuide?.id === guide.id
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={guide.game?.icon_url || "/placeholder.svg?height=32&width=32"}
                        alt={guide.game?.name || "Game"}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                      <div className="text-left">
                        <div className="font-medium">{guide.title}</div>
                        <div className="text-xs opacity-70">{guide.game?.name}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedGuide ? (
              <div className="space-y-6">
                {/* Guide Header */}
                <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={selectedGuide.game?.icon_url || "/placeholder.svg?height=64&width=64"}
                          alt={selectedGuide.game?.name || "Game"}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                        <div>
                          <CardTitle className="text-white text-2xl">{selectedGuide.title}</CardTitle>
                          <CardDescription className="text-gray-300 mt-1">{selectedGuide.description}</CardDescription>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                              {selectedGuide.difficulty_level}
                            </Badge>
                            <span className="text-sm text-gray-400">{selectedGuide.estimated_days} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-orange-400 mb-1">
                          <Flame className="h-4 w-4" />
                          <span className="font-bold">{getStreakCount()}</span>
                        </div>
                        <div className="text-sm text-gray-400">day streak</div>
                        <div className="text-purple-400 font-bold mt-2">{getTotalXP()} XP</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Tasks and Missions */}
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
                    <TabsTrigger
                      value="daily"
                      className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
                    >
                      Daily Tasks
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-600"
                    >
                      Weekly Missions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="space-y-4">
                    {dailyTasks.map((task) => (
                      <Card key={task.id} className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 rounded-full ${
                                  isTaskCompletedToday(task.id)
                                    ? "text-green-400 hover:text-green-300"
                                    : "text-gray-400 hover:text-white"
                                }`}
                                onClick={() => handleCompleteTask(task.id, task.xp_reward)}
                                disabled={isTaskCompletedToday(task.id)}
                              >
                                {isTaskCompletedToday(task.id) ? (
                                  <CheckCircle className="h-6 w-6" />
                                ) : (
                                  <Circle className="h-6 w-6" />
                                )}
                              </Button>
                              <div>
                                <h3
                                  className={`font-medium ${
                                    isTaskCompletedToday(task.id) ? "text-green-400 line-through" : "text-white"
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                <p className="text-sm text-gray-400">{task.description}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                              +{task.xp_reward} XP
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-4">
                    {weeklyMissions.map((mission) => (
                      <Card key={mission.id} className="bg-black/50 border-purple-500/20 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Trophy className="h-6 w-6 text-yellow-400" />
                              <div>
                                <h3 className="font-medium text-white">{mission.title}</h3>
                                <p className="text-sm text-gray-400">{mission.description}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                              +{mission.xp_reward} XP
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="bg-black/50 border-purple-500/20 backdrop-blur-sm text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-white mb-2">Select a Guide</CardTitle>
                  <CardDescription className="text-gray-300">
                    Choose a guide from the sidebar to start your improvement journey
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
