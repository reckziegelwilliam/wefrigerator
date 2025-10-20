# 🚀 External Data Ingestion - Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run migration `004_external_sources.sql` in Supabase
- [ ] Verify 3 sources seeded (osm_overpass, lac_charitable_food, freedge)
- [ ] Confirm tables exist: `external_source`, `external_place`
- [ ] Confirm `fridge.external_place_id` column added

### 2. Environment Variables

#### Local Development
- [ ] Create `.env.local` file
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Settings → API)
- [ ] Generate `INGEST_SECRET`: `openssl rand -hex 32`
- [ ] Add `INGEST_SECRET` to `.env.local`

#### Vercel Production
- [ ] Go to Vercel Project → Settings → Environment Variables
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview, Development)
- [ ] Add `INGEST_SECRET` (Production, Preview, Development)
- [ ] Redeploy to apply changes

#### GitHub Actions
- [ ] Go to GitHub Repo → Settings → Secrets and variables → Actions
- [ ] Add repository secret: `INGEST_SECRET` (same value as Vercel)
- [ ] Update workflow URL from `wefrigerator.vercel.app` to your domain

### 3. Test Locally

```bash
# Start dev server
npm run dev

# Test each endpoint (replace YOUR_SECRET with your INGEST_SECRET)
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/overpass

curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/arcgis-la

curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/freedge
```

Expected response:
```json
{
  "success": true,
  "source": "osm_overpass",
  "upserted": 5,
  "total_elements": 5
}
```

### 4. Verify Database
- [ ] Check `external_place` table has records
- [ ] Verify `source_id` links to `external_source`
- [ ] Confirm lat/lng populated

### 5. Test Admin UI
- [ ] Login as admin user
- [ ] Navigate to `/admin/imports`
- [ ] Verify imported locations appear
- [ ] Test "Create Fridge" button → opens dialog
- [ ] Test "Merge" button → shows fridge dropdown
- [ ] Test "Ignore" button → removes from list
- [ ] Test source filter dropdown

### 6. Test Map Display
- [ ] Go to homepage `/`
- [ ] Switch to "Map View" tab
- [ ] Enable "Show unverified imports" toggle
- [ ] Verify solid markers (verified) and outline markers (imports)
- [ ] Click outline marker → popup shows source badge
- [ ] Click "Review in Admin" link → goes to `/admin/imports`

### 7. Test Attribution Page
- [ ] Visit `/data-sources`
- [ ] Verify all 3 sources listed
- [ ] Confirm OSM ODbL compliance text
- [ ] Check all links work

### 8. Deploy to Production
- [ ] Push to main branch (or your deployment branch)
- [ ] Wait for Vercel deployment
- [ ] Visit production URL
- [ ] Test one ingestion endpoint in production

### 9. GitHub Actions Setup
- [ ] Edit `.github/workflows/ingest-external-data.yml`
- [ ] Replace `https://wefrigerator.vercel.app` with your production URL
- [ ] Commit and push
- [ ] Go to GitHub → Actions tab
- [ ] Click "Ingest External Data" workflow
- [ ] Click "Run workflow" (manual trigger)
- [ ] Verify it runs successfully

### 10. Monitor First Nightly Run
- [ ] Wait until 2 AM PT (or trigger manually)
- [ ] Check GitHub Actions for success/failure
- [ ] Review `/admin/imports` for new data
- [ ] Process any new imports

## Post-Deployment

### Week 1
- [ ] Review import queue daily
- [ ] Create/merge top 10-20 verified locations
- [ ] Monitor GitHub Actions for failures
- [ ] Adjust rate limits if needed

### Ongoing
- [ ] Review imports weekly
- [ ] Monitor for stale data (last_seen_at > 30 days)
- [ ] Update attribution if sources change
- [ ] Consider expanding to new data sources

## Rollback Plan

If issues occur:

1. **Pause Ingestion:**
   - Disable GitHub Actions workflow
   - Or change `INGEST_SECRET` to invalidate requests

2. **Hide Imports on Map:**
   - Set `showImportsToggle={false}` in `app/page.tsx`
   - Redeploy

3. **Clear Bad Data:**
   ```sql
   DELETE FROM external_place WHERE source_id = 'problematic-source-id';
   ```

4. **Revert Migration:**
   ```sql
   ALTER TABLE fridge DROP COLUMN external_place_id;
   DROP TABLE external_place;
   DROP TABLE external_source;
   ```

## Success Metrics

Track these in your first month:

- [ ] Number of external locations imported
- [ ] Number of imports converted to verified fridges
- [ ] Number of duplicate detections (high similarity score)
- [ ] GitHub Actions success rate
- [ ] User engagement with map toggle

## Documentation Quick Links

- **Setup Guide:** `QUICK_START_EXTERNAL_DATA.md`
- **System Docs:** `EXTERNAL_DATA_INGESTION.md`
- **Implementation:** `IMPLEMENTATION_COMPLETE.md`
- **Environment Vars:** `ENV_VARS_REQUIRED.md`

---

## Ready to Deploy? ✅

If all boxes above are checked, you're ready to deploy! 🚀

**Questions or issues?** Check the documentation files or review the implementation summary.

