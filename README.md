# Gaming Tracker App

A comprehensive gaming progress tracking application built with Next.js, TypeScript, and Supabase.

## Features

### 🎮 Profile Management
- **Complete Profile Setup**: Users can create and manage their gaming profiles with:
  - Username and email
  - Gender selection
  - Phone number
  - Country selection (60+ countries)
  - Bio/description
  - Profile picture upload
- **Profile Editing**: In-place editing of all profile fields
- **Avatar Management**: Upload and change profile pictures with Supabase storage

### 🏆 Game Tracking
- Track multiple games with detailed statistics
- Record hours played, rank, K/D ratio
- View gaming progress and achievements
- Monitor streaks and XP gains

### 📚 Gaming Guides
- Access to game-specific guides and tutorials
- Daily tasks and weekly missions
- Progress tracking for skill improvement

### 🔐 Authentication
- Secure user authentication with Supabase Auth
- Email verification
- Protected routes and profile management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gaming-tracker-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:
     - `01-create-tables.sql` - Creates all database tables
     - `02-seed-data.sql` - Adds sample data
     - `03-create-storage.sql` - Sets up storage for avatars

5. Start the development server:
```bash
pnpm dev
```

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    gender TEXT,
    phone TEXT,
    country TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Games Table
```sql
CREATE TABLE user_games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    game_id UUID REFERENCES games(id),
    rank TEXT,
    hours_played INTEGER DEFAULT 0,
    kd_ratio NUMERIC(4,2),
    game_tag TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Profile Setup Flow

1. **User Registration**: Users sign up with email and password
2. **Profile Setup**: New users are redirected to `/profile-setup` to complete their profile
3. **Profile Management**: Users can edit their profile from `/profile` page
4. **Avatar Upload**: Profile pictures are stored in Supabase storage

### Profile Fields

- **Username** (required): Display name for the user
- **Email** (required): User's email address
- **Gender** (optional): Male, Female, Other, or Prefer not to say
- **Phone** (optional): Contact phone number
- **Country** (optional): User's country from 60+ options
- **Bio** (optional): Personal description and gaming interests
- **Avatar** (optional): Profile picture uploaded to Supabase storage

## File Structure

```
gaming-tracker-app/
├── app/
│   ├── auth/              # Authentication pages
│   ├── profile/           # Profile management
│   ├── profile-setup/     # Profile setup flow
│   ├── tracker/           # Game tracking
│   └── guide/             # Gaming guides
├── components/
│   ├── auth/              # Authentication components
│   ├── profile/           # Profile management components
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── types.ts           # TypeScript type definitions
├── scripts/               # Database setup scripts
└── public/                # Static assets
```

## Key Components

### ProfileSetupForm
Located at `components/profile/profile-setup-form.tsx`
- Comprehensive form for initial profile setup
- Avatar upload functionality
- Form validation and error handling
- Responsive design with mobile support

### ProfilePage
Located at `app/profile/page.tsx`
- Profile display and editing
- Gaming statistics dashboard
- User games and achievements tabs
- In-place editing with form validation

### AuthForm
Located at `components/auth/auth-form.tsx`
- Sign up and sign in functionality
- Integration with Supabase Auth
- Automatic redirect to profile setup after signup

## API Endpoints

The app uses Supabase for all backend functionality:

- **Authentication**: `supabase.auth.*`
- **Profiles**: `supabase.from('profiles')`
- **User Games**: `supabase.from('user_games')`
- **Storage**: `supabase.storage.from('avatars')`

## Styling

The app uses a dark gaming theme with:
- Purple accent colors (`purple-600`, `purple-700`)
- Dark backgrounds with transparency
- Backdrop blur effects
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 