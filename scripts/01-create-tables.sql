-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT,
  platform TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_games table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  rank TEXT,
  hours_played INTEGER DEFAULT 0,
  kd_ratio DECIMAL(4,2),
  notes TEXT,
  game_tag TEXT, -- e.g., Valorant#1234
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Create guides table
CREATE TABLE IF NOT EXISTS public.guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB, -- Store guide steps/content
  difficulty_level TEXT, -- beginner, intermediate, advanced
  estimated_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES public.guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_order INTEGER,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weekly_missions table
CREATE TABLE IF NOT EXISTS public.weekly_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES public.guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES public.guides(id) ON DELETE CASCADE,
  daily_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  weekly_mission_id UUID REFERENCES public.weekly_missions(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak_count INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  UNIQUE(user_id, guide_id, daily_task_id)
);

-- Create news_articles table (optional)
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  image_url TEXT,
  source TEXT,
  genre TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own games" ON public.user_games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own games" ON public.user_games
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for games, guides, tasks, missions, news
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can view guides" ON public.guides FOR SELECT USING (true);
CREATE POLICY "Anyone can view daily tasks" ON public.daily_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can view weekly missions" ON public.weekly_missions FOR SELECT USING (true);
CREATE POLICY "Anyone can view news articles" ON public.news_articles FOR SELECT USING (true);
