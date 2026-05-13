# GitFolio

Auto-generated dev portfolio and coding dashboard from GitHub activity.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NextAuth.js v5 (beta), Supabase (Postgres + Auth), Upstash Redis
- **Charts:** D3.js
- **Deployment:** Vercel

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: UI components (shadcn/ui), charts, and page-specific components.
- `lib/`: Shared utility functions and service clients (GitHub, Supabase, Redis).
- `hooks/`: Custom React hooks.

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Copy `.env.local` template and fill in the values:
   - `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: Create a new OAuth App on GitHub
   - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your Supabase project settings
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: From your Upstash Redis console
4. **Run development server:**
   ```bash
   npm run dev
   ```

## Coding Standards
- Strict TypeScript (no `any`).
- Use Server Components where possible.
- GitHub API calls must go through `lib/github.ts`.
- Cache heavy data in Redis.
