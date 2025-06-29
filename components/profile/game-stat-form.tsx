"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { differenceInDays, parseISO } from "date-fns"
import { useState } from "react"
import type { GameStatLog } from "@/lib/types"

const statSchema = z.object({
  rank: z.string().max(32).optional(),
  kd_ratio: z.coerce.number().min(0).max(99).optional(),
  f_d_ratio: z.coerce.number().min(0).max(99).optional(),
  matches_played: z.coerce.number().int().min(0).max(10000),
  season: z.string().max(32).optional(),
  headshot_percent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
})

type StatFormValues = z.infer<typeof statSchema>

interface GameStatFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userGameId: string
  lastLog?: GameStatLog | null
  onSubmitSuccess: () => void
}

export function GameStatForm({ open, onOpenChange, userGameId, lastLog, onSubmitSuccess }: GameStatFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const form = useForm<StatFormValues>({
    resolver: zodResolver(statSchema),
    defaultValues: { matches_played: 0 },
  })

  // Cooldown logic
  let cooldownDays = 0
  let cooldownActive = false
  if (lastLog?.created_at) {
    const last = parseISO(lastLog.created_at)
    cooldownDays = 7 - differenceInDays(new Date(), last)
    cooldownActive = cooldownDays > 0
  }

  const onSubmit = async (values: StatFormValues) => {
    if (cooldownActive) return
    setLoading(true)
    try {
      const { error } = await supabase.from("game_stat_logs").insert([
        { user_game_id: userGameId, ...values },
      ])
      if (error) throw error
      toast({ title: "Stats logged!", description: "Your weekly stats have been saved." })
      onOpenChange(false)
      onSubmitSuccess()
      form.reset()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Log Weekly Stats</DialogTitle>
          <DialogDescription className="text-gray-300">
            Enter your latest stats for this week. You can log new stats every 7 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rank">Rank</Label>
              <Input id="rank" {...form.register("rank")} className="bg-gray-800 border-gray-600" />
            </div>
            <div>
              <Label htmlFor="season">Season</Label>
              <Input id="season" {...form.register("season")} className="bg-gray-800 border-gray-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kd_ratio">K/D Ratio</Label>
              <Input id="kd_ratio" type="number" step="0.01" {...form.register("kd_ratio")} className="bg-gray-800 border-gray-600" />
            </div>
            <div>
              <Label htmlFor="f_d_ratio">F/D Ratio</Label>
              <Input id="f_d_ratio" type="number" step="0.01" {...form.register("f_d_ratio")} className="bg-gray-800 border-gray-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="matches_played">Matches Played</Label>
              <Input id="matches_played" type="number" {...form.register("matches_played", { valueAsNumber: true })} className="bg-gray-800 border-gray-600" />
            </div>
            <div>
              <Label htmlFor="headshot_percent">Headshot %</Label>
              <Input id="headshot_percent" type="number" step="0.01" {...form.register("headshot_percent")} className="bg-gray-800 border-gray-600" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} className="bg-gray-800 border-gray-600" />
          </div>
          {cooldownActive && (
            <div className="text-yellow-400 text-sm">Come back in {cooldownDays} day{cooldownDays !== 1 ? "s" : ""} to log new stats.</div>
          )}
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading || cooldownActive}>
            {loading ? "Saving..." : "Log Stats"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 