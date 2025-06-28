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

INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days)
SELECT 
  g.id,
  'Silver to Gold Guide',
  'Advanced strategies and team coordination to reach Gold rank',
  'intermediate',
  30
FROM public.games g WHERE g.name = 'Valorant';

INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days)
SELECT 
  g.id,
  'CS2 Aim Mastery',
  'Complete aim training program for Counter-Strike 2 players',
  'advanced',
  45
FROM public.games g WHERE g.name = 'Counter-Strike 2';

INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days)
SELECT 
  g.id,
  'Apex Legends Positioning Guide',
  'Master positioning and rotation strategies for Apex Legends',
  'intermediate',
  25
FROM public.games g WHERE g.name = 'Apex Legends';

INSERT INTO public.guides (game_id, title, description, difficulty_level, estimated_days)
SELECT 
  g.id,
  'Overwatch 2 Support Guide',
  'Comprehensive guide for support heroes and team healing',
  'beginner',
  20
FROM public.games g WHERE g.name = 'Overwatch 2';

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
('CS2 Major Tournament Announced', 'Counter-Strike 2 Major tournament dates and participating teams revealed...', 'The next CS2 Major will feature a $1M prize pool', '/placeholder.svg?height=200&width=400', 'Valve', 'FPS', NOW() - INTERVAL '3 days'),
('Apex Legends Season 20 Launch', 'New season brings major meta changes and new legend abilities...', 'Season 20 introduces new ranked system and legend buffs', '/placeholder.svg?height=200&width=400', 'EA', 'Battle Royale', NOW() - INTERVAL '5 days'),
('Overwatch 2 Hero Reworks', 'Major changes to support heroes and tank balancing...', 'Mercy and Ana receive significant ability updates', '/placeholder.svg?height=200&width=400', 'Blizzard', 'FPS', NOW() - INTERVAL '1 week'),
('Rocket League Championship Series', 'RLCS 2024-25 season format announced with new regions...', 'New season features expanded prize pool and regional qualifiers', '/placeholder.svg?height=200&width=400', 'Psyonix', 'Sports', NOW() - INTERVAL '1 week');

-- Insert esports news articles
INSERT INTO public.news_articles (title, content, summary, image_url, source, genre, published_at) VALUES
('Team Liquid Wins Valorant Champions 2024', 'Team Liquid defeats Fnatic in a thrilling 5-game series to claim the championship...', 'Liquid becomes the first North American team to win Valorant Champions', '/placeholder.svg?height=200&width=400', 'Riot Games', 'esports', NOW() - INTERVAL '4 hours'),
('T1 Crowned League of Legends World Champions', 'T1 defeats JDG in a dominant 3-1 series to win their fourth world championship...', 'Faker leads T1 to another world title in Seoul', '/placeholder.svg?height=200&width=400', 'Riot Games', 'esports', NOW() - INTERVAL '1 day'),
('NAVI Wins CS2 Major Championship', 'NAVI defeats FaZe Clan in overtime to claim the CS2 Major title...', 's1mple leads NAVI to victory in the first CS2 Major', '/placeholder.svg?height=200&width=400', 'Valve', 'esports', NOW() - INTERVAL '2 days'),
('TSM Wins Apex Legends Global Series', 'TSM dominates the ALGS Championship with ImperialHal leading the charge...', 'TSM secures their third ALGS championship title', '/placeholder.svg?height=200&width=400', 'EA', 'esports', NOW() - INTERVAL '3 days'),
('NRG Esports Wins Rocket League Championship', 'NRG defeats G2 Esports in a spectacular 7-game series...', 'GarrettG and JSTN lead NRG to another RLCS championship', '/placeholder.svg?height=200&width=400', 'Psyonix', 'esports', NOW() - INTERVAL '4 days'),
('Cloud9 Wins Overwatch League Grand Finals', 'Cloud9 defeats Seoul Dynasty to claim the Overwatch League championship...', 'C9 becomes the first Western team to win OWL since 2019', '/placeholder.svg?height=200&width=400', 'Blizzard', 'esports', NOW() - INTERVAL '5 days');
