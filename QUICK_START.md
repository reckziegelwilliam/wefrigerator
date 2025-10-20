# wefrigerator - Quick Start Guide

Get the wefrigerator app running in under 10 minutes!

## 1. Prerequisites (2 minutes)

Make sure you have:
- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- A Supabase account (free tier works)

## 2. Install Dependencies (1 minute)

\`\`\`bash
npm install
\`\`\`

## 3. Set Up Supabase (3 minutes)

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details and create

### Run Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Copy/paste `supabase/migrations/001_initial_schema.sql` → Run
3. Copy/paste `supabase/migrations/002_rls_policies.sql` → Run
4. Copy/paste `supabase/migrations/003_storage_buckets.sql` → Run
5. (Optional) Copy/paste `supabase/seed.sql` → Run (adds sample data)

### Get Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** and **Anon Key**

## 4. Configure Environment (1 minute)

Create `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

Replace `your_project_url_here` and `your_anon_key_here` with values from step 3.

## 5. Start the App (1 minute)

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 6. Create Admin Account (2 minutes)

1. Click "Sign In" in the app
2. Enter your email
3. Check email for magic link
4. Click the link
5. Go to Supabase → **Table Editor** → `profile`
6. Find your user row
7. Change `role` to `'admin'`
8. Refresh the app

**Done!** You're now an admin and can:
- Add fridges at `/admin/fridges`
- Create routes at `/admin/routes`
- View reports at `/admin/reports`

## Next Steps

### Add Your First Fridge

1. Go to "Manage Fridges"
2. Click "Add Fridge"
3. Fill in:
   - Name: "Mission District Community Fridge"
   - Address: "123 Main St, San Francisco, CA"
   - Latitude: 37.7749 (use [latlong.net](https://latlong.net))
   - Longitude: -122.4194
   - Check "24/7 Access" and "Wheelchair Accessible" if applicable
4. Save

### Post a Status Update

1. Click on your fridge
2. Click "Post Update"
3. Select status (e.g., "Stocked")
4. Add a note
5. Upload a photo (optional)
6. Toggle inventory items
7. Submit

### Create a Volunteer Route

1. Go to "Manage Routes"
2. Click "Create Route"
3. Name it: "Downtown Route"
4. Add description
5. Add fridges to the route
6. Save

### Invite Volunteers

1. Share the app URL with volunteers
2. Have them sign up with email
3. In Supabase, change their `role` to `'volunteer'`
4. They can now claim routes at `/volunteer/routes`

## Troubleshooting

### Magic link not working?
- Check spam folder
- Verify Supabase email settings
- Try a different email provider

### Map not showing?
- Check browser console for errors
- Verify fridges have lat/lng coordinates
- Make sure you have at least one fridge

### Can't upload photos?
- Check browser console
- Verify storage bucket was created
- Ensure photo is under 3MB
- Use JPG, PNG, or WebP format

### Permission denied?
- Verify RLS policies were applied (step 3)
- Make sure you're signed in
- Check your role in the profile table

## Production Deployment

Ready to go live? See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick version:
1. Push to GitHub
2. Connect to Vercel
3. Add env vars in Vercel
4. Deploy!

## Need Help?

- 📖 Read the [full README](./README.md)
- ✅ Use the [setup checklist](./SETUP_CHECKLIST.md)
- 🚀 Follow the [deployment guide](./DEPLOYMENT.md)
- 🐛 Check GitHub issues

---

**Happy community building with wefrigerator! 🎉**

