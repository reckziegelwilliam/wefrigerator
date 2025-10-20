# wefrigerator - Deployment Guide

This guide will walk you through deploying the wefrigerator application to production.

## Prerequisites

- A Supabase account and project
- A Vercel account (or other hosting platform)
- Git repository hosted on GitHub/GitLab/Bitbucket

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name:** wefrigerator (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely)
   - **Region:** Choose closest to your users
5. Click "Create new project" and wait for setup to complete

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of each migration file in order:

   **First:** `supabase/migrations/001_initial_schema.sql`
   - Creates all database tables
   - Click "Run" after pasting

   **Second:** `supabase/migrations/002_rls_policies.sql`
   - Sets up Row Level Security policies
   - Click "Run" after pasting

   **Third:** `supabase/migrations/003_storage_buckets.sql`
   - Creates storage buckets for photos
   - Click "Run" after pasting

4. Verify tables were created:
   - Go to **Table Editor**
   - You should see: profile, fridge, fridge_status, fridge_inventory, etc.

### 1.3 (Optional) Add Sample Data

If you want to start with sample data:

1. Go to **SQL Editor**
2. Copy and paste contents of `supabase/seed.sql`
3. Click "Run"
4. Go to **Table Editor** → `fridge` to see 5 sample fridges

### 1.4 Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following values (you'll need them for Vercel):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon public** key (long string starting with `eyJ...`)

## Step 2: Deploy to Vercel

### 2.1 Push Code to Git

If you haven't already:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

### 2.2 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### 2.3 Add Environment Variables

In the Vercel project settings, add these environment variables:

| Name | Value |
|------|-------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase Project URL |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Your Supabase Anon Key |

Click "Deploy" when done.

### 2.4 Configure Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Step 3: Configure Supabase for Production

### 3.1 Add Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-custom-domain.com/auth/callback` (if using custom domain)
3. Click "Save"

### 3.2 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the magic link email template
3. Add your branding and messaging

## Step 4: Create Admin Account

### 4.1 Sign Up Through the App

1. Visit your deployed app
2. Click "Sign In"
3. Enter your email
4. Check email for magic link
5. Click the link to sign in

### 4.2 Promote to Admin

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → `profile`
3. Find your user row
4. Click on the `role` cell
5. Change value from `'contributor'` to `'admin'`
6. Save the change

### 4.3 Verify Admin Access

1. Refresh your app
2. You should now see admin links in the navigation
3. Try accessing `/admin/fridges` and `/admin/routes`

## Step 5: Add Your First Fridge

As an admin:

1. Go to **Manage Fridges**
2. Click "Add Fridge"
3. Enter fridge details:
   - Name
   - Description
   - Address
   - Coordinates (use [latlong.net](https://www.latlong.net/) to find coordinates)
   - Accessibility options
4. Save

## Step 6: Invite Volunteers

### 6.1 Have Users Sign Up

Share your app URL with volunteers and have them sign up.

### 6.2 Promote Users to Volunteer

1. Go to Supabase dashboard → **Table Editor** → `profile`
2. Find the user
3. Change their `role` to `'volunteer'`
4. They can now access `/volunteer/routes`

### 6.3 Create Routes

1. As admin, go to **Manage Routes**
2. Click "Create Route"
3. Add fridges to the route
4. Volunteers can now claim these routes

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Usage

- **Vercel Analytics:** Check `/admin/reports` for app analytics
- **Supabase Dashboard:** Monitor database usage and API calls
- **Error Tracking:** Check Vercel deployment logs

### 7.2 Database Backups

Supabase automatically backs up your database. To download a backup:

1. Go to **Database** → **Backups**
2. Click "Download" on any backup

### 7.3 Regular Maintenance

- **Weekly:** Check `/admin/reports` for high-need fridges
- **Monthly:** Review user roles and permissions
- **As Needed:** Add new fridges and routes

## Troubleshooting

### Magic Links Not Working

1. Check Supabase **Authentication** → **URL Configuration**
2. Verify redirect URLs match your deployed domain
3. Check email spam folder

### Photos Not Uploading

1. Verify storage bucket was created (Step 1.2)
2. Check Supabase **Storage** → `photos` bucket exists
3. Verify bucket is set to public

### Map Not Loading

1. Check browser console for errors
2. Verify Leaflet CSS is loading
3. Check that fridges have valid lat/lng coordinates

### RLS Errors

If you see "permission denied" errors:

1. Verify all RLS policies were created (Step 1.2)
2. Check Supabase **Authentication** → user is logged in
3. Verify user profile exists in `profile` table

## Security Checklist

Before going live:

- [ ] RLS policies are enabled on all tables
- [ ] Environment variables are set in Vercel
- [ ] Supabase redirect URLs are configured
- [ ] Storage buckets have proper permissions
- [ ] Admin accounts are secured
- [ ] Rate limiting is configured (Supabase default)

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. For additional optimization:

1. Use Vercel's Edge Network (enabled by default)
2. Consider adding ISR (Incremental Static Regeneration) for fridge listings

### Database Indexes

The migrations already include necessary indexes. Monitor slow queries in Supabase and add indexes as needed.

## Support

If you encounter issues:

1. Check [Next.js Documentation](https://nextjs.org/docs)
2. Check [Supabase Documentation](https://supabase.com/docs)
3. Review GitHub issues
4. Check Vercel deployment logs

## Scaling

As your app grows:

1. **Supabase:** Upgrade plan for more storage and bandwidth
2. **Vercel:** Upgrade for more bandwidth and build time
3. **Database:** Add read replicas if needed
4. **CDN:** Consider adding a CDN for photos

## Next Steps

After successful deployment:

1. Share the app with your community
2. Train volunteers on using the system
3. Gather feedback and iterate
4. Monitor usage and adjust routes as needed

---

**Need Help?** Open an issue on GitHub or contact your development team.

