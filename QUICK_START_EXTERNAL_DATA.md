# Quick Start: External Data Ingestion

Get the external data ingestion system up and running in 5 steps.

## Step 1: Apply Database Migration

### Option A: Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `supabase/migrations/004_external_sources.sql`
5. Run the migration

### Option B: Supabase CLI
```bash
supabase db push
```

**Verify:** Check that `external_source` and `external_place` tables exist with 3 seeded sources.

## Step 2: Configure Environment Variables

### Generate Secret
```bash
openssl rand -hex 32
# Copy the output
```

### Local Development (.env.local)
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase
INGEST_SECRET=your-generated-secret
```

### Vercel Deployment
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Settings → API)
   - `INGEST_SECRET` (the secret you generated)
3. Apply to all environments

### GitHub Actions
1. Go to GitHub → Your Repo → Settings → Secrets and variables → Actions
2. Add repository secret: `INGEST_SECRET` (same value as above)

## Step 3: Test Ingestion APIs

Start your dev server:
```bash
npm run dev
```

Test each endpoint:

```bash
# OSM Overpass
curl -X POST \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  http://localhost:3000/api/ingest/overpass

# LA County ArcGIS  
curl -X POST \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  http://localhost:3000/api/ingest/arcgis-la

# Freedge
curl -X POST \
  -H "Authorization: Bearer YOUR_INGEST_SECRET" \
  http://localhost:3000/api/ingest/freedge
```

**Expected Response:**
```json
{
  "success": true,
  "source": "osm_overpass",
  "upserted": 5,
  "total_elements": 5
}
```

## Step 4: Review Imports

1. Log in as admin
2. Navigate to: http://localhost:3000/admin/imports
3. You should see imported locations
4. Try actions:
   - **Create Fridge** - Creates new fridge from import
   - **Merge** - Links import to existing fridge
   - **Ignore** - Hides the import

## Step 5: Check Map Display

1. Go to homepage: http://localhost:3000
2. Switch to **Map View**
3. Enable toggle: **"Show unverified imports"**
4. You should see:
   - Solid circles = Verified fridges
   - Outline circles = Unverified imports (color-coded by source)

## Deployment Checklist

Before deploying to production:

- [ ] Migration applied to production database
- [ ] Environment variables set in Vercel
- [ ] `INGEST_SECRET` added to GitHub Secrets
- [ ] Test ingestion on production URL
- [ ] Verify admin imports page works
- [ ] Check map toggle displays correctly
- [ ] Review attribution page: `/data-sources`
- [ ] GitHub Action workflow enabled

## Production URL

Update in `.github/workflows/ingest-external-data.yml`:

```yaml
# Replace this URL with your production URL
https://wefrigerator.vercel.app/api/ingest/overpass
```

## Monitoring

### Check Nightly Sync
- Go to GitHub → Actions tab
- View "Ingest External Data" workflow runs
- Check for failures

### Review Import Queue
- Visit `/admin/imports` regularly
- Process new imports
- Clear out ignored items

### Database Health
```sql
-- Check recent imports
SELECT source_id, COUNT(*) 
FROM external_place 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY source_id;

-- Check unlinked imports
SELECT COUNT(*) 
FROM external_place 
WHERE ignored = false
AND id NOT IN (SELECT external_place_id FROM fridge WHERE external_place_id IS NOT NULL);
```

## Troubleshooting

### "Unauthorized" Error
- Check `INGEST_SECRET` matches in all locations
- Verify `Authorization: Bearer` header format

### No Data Returned
- Check API endpoints are accessible
- Review network/CORS settings
- Check Vercel function logs

### Imports Not Showing in Admin
- Verify migration ran successfully
- Check `ignored = false` in database
- Ensure locations have valid lat/lng

## Need Help?

See detailed documentation in:
- `EXTERNAL_DATA_INGESTION.md` - Complete system documentation
- `IMPLEMENTATION_SUMMARY_EXTERNAL_DATA.md` - What was implemented
- `ENV_VARS_REQUIRED.md` - Environment setup details

---

**You're all set!** The system will automatically sync data nightly at 2 AM PT. 🎉

