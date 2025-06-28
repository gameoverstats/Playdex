# Gaming Tracker App

A comprehensive gaming tracker application built with Next.js, Tailwind CSS, and Supabase.

## Features

### 🏠 Homepage
- **Latest News Section**: Displays recent gaming news articles with images, summaries, and metadata
- **Esports Highlights**: Dedicated section for esports news and tournament results
- **Recent Guides**: Shows the latest improvement guides with difficulty levels and game associations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading Skeletons**: Smooth loading experience with skeleton placeholders

### 🔍 Universal Search
- **Debounced Search**: Real-time search with 300ms debounce for optimal performance
- **Multi-Table Search**: Searches across games, guides, and news articles simultaneously
- **Categorized Results**: Results are organized by type (Games, Guides, News)
- **Smart Navigation**: Click results to navigate to relevant pages

### 🧭 Navigation
- **Home Button**: Easy access to the homepage from any page
- **Responsive Navbar**: Clean navigation with search bar and user profile
- **Dark Theme**: Modern dark UI with purple accent colors

### 🎮 Game Tracking
- Track your favorite games with detailed statistics
- Monitor rank progression and performance metrics
- Add notes and custom game tags

### 📚 Improvement Guides
- Structured improvement plans for various games
- Daily tasks and weekly missions
- Progress tracking with XP rewards

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React

## Database Schema

The app uses the following main tables:
- `profiles`: User profiles and preferences
- `games`: Available games with metadata
- `user_games`: User's game tracking data
- `guides`: Improvement guides and tutorials
- `news_articles`: Gaming news and esports content
- `daily_tasks` & `weekly_missions`: Guide progression system

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up your Supabase project and add environment variables
4. Run the database migrations: `scripts/01-create-tables.sql`
5. Seed the database: `scripts/02-seed-data.sql`
6. Start the development server: `pnpm dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features in Detail

### Homepage Sections

1. **Latest News**: Fetches from `news_articles` table, sorted by `published_at`
2. **Esports Highlights**: Filters news articles where `genre = 'esports'`
3. **Recent Guides**: Shows guides with associated game information

### Search Functionality

The universal search queries:
- `games.name` for game titles
- `guides.title` for guide titles  
- `news_articles.title` and `summary` for news content

Results are categorized and include relevant metadata for easy identification.

### Responsive Design

The homepage uses CSS Grid with responsive breakpoints:
- Mobile: 1 column layout
- Tablet: 2 column layout  
- Desktop: 3 column layout for news/guides, 2 column for esports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 