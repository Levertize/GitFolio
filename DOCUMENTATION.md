# 📚 GitFolio Comprehensive Setup Documentation

Welcome to the GitFolio documentation! This guide will walk you through the entire setup process, from obtaining API keys to deploying the application to production.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Variables Overview](#2-environment-variables-overview)
3. [GitHub OAuth Application Setup](#3-github-oauth-application-setup)
4. [Supabase Setup (Database & Realtime)](#4-supabase-setup)
5. [Upstash Redis Setup (Caching)](#5-upstash-redis-setup)
6. [Local Development](#6-local-development)
7. [Vercel Deployment](#7-vercel-deployment)

---

## 1. Prerequisites

Before you begin, ensure you have the following accounts created:
- A [GitHub](https://github.com/) account (to create the OAuth App)
- A [Supabase](https://supabase.com/) account (for PostgreSQL database)
- An [Upstash](https://upstash.com/) account (for Redis caching)
- A [Vercel](https://vercel.com/) account (for deployment)
- [Node.js](https://nodejs.org/) installed (v18 or higher recommended)

---

## 2. Environment Variables Overview

Create a `.env.local` file in the root of your project. It should look exactly like this:

```env
# NextAuth / Auth.js
AUTH_SECRET="generate-a-random-secret-key-here"
AUTH_URL="http://localhost:3000" # Change to your live URL in production

# GitHub OAuth
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

*To generate a random `AUTH_SECRET`, you can run `npx auth secret` in your terminal or use `openssl rand -base64 32`.*

---

## 3. GitHub OAuth Application Setup

GitFolio uses GitHub for authentication and to fetch repository statistics.

1. Go to your GitHub Settings -> Developer settings -> [OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Fill in the details:
   - **Application name:** `GitFolio` (or your preferred name)
   - **Homepage URL:** `http://localhost:3000` (or your live production URL)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**.
5. Copy the **Client ID** and paste it as `GITHUB_ID` in your `.env.local`.
6. Click **Generate a new client secret**, copy it immediately (it will only be shown once), and paste it as `GITHUB_SECRET` in your `.env.local`.

*Note: For production, you will need to create a second OAuth app with your live Vercel URL, or update these URLs later.*

---

## 4. Supabase Setup

GitFolio uses Supabase (PostgreSQL) to store user profiles, customization settings, and cached GitHub statistics.

1. Create a new project in your [Supabase Dashboard](https://database.supabase.com/).
2. Once the project is provisioned, go to **Project Settings -> API**.
3. Copy the **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **`anon` `public` API Key** to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the **`service_role` `secret` API Key** to `SUPABASE_SERVICE_ROLE_KEY`.

### Running Migrations (Database Schema)

You need to create the necessary tables in Supabase. You have two options:

**Option A: Using Supabase CLI (Recommended)**
If you have the Supabase CLI installed, you can link your project and push the migrations located in the `/supabase/migrations` folder:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

**Option B: Using Supabase SQL Editor**
1. Go to the **SQL Editor** in your Supabase Dashboard.
2. Open the `/supabase/migrations` folder in your local code editor.
3. Copy the contents of the SQL files and run them **in sequential order**:
   - `20260513000000_initial_schema.sql`
   - `20260513000001_settings_schema.sql`
   - `20260514000000_activity_feed.sql`
   - `20260514000001_about_me_rich.sql`

---

## 5. Upstash Redis Setup

GitFolio uses Redis to cache heavy GitHub API calls, preventing rate limits and ensuring instant page loads.

1. Go to your [Upstash Console](https://console.upstash.com/).
2. Click **Create Database**.
3. Name it `gitfolio-cache` and choose a region close to your Supabase/Vercel deployment.
4. Once created, scroll down to the **REST API** section.
5. Copy the **UPSTASH_REDIS_REST_URL** and paste it into your `.env.local`.
6. Copy the **UPSTASH_REDIS_REST_TOKEN** and paste it into your `.env.local`.

---

## 6. Local Development

With all your environment variables set, you are ready to run the project locally.

1. Install all dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.
4. Click **Login with GitHub**. You should be redirected to the Dashboard where you can customize your portfolio!

---

## 7. Vercel Deployment

Deploying GitFolio to production is seamless with Vercel.

1. Push your code to a GitHub repository.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New -> Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** tab in the Vercel setup screen.
5. Copy all the variables from your `.env.local` file and paste them here.
   - **Crucial Step:** Ensure you change `AUTH_URL` to your production URL (e.g., `https://gitfolio.app`).
6. Click **Deploy**.

### Finalizing Production OAuth
Once Vercel gives you your live URL (e.g., `https://my-gitfolio.vercel.app`):
1. Go back to GitHub Developer Settings.
2. Create a NEW OAuth App for Production (or edit the existing one).
3. Update the Homepage URL to `https://my-gitfolio.vercel.app`
4. Update the Callback URL to `https://my-gitfolio.vercel.app/api/auth/callback/github`
5. Replace the `GITHUB_ID` and `GITHUB_SECRET` in Vercel with the ones from this Production OAuth App.

**Congratulations! Your GitFolio is now live and ready to be shared with the world.**
