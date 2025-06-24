export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
  gender?: string
  phone?: string
  country?: string
}

export interface Game {
  id: string
  name: string
  genre: string
  platform: string
  icon_url?: string
  created_at: string
}

export interface UserGame {
  id: string
  user_id: string
  game_id: string
  rank?: string
  hours_played: number
  kd_ratio?: number
  notes?: string
  game_tag?: string
  created_at: string
  updated_at: string
  game?: Game
}

export interface Guide {
  id: string
  game_id: string
  title: string
  description?: string
  content?: any
  difficulty_level: string
  estimated_days: number
  created_at: string
  game?: Game
}

export interface DailyTask {
  id: string
  guide_id: string
  title: string
  description?: string
  task_order: number
  xp_reward: number
  created_at: string
}

export interface WeeklyMission {
  id: string
  guide_id: string
  title: string
  description?: string
  xp_reward: number
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  guide_id: string
  daily_task_id: string
  weekly_mission_id?: string
  completed_at: string
  streak_count: number
  total_xp: number
}

export interface NewsArticle {
  id: string
  title: string
  content?: string
  summary?: string
  image_url?: string
  source?: string
  genre?: string
  published_at?: string
  created_at: string
}

export interface PUBGTask {
  text: string;
  completed: boolean;
}

export interface PUBGDayPlan {
  day: string;
  focusArea: string;
  tasksList: PUBGTask[];
}

export interface PUBGWeeklyPlanner {
  title: string;
  subtitle: string;
  tasks: PUBGDayPlan[];
}
