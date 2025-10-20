# ⚠️ wefrigerator - Important Notes - Read Before Starting

## Critical Setup Steps

### 1. Environment Variables
Before running the app, you MUST create `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - from Supabase Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase Settings → API

### 2. Database Migrations
Run ALL THREE migrations in Supabase SQL Editor IN ORDER:

1. `supabase/migrations/001_initial_schema.sql` (creates tables)
2. `supabase/migrations/002_rls_policies.sql` (security)
3. `supabase/migrations/003_storage_buckets.sql` (photo storage)

**⚠️ Don't skip any migrations or change the order!**

### 3. First Admin User
After signing up:

1. Sign in to the app with your email
2. Go to Supabase dashboard → Table Editor → `profile`
3. Find your user row
4. Change `role` column from `'contributor'` to `'admin'`
5. Refresh the app

**Without this step, you won't be able to access admin features!**

## Common Gotchas

### ❌ Magic Links Not Working
**Problem:** Can't sign in, links don't work

**Solution:**
1. Check Supabase → Authentication → URL Configuration
2. Add your domain to "Redirect URLs":
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

### ❌ Photos Not Uploading
**Problem:** Upload button doesn't work

**Solution:**
1. Verify storage bucket exists: Supabase → Storage → `photos`
2. Make sure bucket is PUBLIC
3. Check file is under 3MB
4. Use JPG, PNG, or WebP format only

### ❌ Map Not Showing
**Problem:** Blank map on home page

**Solution:**
1. Make sure you have at least one fridge in the database
2. Check fridge has valid `lat` and `lng` coordinates
3. Look for JavaScript errors in browser console

### ❌ Permission Denied Errors
**Problem:** "permission denied" or "not authorized" errors

**Solution:**
1. Make sure you ran migration `002_rls_policies.sql`
2. Verify you're signed in (check for user in top right)
3. Check your role in the `profile` table
4. Clear browser cache and try again

### ❌ Build Fails
**Problem:** `npm run build` shows errors

**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm run type-check` to find TypeScript errors
4. Make sure `.env.local` exists (even with dummy values for build)

## Security Warnings

### 🔒 Never Commit Secrets
- `.env.local` is in `.gitignore` - keep it there!
- Never commit Supabase keys to Git
- Use Vercel environment variables for production

### 🔒 Use Anon Key Only
- Frontend should ONLY use `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- NEVER use Service Role Key in frontend code
- Service Role Key bypasses RLS - dangerous!

### 🔒 Row Level Security
- All tables have RLS enabled
- Don't disable RLS in production
- Test with different user roles

## Performance Tips

### 🚀 Image Optimization
- Photos are auto-resized to 1200x1200
- EXIF data is stripped for privacy
- Keep original under 3MB for best UX

### 🚀 Database Queries
- Status queries are indexed by `fridge_id` and `created_at`
- Limit results to avoid slow queries
- Use pagination for large lists (future enhancement)

### 🚀 Map Loading
- Map loads Leaflet CSS dynamically
- First load might be slower
- Consider adding a loading state (future enhancement)

## Development Workflow

### Local Development
\`\`\`bash
npm run dev          # Start dev server with hot reload
npm run type-check   # Check TypeScript errors
npm run lint         # Run ESLint
npm run build        # Test production build
\`\`\`

### Before Committing
1. Run `npm run type-check` - should pass with no errors
2. Test key features manually
3. Check for console errors
4. Review changes in Git

### Before Deploying
1. Test build: `npm run build`
2. Review environment variables
3. Check Supabase migrations are applied
4. Test auth flow end-to-end
5. Verify admin account exists

## File Size Limits

- **Photos:** 3MB max (enforced in form)
- **Note fields:** 500 characters
- **Item request details:** 120 characters
- **Route check notes:** 500 characters

## Browser Requirements

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Not Supported:**
- Internet Explorer (any version)
- Very old browser versions

## Supabase Limits (Free Tier)

- **Database:** 500MB
- **Storage:** 1GB
- **Bandwidth:** 2GB/month
- **Auth:** Unlimited users
- **API Requests:** 50,000/month

**When to upgrade:** When you hit these limits or need better performance

## Vercel Limits (Hobby Tier)

- **Bandwidth:** 100GB/month
- **Build time:** 100 hours/month
- **Function executions:** Unlimited
- **Storage:** 100GB

**When to upgrade:** If you need more bandwidth or commercial use

## Known Limitations (V1)

- ❌ No automated tests
- ❌ No email notifications (manual only)
- ❌ No SMS notifications
- ❌ No offline support
- ❌ English only (no i18n)
- ❌ No mobile app
- ❌ No CSV import/export
- ❌ No advanced analytics
- ❌ No rate limiting (relies on Supabase defaults)

These are planned for V2+

## Quick Reference

### User Roles
- `visitor` - Can view only (not used, all need account)
- `contributor` - Can post updates, request items (default)
- `volunteer` - Can claim routes + contributor permissions
- `admin` - Full access to everything

### Status Types
- `open` - Fridge accessible
- `stocked` - Recently restocked
- `needs` - Low on supplies
- `closed` - Unavailable

### Request Status
- `open` - Still needed
- `fulfilled` - Request met
- `withdrawn` - No longer needed

### Route Assignment Status
- `claimed` - Route claimed, not started
- `completed` - Route finished
- `missed` - Route not completed

## Getting Help

### Documentation
1. **Quick Start:** Read `QUICK_START.md` first
2. **Full Setup:** See `README.md`
3. **Deployment:** Follow `DEPLOYMENT.md`
4. **Checklist:** Use `SETUP_CHECKLIST.md`

### Troubleshooting
1. Check this file for common issues
2. Search GitHub issues
3. Check browser console for errors
4. Review Vercel deployment logs
5. Check Supabase logs

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## Before You Launch

Final checklist before going live:

- [ ] All migrations run in Supabase
- [ ] Admin account created
- [ ] At least 1 real fridge added
- [ ] Photo upload tested
- [ ] Magic link auth tested on production
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] Team members invited
- [ ] Backup plan in place
- [ ] Monitoring set up

## After Launch

Don't forget to:

- [ ] Monitor error logs daily
- [ ] Check reports weekly
- [ ] Gather user feedback
- [ ] Plan iteration based on usage
- [ ] Set up regular backups
- [ ] Document any customizations

---

**Need immediate help?** Start with `QUICK_START.md` for the fastest setup!

**Ready to deploy?** Follow `DEPLOYMENT.md` step by step.

**Building a team?** Share `README.md` with developers.

Good luck with wefrigerator! 🎉

