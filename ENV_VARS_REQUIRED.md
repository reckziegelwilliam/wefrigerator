# Required Environment Variables

This document lists all environment variables required for the wefrigerator application, especially for the external data ingestion feature.

## Supabase Configuration

### Client-side (Public)

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

### Server-side (Secret)

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ IMPORTANT:** This key has full database access. Never expose it client-side!

Required for:
- Data ingestion API routes (`/api/ingest/*`)
- Admin operations that bypass RLS

## Data Ingestion

### Ingestion Secret

```bash
INGEST_SECRET=your-random-secret-string
```

Purpose: Authenticates cron jobs and external requests to ingestion endpoints.

Generate a secure random string:
```bash
openssl rand -hex 32
```

**Add to:**
1. Local `.env.local`
2. Vercel environment variables (Settings → Environment Variables)
3. GitHub Secrets (Settings → Secrets → Actions) as `INGEST_SECRET`

## Node Environment

```bash
NODE_ENV=development
```

Set to `production` in deployment.

---

## Setup Checklist

- [ ] Create `.env.local` file in project root
- [ ] Add all required variables to `.env.local`
- [ ] Add variables to Vercel project settings
- [ ] Add `INGEST_SECRET` to GitHub repository secrets
- [ ] Never commit `.env.local` to git (it's in `.gitignore`)
- [ ] Share secrets securely with team members (use password manager)

## Vercel Deployment

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments
3. Redeploy to apply changes

## GitHub Actions

In GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add `INGEST_SECRET` as a repository secret
3. The workflow will use this to authenticate with your API

---

For local development, create a `.env.local` file with all these variables. This file is git-ignored for security.

