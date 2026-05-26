The goal:

On the Home page, detect the Telegram user (chat_id, first_name, etc.).

On the backend (/api/auth/telegram):

Check if the user exists in users + user_profiles.

If not, create them (using Supabase service key).

Return a server-generated JWT session (access_token + refresh_token).

On the frontend:

Call supabase.auth.setSession(...) with the tokens.

User is now logged in automatically.

# Display their info.

# Agroeco Farmer App

A mobile-first Next.js web app for farmers, delivered as a Telegram Mini App. Features farm management, community forum, learning hub, interactive maps, and a marketplace — all authenticated via Telegram.

## Tech Stack

- **Framework**: Next.js 15.5.2 (App Router, Turbopack)
- **Language**: TypeScript 5 / React 19
- **Styling**: Tailwind CSS 4 + Radix UI + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Telegram Mini App + Supabase JWT sessions
- **Deployment**: Cloudflare Workers (`@opennextjs/cloudflare`)

## Prerequisites

- Node.js 18+
- npm
- A Supabase project
- A Telegram Bot (for Mini App auth)
- A weather API key (e.g. OpenWeatherMap)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_WEATHER_API_KEY=<your-weather-api-key>
```

Get your Supabase credentials from your [Supabase project dashboard](https://supabase.com/dashboard) under **Project Settings → API**.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── auth/          # Login, signup, confirm, signout
│   ├── dashboard/     # User dashboard
│   ├── forum/         # Community forum & post detail
│   ├── knowledge/     # Guides and success stories
│   ├── map/           # Farm map & profile
│   ├── resource/      # Marketplace, cart, favorites
│   └── create-farm/   # Farm creation wizard
├── components/        # Reusable UI components
│   ├── ui/            # Base components (button, card, input…)
│   ├── farmmap/       # Interactive map components
│   ├── forum/         # Forum-specific components
│   ├── learninghub/   # Learning hub components
│   └── Marketplace/   # E-commerce components
├── lib/               # Utilities & API clients
│   ├── api/           # API helper functions
│   ├── supabase/      # Supabase client & helpers
│   └── telegram/      # Telegram auth logic
├── context/           # React Context (auth, profile)
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

## Authentication Flow (Telegram Mini App)

1. The home page detects the Telegram user (`chat_id`, `first_name`, etc.) via `@twa-dev/sdk`.
2. A request is sent to `/api/auth/telegram` with the Telegram init data.
3. The server verifies the Telegram hash, then checks if the user exists in Supabase.
4. If the user doesn't exist, they are created in `users` + `user_profiles` using the Supabase service key.
5. The server returns a JWT session (`access_token` + `refresh_token`).
6. The frontend calls `supabase.auth.setSession(...)` — the user is now logged in.

## Deployment

The project is configured for **Cloudflare Workers** via `@opennextjs/cloudflare`.

```bash
npm run build
# then deploy with Wrangler or your Cloudflare CI pipeline
```

A GitLab CI/CD pipeline is defined in `.gitlab-ci.yml` with `test → build → deploy` stages.
