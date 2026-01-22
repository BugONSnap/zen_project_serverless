# Zen Project Serverless - Codebase Overview

## Project Summary
**Zen Project** (also called "Zentry") is a SvelteKit-based learning platform for web development. It provides interactive quizzes, code playgrounds, guided learning modules, and community features.

## Tech Stack

### Core Framework
- **SvelteKit 2.16.0** - Full-stack framework
- **Svelte 5.0.0** - UI framework
- **TypeScript 5.0.0** - Type safety
- **Vite 6.2.6** - Build tool

### Database & ORM
- **PostgreSQL** (via Supabase) - Production database
- **Drizzle ORM 0.44.4** - Type-safe database queries
- **Drizzle Kit 0.30.2** - Database migrations and introspection

### Styling
- **Tailwind CSS 4.1.12** - Utility-first CSS
- **@tailwindcss/typography** - Typography plugin
- **@tailwindcss/vite** - Vite integration

### Authentication & Security
- **bcrypt** - Password hashing
- **crypto-js** - Client-side encryption (⚠️ insecure hardcoded key)
- **Session cookies** - Custom session management (not using Lucia despite app.d.ts reference)

### Additional Libraries
- **Chart.js 4.5.0** - Data visualization (for analytics)
- **@supabase/supabase-js** - Supabase client (though using direct PostgreSQL)

## Project Structure

```
zen_project_serverless/
├── src/
│   ├── app.css                    # Global styles
│   ├── app.d.ts                   # TypeScript declarations
│   ├── app.html                   # HTML template
│   ├── hooks.server.ts            # Server hooks (session management)
│   ├── lib/
│   │   ├── components/            # Reusable Svelte components
│   │   │   ├── CodeEditor.svelte  # Code editor with syntax highlighting
│   │   │   ├── Console.svelte     # Console output component
│   │   │   ├── Preview.svelte     # Live preview component
│   │   │   └── ConfirmationModal.svelte
│   │   ├── DashboardHeader.svelte # Main navigation header
│   │   ├── ResumeQuizNotice.svelte
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   └── schema.ts      # Database schema (Drizzle)
│   │   │   └── index.ts           # Database connection
│   │   └── types.ts               # TypeScript types
│   └── routes/                    # SvelteKit routes
│       ├── +layout.svelte         # Root layout
│       ├── +page.server.ts        # Root page (redirects to /landing)
│       ├── landing/               # Landing page
│       ├── login/                 # Login/Register page
│       ├── dashboard/             # User dashboard
│       ├── learn/                 # Learning modules
│       ├── quiz/                  # Quiz taking interface
│       ├── playground/            # Code playground
│       ├── profile/               # User profile
│       ├── leaderboard/           # Leaderboard
│       ├── community/             # Community posts
│       ├── admin/                 # Admin panel
│       │   ├── users/             # User management
│       │   ├── quizzes/           # Quiz management
│       │   └── analytics/         # System analytics
│       ├── html/                  # HTML quiz category
│       ├── css/                   # CSS quiz category
│       ├── javascript/            # JavaScript quiz category
│       ├── advancejs/             # Advanced JS quiz category
│       └── api/                   # API endpoints
│           ├── auth/              # Authentication endpoints
│           ├── quiz/              # Quiz-related endpoints
│           ├── profile/           # Profile endpoints
│           ├── playground/        # Playground endpoints
│           └── dashboard/         # Dashboard data
├── drizzle/                       # Database migrations
├── static/                        # Static assets
├── drizzle.config.ts              # Drizzle configuration
├── svelte.config.js               # SvelteKit configuration
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── seed.ts                        # Database seeding script
└── package.json                   # Dependencies
```

## Database Schema

### Core Tables

1. **users**
   - User accounts with authentication
   - Fields: id, username, email, passwordHash, uniqueInfo, userTypeId, totalPoints, rankId, adminLevel
   - adminLevel: 0 = super admin, 1 = admin, 2 = regular user

2. **userTypes**
   - User type classification
   - Values: STUDENT, PROFESSIONAL, HOBBYIST

3. **userRankings**
   - Ranking system based on points
   - Fields: rankName, minPoints, maxPoints

4. **quizCategories**
   - Quiz categories (e.g., HTML, CSS, JavaScript)
   - Fields: id, name

5. **challengeTypes**
   - Types of quiz challenges
   - Examples: "Multiple Choice", "Complete the Code", "Code Challenge", "Identification"
   - Fields: id, name, description, quizCategoryId

6. **quizzes**
   - Individual quiz questions/challenges
   - Fields: id, challengeTypeId, quizCategoryId, title, description, points, answer, explanation, difficulty, timeLimit, options (JSONB)
   - options: Contains question structure (varies by challenge type)

7. **userProgress**
   - Tracks user progress per category
   - Fields: userId, quizCategoryId, totalQuizzes, completedQuizzes, completionPercentage, lastQuizId, lastQuestionIndex
   - Supports bookmarking/resuming quizzes

8. **quizResults**
   - Records quiz attempts and results
   - Fields: userId, quizId, attemptDate, isCorrect, pointsEarned

9. **quizAttempts**
   - Tracks in-progress quiz attempts (for resume functionality)
   - Fields: userId, quizId, status (IN_PROGRESS | COMPLETED | ABANDONED), answers (JSONB), currentStep, timeRemaining
   - Unique constraint on (userId, quizId, status)

10. **codeSnippets**
    - User-saved code snippets in playground
    - Fields: userId, title, htmlCode, cssCode, jsCode, createdAt, updatedAt

11. **community**
    - Community posts/feedback
    - Fields: userId, content, rating (1-5), createdAt

12. **communityLikes**
    - Likes/dislikes on community posts
    - Fields: postId, userId, isLike (boolean)

13. **communityReplies**
    - Replies to community posts
    - Fields: postId, userId, content, createdAt

## Authentication Flow

### Current Implementation
- **Custom session management** using HTTP-only cookies
- Session cookie stores user ID
- `hooks.server.ts` validates session on each request
- Sets `locals.user` for authenticated requests

### Login Process
1. Client encrypts email/password with crypto-js (⚠️ hardcoded key: "your-secret-key")
2. POST to `/api/auth/login`
3. Server decrypts credentials
4. Validates with bcrypt against `passwordHash`
5. Sets `session` cookie (user ID) and `isAdmin` cookie
6. Returns user data

### Registration Process
1. POST to `/api/auth/register`
2. Validates userType (STUDENT, PROFESSIONAL, HOBBYIST)
3. Checks for existing username/email
4. Hashes password with bcrypt
5. Creates user with default rankId = 1

### Security Issues
- ⚠️ Hardcoded encryption key in login endpoint
- ⚠️ Client-side encryption provides false sense of security
- ⚠️ Session cookie only stores user ID (no token validation)
- ⚠️ No CSRF protection
- ⚠️ `app.d.ts` references Lucia auth but not actually used

## Main Features

### 1. Quiz System
- **Multiple quiz categories**: HTML, CSS, JavaScript, Advanced JS
- **Challenge types**:
  - Multiple Choice
  - Complete the Code
  - Code Challenge
  - Identification
- **Difficulty levels**: EASY, MEDIUM, HARD
- **Points system**: Users earn points for correct answers
- **Progress tracking**: Per-category completion tracking
- **Resume functionality**: Bookmark last quiz/question position
- **Quiz attempts**: Track in-progress quizzes

### 2. Code Playground
- Live HTML/CSS/JS editor
- Real-time preview
- Console output
- Save code snippets
- Code editor with line numbers and syntax highlighting

### 3. Learning Modules
- Guided learning paths
- Step-by-step lessons
- Category-based organization
- Search functionality

### 4. User Dashboard
- Overview of progress
- Category cards with completion stats
- Total points display
- Quick navigation to quizzes

### 5. Leaderboard
- Rankings based on totalPoints
- Only shows regular users (adminLevel = 2)
- Displays username and points

### 6. Community
- Post feedback/ratings (1-5 stars)
- Like/dislike posts
- Reply to posts
- View user types and post history

### 7. Admin Panel
- **Access control**: Super admin (level 0) and admin (level 1)
- **User Management**: View, edit, delete users
- **Quiz Management**: Create, update, delete quizzes
- **Analytics**: System statistics (total users, active quizzes, categories)

### 8. Profile
- View user information
- Progress per category
- Total points
- User type display
- Account deletion

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with encrypted credentials
- `POST /api/auth/register` - Register new user
- `POST /api/auth/reset-password` - Password reset (exists but not reviewed)
- `POST /api/auth/verify-email` - Email verification (exists but not reviewed)
- `POST /api/logout` - Clear session cookies

### Quiz
- `POST /api/quiz/submit` - Submit quiz answer
- `PATCH /api/quiz/bookmark` - Save quiz bookmark position
- `GET /api/quiz/bookmark` - Get quiz bookmark
- `GET /api/quiz/resume` - Get in-progress quiz attempt
- `POST /api/quiz/attempt` - Create/update quiz attempt

### Profile
- `GET /api/profile/progress` - Get user progress
- `POST /api/profile/update-username` - Update username
- `POST /api/profile/delete` - Delete account

### Playground
- `POST /api/playground/save` - Save code snippet

### Dashboard
- `GET /api/dashboard` - Get dashboard data

## Key Components

### CodeEditor.svelte
- Syntax highlighting
- Line numbers
- Tab support (indentation)
- Auto-resize (removed, uses flexbox)
- Language support: HTML, CSS, JavaScript

### DashboardHeader.svelte
- Main navigation
- User menu
- Responsive design
- Admin link (if admin)

### Console.svelte
- Console output display
- Error handling
- Log formatting

### Preview.svelte
- Live preview iframe
- HTML/CSS/JS execution
- Sandboxed environment

## Environment Variables

Required (from `env.production.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret (not currently used)
- `SESSION_SECRET` - Session secret (not currently used)
- `NODE_ENV` - Environment (development/production)

## Database Connection

- Uses PostgreSQL connection pool
- Connection string from `DATABASE_URL` env var
- SSL enabled in production
- Drizzle ORM with schema relations

## Development Workflow

### Setup
```bash
bun install
```

### Development
```bash
bun run dev
```

### Database
```bash
bun run db:generate    # Generate migrations
bun run db:push        # Push schema changes
bun run db:migrate     # Run migrations
bun run db:studio      # Open Drizzle Studio
bun run db:seed        # Seed database
```

### Build
```bash
bun run build
bun run preview
```

## Known Issues & Technical Debt

1. **Security**:
   - Hardcoded encryption key
   - Client-side encryption is ineffective
   - No CSRF protection
   - Session management could be more secure

2. **Type Safety**:
   - `app.d.ts` references Lucia auth but not used
   - Some type inconsistencies

3. **Database**:
   - Multiple database connection instances (some routes create new pools)
   - Admin page creates separate connection instead of using shared `db`

4. **Code Organization**:
   - Some duplicate database connection logic
   - Inconsistent error handling
   - Mixed patterns for data fetching

5. **Features**:
   - Quiz resume functionality partially implemented
   - Some API endpoints exist but may not be fully functional

## Architecture Patterns

- **Server-side rendering**: SvelteKit SSR
- **API routes**: RESTful endpoints in `/api`
- **Page load functions**: `+page.server.ts` for data fetching
- **Session management**: Custom implementation in hooks
- **Database queries**: Drizzle ORM with relations
- **Component-based UI**: Svelte components

## Future Improvements

1. Implement proper authentication (JWT or session tokens)
2. Move encryption key to environment variables
3. Add CSRF protection
4. Consolidate database connections
5. Improve error handling
6. Add input validation middleware
7. Implement rate limiting
8. Add comprehensive testing
9. Improve type safety
10. Add API documentation
