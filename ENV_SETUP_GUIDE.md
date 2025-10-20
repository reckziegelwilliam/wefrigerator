# Environment Variables Setup Guide

Complete guide to configuring environment variables for the Community Fridge application.

---

## 🎯 Required Environment Variables

Your application needs **exactly 2 environment variables** to run:

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **What it is:** Your Supabase project URL
- **Format:** `https://xxxxxxxxxxxxx.supabase.co`
- **Where to find it:** Supabase Dashboard → Settings → API → Project URL
- **Used for:** Connecting to your Supabase database
- **Public:** Yes (safe to expose in browser)

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **What it is:** Your Supabase anonymous/public API key
- **Format:** Long JWT string starting with `eyJ...`
- **Where to find it:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Used for:** Authenticating API requests with Row Level Security
- **Public:** Yes (safe to expose, protected by RLS policies)

---

## 📋 Quick Setup (3 Steps)

### Step 1: Create `.env.local`

```bash
# From project root
cp .env.example .env.local
```

Or create manually:
```bash
touch .env.local
```

### Step 2: Get Your Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create one)
3. Click **Settings** (⚙️) → **API**
4. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### Step 3: Add to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the placeholder values with your actual credentials!**

---

## ✅ Verification

### Test Your Configuration

**1. Check file exists:**
```bash
ls -la .env.local
```

**2. Verify values are set:**
```bash
cat .env.local
```
Should show your actual Supabase URL and key (not placeholder text)

**3. Start development server:**
```bash
npm run dev
```

**4. Open in browser:**
```
http://localhost:3000
```

**5. Test authentication:**
- Click "Sign In"
- Enter your email
- Check for magic link in inbox

If authentication works, your environment is configured correctly! ✅

---

## 🔒 Security Best Practices

### ✅ Safe to Expose (NEXT_PUBLIC_*)

These variables are **intentionally public** and safe to expose in the browser:

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Why it's safe:**
- Protected by Row Level Security (RLS) policies
- Can only access data users are permitted to see
- Cannot bypass RLS rules
- Supabase designed these to be public

### ⚠️ NEVER Expose (Server-only)

**DO NOT use these in your frontend** (not needed for this app):

- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Bypasses all RLS!
- ❌ `SUPABASE_DB_URL` - Direct database access
- ❌ Database passwords
- ❌ Any API keys for external services

**Note:** This app doesn't use service role key. All operations go through RLS-protected API.

---

## 🚀 Deployment Environments

### Local Development

**File:** `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Start server:**
```bash
npm run dev
```

### Production (Vercel)

**Don't commit `.env.local` to git!**

Instead, add environment variables in Vercel dashboard:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

**Environment scopes:**
- Production ✅
- Preview ✅ (optional)
- Development ✅ (optional)

### Other Hosting Platforms

**Netlify:**
- Site settings → Environment variables
- Add both NEXT_PUBLIC_* variables

**Railway:**
- Variables tab
- Add both variables

**Docker:**
```dockerfile
ENV NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Or use docker-compose with env_file.

---

## 🔧 Troubleshooting

### Error: "URL and API key are required"

**Cause:** Environment variables not set or not loaded

**Solutions:**
1. Make sure `.env.local` exists in project root
2. Restart dev server (`Ctrl+C` then `npm run dev`)
3. Check values are actual credentials, not placeholder text
4. Verify no typos in variable names

### Error: "Invalid JWT"

**Cause:** Wrong API key or expired key

**Solutions:**
1. Go to Supabase → Settings → API
2. Copy the **anon public** key (not service_role!)
3. Replace in `.env.local`
4. Restart dev server

### Magic Links Not Working

**Cause:** Redirect URL not configured

**Solution:**
1. Go to Supabase → Authentication → URL Configuration
2. Add to "Redirect URLs":
   - `http://localhost:3000/auth/callback` (local)
   - `https://your-domain.com/auth/callback` (production)

### Build Failing with Missing Env Vars

**For testing builds locally:**
```bash
# Set inline for build test
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder \
npm run build
```

**For production builds:**
- Vercel/Netlify/etc. automatically inject env vars
- Make sure they're set in platform dashboard

---

## 📊 Environment Variable Checklist

### Before Local Development
- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set with actual value
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set with actual value
- [ ] Values are NOT placeholder text
- [ ] Dev server restarted after creating file
- [ ] Can access http://localhost:3000

### Before Production Deployment
- [ ] `.env.local` is in `.gitignore` (already done ✅)
- [ ] Environment variables added to hosting platform
- [ ] Both variables set in production scope
- [ ] Supabase redirect URLs updated with production domain
- [ ] Test authentication on production URL

### Security Checklist
- [ ] Using `anon` key, NOT `service_role` key ✅
- [ ] `.env.local` never committed to git ✅
- [ ] No hardcoded credentials in code ✅
- [ ] RLS policies enabled on all tables ✅
- [ ] Environment variables documented ✅

---

## 🎓 Common Questions

### Q: Why are these variables prefixed with `NEXT_PUBLIC_`?

**A:** Next.js exposes variables with this prefix to the browser. Variables without this prefix are server-only. Since Supabase client needs to run in the browser, we use `NEXT_PUBLIC_`.

### Q: Is it safe to expose these keys?

**A:** Yes! The anon key is designed to be public. It's protected by:
- Row Level Security (RLS) policies on all tables
- Supabase's security model
- Rate limiting on Supabase side

### Q: Do I need the service role key?

**A:** No! This app doesn't use it. All operations go through RLS-protected APIs. Service role key bypasses RLS and should only be used in trusted server environments.

### Q: Can I use different Supabase projects for dev/prod?

**A:** Yes! Use different values in:
- `.env.local` for development (local Supabase project)
- Vercel env vars for production (production Supabase project)

This keeps test data separate from production.

### Q: What if I rotate my API keys?

**A:** 
1. Generate new key in Supabase → Settings → API
2. Update `.env.local` locally
3. Update environment variables in Vercel
4. Redeploy (Vercel does this automatically)

---

## 📝 Template Files

### Minimal `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### With Comments
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### For Build Testing (placeholder values)
```env
# These work for testing builds but won't connect to actual database
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder
```

---

## 🔗 Related Documentation

- **Setup:** See `QUICK_START.md` for complete setup instructions
- **Deployment:** See `DEPLOYMENT.md` for production deployment
- **Troubleshooting:** See `IMPORTANT_NOTES.md` for common issues
- **Security:** See `README.md` security section

---

## ✅ Quick Reference

| Variable | Required | Public | Where to Find |
|----------|----------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | ✅ Yes | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | ✅ Yes | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | ❌ No | Not needed for this app |

---

**Need help?** Check `QUICK_START.md` for a 10-minute setup guide!

**Last Updated:** 2025-10-20  
**Required Variables:** 2  
**Optional Variables:** 0 (for V1)

