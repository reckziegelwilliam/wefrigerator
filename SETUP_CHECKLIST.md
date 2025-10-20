# wefrigerator - Setup Checklist

Use this checklist to ensure wefrigerator is properly configured before deployment.

## Local Development Setup

### Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)

### Initial Setup
- [ ] Clone repository or create new project
- [ ] Run `npm install` to install dependencies
- [ ] Copy `.env.example` to `.env.local`
- [ ] Verify project structure matches expected layout

### Supabase Setup
- [ ] Create Supabase account at supabase.com
- [ ] Create new Supabase project
- [ ] Save database password securely
- [ ] Copy Project URL from Settings → API
- [ ] Copy Anon Key from Settings → API
- [ ] Add URL and Key to `.env.local`

### Database Configuration
- [ ] Open Supabase SQL Editor
- [ ] Run `001_initial_schema.sql` migration
- [ ] Verify tables created in Table Editor
- [ ] Run `002_rls_policies.sql` migration
- [ ] Verify RLS is enabled on all tables
- [ ] Run `003_storage_buckets.sql` migration
- [ ] Verify `photos` bucket exists in Storage
- [ ] (Optional) Run `seed.sql` for sample data
- [ ] Verify sample data in Table Editor

### Local Testing
- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:3000 in browser
- [ ] Verify home page loads with map
- [ ] Test sign in with magic link
- [ ] Check email for magic link
- [ ] Click magic link and verify redirect
- [ ] Verify profile was created in Supabase

### Admin Account Setup
- [ ] Sign in to the app locally
- [ ] Go to Supabase → Table Editor → `profile`
- [ ] Find your user row
- [ ] Change `role` to `'admin'`
- [ ] Refresh the app
- [ ] Verify admin menu items appear
- [ ] Test accessing `/admin/fridges`
- [ ] Test accessing `/admin/routes`
- [ ] Test accessing `/admin/reports`

## Feature Testing

### Public Features
- [ ] Map displays correctly
- [ ] Markers appear for all fridges
- [ ] Clicking marker shows popup
- [ ] List view shows all fridges
- [ ] Fridge detail page loads
- [ ] Status timeline displays
- [ ] Inventory chips show correctly
- [ ] Item requests display
- [ ] Pickup windows display

### Authenticated Features
- [ ] Post status update form works
- [ ] Photo upload works
- [ ] Inventory toggles save
- [ ] Status appears in timeline
- [ ] Create item request works
- [ ] Fulfill request works
- [ ] Request status updates

### Volunteer Features
- [ ] Routes page loads
- [ ] Can view available routes
- [ ] Can claim a route
- [ ] Calendar date picker works
- [ ] Route assignment created
- [ ] Route stepper displays fridges
- [ ] Can complete checks
- [ ] Can mark route complete

### Admin Features
- [ ] Create new fridge works
- [ ] Edit fridge works
- [ ] Create route works
- [ ] Add fridges to route works
- [ ] Reports page shows stats
- [ ] High-need fridges display

## Production Deployment

### Pre-Deployment
- [ ] All tests passing locally
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No build errors (`npm run build`)
- [ ] Environment variables documented
- [ ] README.md is complete
- [ ] DEPLOYMENT.md is reviewed

### Vercel Setup
- [ ] Push code to Git repository
- [ ] Connect repository to Vercel
- [ ] Configure build settings
- [ ] Add environment variables in Vercel
- [ ] Trigger first deployment
- [ ] Verify deployment successful
- [ ] Visit deployed URL

### Supabase Production Config
- [ ] Add Vercel domain to Supabase redirect URLs
- [ ] Test magic link authentication on production
- [ ] Verify photo uploads work on production
- [ ] Check RLS policies are working
- [ ] Test all critical features on production

### Post-Deployment
- [ ] Create admin account on production
- [ ] Add first real fridge
- [ ] Test status update on production
- [ ] Share URL with team for testing
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Supabase usage

## Security Checklist

### Database Security
- [ ] RLS enabled on all tables
- [ ] Admin-only policies verified
- [ ] Anon key (not service key) used in frontend
- [ ] Database password is secure and saved
- [ ] No sensitive data in public tables

### Application Security
- [ ] EXIF data stripped from photos
- [ ] File upload size limits enforced
- [ ] File type validation working
- [ ] Auth required for protected routes
- [ ] Role checks working correctly

### Environment & Secrets
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Production env vars set in Vercel
- [ ] API keys rotated if exposed

## Performance Checklist

### Frontend
- [ ] Images optimized and resized
- [ ] Map loads within 2 seconds
- [ ] Page navigation is fast
- [ ] Forms submit quickly
- [ ] No console errors in browser

### Backend
- [ ] Database queries are efficient
- [ ] Proper indexes on frequently queried columns
- [ ] No N+1 query issues
- [ ] RLS policies don't slow queries
- [ ] Storage bucket is configured correctly

## Monitoring & Maintenance

### Regular Checks (Weekly)
- [ ] Check `/admin/reports` for activity
- [ ] Review high-need fridges
- [ ] Monitor Vercel analytics
- [ ] Check Supabase storage usage
- [ ] Review any error logs

### Regular Checks (Monthly)
- [ ] Review user roles and permissions
- [ ] Archive old status updates if needed
- [ ] Check database size and limits
- [ ] Review and update routes
- [ ] Gather user feedback

### As Needed
- [ ] Add new fridges as community grows
- [ ] Create new routes for volunteers
- [ ] Update accessibility information
- [ ] Add pickup windows
- [ ] Respond to item requests

## Troubleshooting Reference

### Common Issues

**Magic links not working**
- Check Supabase redirect URLs
- Verify email provider not blocking
- Check spam folder

**Photos not uploading**
- Verify storage bucket exists
- Check bucket is public
- Verify file size under 3MB
- Check file type is image

**Map not loading**
- Check browser console for errors
- Verify Leaflet CSS loaded
- Check fridge coordinates are valid

**Permission denied errors**
- Verify RLS policies applied
- Check user is authenticated
- Verify user role is correct

**Build failures**
- Run `npm install` to update deps
- Check for TypeScript errors
- Verify env vars are set
- Check Next.js version compatibility

## Support Contacts

- **Development Issues:** [Your team/GitHub issues]
- **Supabase Support:** support.supabase.com
- **Vercel Support:** vercel.com/support
- **Community:** [Your Discord/Slack]

---

**Last Updated:** [Current Date]
**Version:** 1.0.0

