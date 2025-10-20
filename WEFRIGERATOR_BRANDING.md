# wefrigerator - Branding Reference Document

This document lists all locations where the app name "wefrigerator" appears in the codebase.

## ✅ Files Updated with wefrigerator Branding

### Configuration Files
1. **`package.json`** (Line 2)
   - Package name: `"name": "wefrigerator"`

### Application Code
2. **`app/layout.tsx`** (Lines 17-18)
   - Metadata title: `title: "wefrigerator"`
   - Metadata description: Includes "wefrigerator"

3. **`app/page.tsx`** (Line 83)
   - Main heading: `<h1>wefrigerator</h1>`

### Documentation Files
4. **`README.md`**
   - Title (Line 1): `# wefrigerator - Community Fridge & Pantry Live Status V1`
   - Clone directory (Line 56): `cd wefrigerator`
   - Acknowledgments (Line 255): "wefrigerator is built with ❤️..."

5. **`PROJECT_SUMMARY.md`**
   - Title (Line 1): `# wefrigerator - Community Fridge V1 - Project Summary`
   - Description (Line 5): "wefrigerator is a complete..."
   - Directory structure (Line 23): `wefrigerator/`
   - Footer (Line 368): `**App Name:** wefrigerator`

6. **`QUICK_START.md`**
   - Title (Line 1): `# wefrigerator - Quick Start Guide`
   - Description (Line 3): "Get the wefrigerator app running..."
   - Footer (Line 153): "Happy community building with wefrigerator! 🎉"

7. **`DEPLOYMENT.md`**
   - Title (Line 1): `# wefrigerator - Deployment Guide`
   - Description (Line 3): "deploying the wefrigerator application..."
   - Supabase project name suggestion (Line 19): `**Name:** wefrigerator`

8. **`SETUP_CHECKLIST.md`**
   - Title (Line 1): `# wefrigerator - Setup Checklist`
   - Description (Line 3): "ensure wefrigerator is properly configured..."

9. **`IMPORTANT_NOTES.md`**
   - Title (Line 1): `# ⚠️ wefrigerator - Important Notes`
   - Footer (Line 271): "Good luck with wefrigerator! 🎉"

10. **`BUILD_SUCCESS.md`**
    - Title (Line 1): `# ✅ wefrigerator - Build Success Report`
    - Description (Line 5): "The wefrigerator application builds..."

11. **`ERROR_FIXES.md`**
    - Title (Line 1): `# wefrigerator - Error Fixes Summary`

### Database Files
12. **`supabase/seed.sql`** (Line 1)
    - Comment: `-- Seed data for wefrigerator application`

## Future Additions Recommended

The following locations could also include "wefrigerator" branding when implemented:

### PWA/Manifest (Future)
- [ ] `public/manifest.json` - App name and short name
- [ ] PWA configuration

### Meta Tags (Future Enhancement to layout.tsx)
- [ ] Open Graph title: `og:title`
- [ ] Twitter card title: `twitter:title`
- [ ] Open Graph site name: `og:site_name`

### Email Templates (Supabase Configuration)
- [ ] Magic link email template
- [ ] Welcome email template
- [ ] Password reset email (if added)

### Error Pages (Future)
- [ ] `app/not-found.tsx` (404 page)
- [ ] `app/error.tsx` (500 page)
- [ ] Custom error messages

### Footer Component (Future)
- [ ] Footer copyright notice
- [ ] About link text

### Additional Pages (Future)
- [ ] About page
- [ ] Help/FAQ page
- [ ] Terms of Service
- [ ] Privacy Policy

## How to Update Branding in the Future

If you need to change the app name from "wefrigerator" to something else:

1. **Search for "wefrigerator"** in your codebase:
   ```bash
   grep -r "wefrigerator" . --exclude-dir=node_modules --exclude-dir=.next
   ```

2. **Update each occurrence** following this priority:
   - High Priority: `package.json`, `layout.tsx`, `page.tsx`
   - Medium Priority: Documentation files (README, guides)
   - Low Priority: Comments and seed data

3. **Test the changes:**
   ```bash
   npm run type-check  # Check for TypeScript errors
   npm run build       # Test production build
   npm run dev         # Test locally
   ```

## Brand Consistency Guidelines

When adding new features or pages, remember to:

1. **Use "wefrigerator"** in:
   - Page titles and headings (when referring to the app itself)
   - Email templates
   - Error messages that mention the service
   - Social media sharing metadata

2. **Don't overuse it:**
   - Not needed in every paragraph
   - Use "the app" or "this service" for variety
   - Focus on functionality in component names

3. **Capitalization:**
   - In headlines: "wefrigerator" (lowercase w)
   - In sentences: "wefrigerator" (lowercase w)
   - The brand uses lowercase styling

## Related Files

- This document: `WEFRIGERATOR_BRANDING.md`
- Main documentation: `README.md`
- Project summary: `PROJECT_SUMMARY.md`

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-19  
**App Name:** wefrigerator

