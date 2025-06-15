-- Insert sample games
INSERT INTO public.games (name, genre, platform, icon_url) VALUES
('Valorant', 'FPS', 'PC', '/placeholder.svg?height=64&width=64'),
('League of Legends', 'MOBA', 'PC', '/placeholder.svg?height=64&width=64'),
('Counter-Strike 2', 'FPS', 'PC', '/placeholder.svg?height=64&width=64'),
('Apex Legends', 'Battle Royale', 'PC/Console', '/placeholder.svg?height=64&width=64'),
('Overwatch 2', 'FPS', 'PC/Console', '/placeholder.svg?height=64&width=64'),
('Rocket League', 'Sports', 'PC/Console', '/placeholder.svg?height=64&width=64');

-- Insert sample guides
INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days) 
SELECT 
  g.id,
  'Bronze to Silver Guide',
  'Complete guide to ranking up from Bronze to Silver with daily practice routines',
  'beginner',
  14
FROM public.games g WHERE g.name = 'Valorant';

INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days)
SELECT 
  g.id,
  'Iron to Bronze Guide', 
  'Master the fundamentals and climb from Iron to Bronze rank',
  'beginner',
  21
FROM public.games g WHERE g.name = 'League of Legends';

-- Insert sample daily tasks
INSERT INTO public.daily_tasks (guide_id, title, description, task_order, xp_reward)
SELECT 
  g.id,
  'Aim Training - 30 minutes',
  'Complete 30 minutes of aim training in Aim Lab or Kovaaks',
  1,
  15
FROM public.guides g WHERE g.title = 'Bronze to Silver Guide';

INSERT INTO public.daily_tasks (guide_id, title, description, task_order, xp_reward)
SELECT 
  g.id,
  'Play 3 Competitive Matches',
  'Focus on crosshair placement and communication',
  2,
  25
FROM public.guides g WHERE g.title = 'Bronze to Silver Guide';

INSERT INTO public.daily_tasks (guide_id, title, description, task_order, xp_reward)
SELECT 
  g.id,
  'Review VOD',
  'Watch and analyze one of your recent matches',
  3,
  20
FROM public.guides g WHERE g.title = 'Bronze to Silver Guide';

-- Insert sample weekly missions
INSERT INTO public.weekly_missions (guide_id, title, description, xp_reward)
SELECT 
  g.id,
  'Win 10 Competitive Matches',
  'Focus on consistent performance and teamwork',
  100
FROM public.guides g WHERE g.title = 'Bronze to Silver Guide';

-- Insert sample news articles
INSERT INTO public.news_articles (title, content, summary, image_url, source, genre, published_at) VALUES
('Valorant Episode 8 Act 2 Patch Notes', 'Latest updates to Valorant including agent changes and map updates...', 'New patch brings balance changes to Jett and Raze', '/placeholder.svg?height=200&width=400', 'Riot Games', 'FPS', NOW() - INTERVAL '2 hours'),
('League of Legends World Championship 2024', 'The biggest tournament in esports is here with teams from around the world...', 'Worlds 2024 features 22 teams competing for the championship', '/placeholder.svg?height=200&width=400', 'Riot Games', 'MOBA', NOW() - INTERVAL '1 day'),
('CS2 Major Tournament Announced', 'Counter-Strike 2 Major tournament dates and participating teams revealed...', 'The next CS2 Major will feature a $1M prize pool', '/placeholder.svg?height=200&width=400', 'Valve', 'FPS', NOW() - INTERVAL '3 days');
