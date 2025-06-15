-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create games table
create table public.games (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    platform text not null,
    icon_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_games table (tracks user's games and stats)
create table public.user_games (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    game_id uuid references public.games(id) on delete cascade not null,
    rank text,
    hours_played integer default 0,
    kd_ratio numeric(4,2),
    game_tag text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, game_id)
);

-- Create guides table
create table public.guides (
    id uuid default uuid_generate_v4() primary key,
    game_id uuid references public.games(id) on delete cascade not null,
    title text not null,
    description text,
    difficulty_level text not null,
    estimated_days integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily_tasks table
create table public.daily_tasks (
    id uuid default uuid_generate_v4() primary key,
    guide_id uuid references public.guides(id) on delete cascade not null,
    title text not null,
    description text,
    task_order integer not null,
    xp_reward integer default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create weekly_missions table
create table public.weekly_missions (
    id uuid default uuid_generate_v4() primary key,
    guide_id uuid references public.guides(id) on delete cascade not null,
    title text not null,
    description text,
    xp_reward integer default 50,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_progress table
create table public.user_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    guide_id uuid references public.guides(id) on delete cascade not null,
    daily_task_id uuid references public.daily_tasks(id) on delete cascade,
    total_xp integer default 0,
    streak_count integer default 0,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create news_articles table
create table public.news_articles (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    summary text,
    content text,
    image_url text,
    source text,
    genre text,
    published_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index profiles_id_idx on public.profiles(id);
create index user_games_user_id_idx on public.user_games(user_id);
create index user_games_game_id_idx on public.user_games(game_id);
create index guides_game_id_idx on public.guides(game_id);
create index daily_tasks_guide_id_idx on public.daily_tasks(guide_id);
create index weekly_missions_guide_id_idx on public.weekly_missions(guide_id);
create index user_progress_user_id_idx on public.user_progress(user_id);
create index user_progress_guide_id_idx on public.user_progress(guide_id);
create index user_progress_daily_task_id_idx on public.user_progress(daily_task_id);
create index news_articles_published_at_idx on public.news_articles(published_at);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.user_games enable row level security;
alter table public.guides enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.weekly_missions enable row level security;
alter table public.user_progress enable row level security;
alter table public.news_articles enable row level security;

-- Create RLS Policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Games policies
create policy "Games are viewable by everyone"
    on public.games for select
    using (true);

create policy "Only admins can insert games"
    on public.games for insert
    with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Only admins can update games"
    on public.games for update
    using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- User games policies
create policy "Users can view their own games"
    on public.user_games for select
    using (auth.uid() = user_id);

create policy "Users can insert their own games"
    on public.user_games for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own games"
    on public.user_games for update
    using (auth.uid() = user_id);

create policy "Users can delete their own games"
    on public.user_games for delete
    using (auth.uid() = user_id);

-- Guides policies
create policy "Guides are viewable by everyone"
    on public.guides for select
    using (true);

create policy "Only admins can insert guides"
    on public.guides for insert
    with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Only admins can update guides"
    on public.guides for update
    using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Daily tasks policies
create policy "Daily tasks are viewable by everyone"
    on public.daily_tasks for select
    using (true);

create policy "Only admins can insert daily tasks"
    on public.daily_tasks for insert
    with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Only admins can update daily tasks"
    on public.daily_tasks for update
    using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Weekly missions policies
create policy "Weekly missions are viewable by everyone"
    on public.weekly_missions for select
    using (true);

create policy "Only admins can insert weekly missions"
    on public.weekly_missions for insert
    with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Only admins can update weekly missions"
    on public.weekly_missions for update
    using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- User progress policies
create policy "Users can view their own progress"
    on public.user_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert their own progress"
    on public.user_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own progress"
    on public.user_progress for update
    using (auth.uid() = user_id);

-- News articles policies
create policy "News articles are viewable by everyone"
    on public.news_articles for select
    using (true);

create policy "Only admins can insert news articles"
    on public.news_articles for insert
    with check (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Only admins can update news articles"
    on public.news_articles for update
    using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.games
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.user_games
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.guides
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.daily_tasks
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.weekly_missions
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.user_progress
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.news_articles
    for each row execute procedure public.handle_updated_at();
