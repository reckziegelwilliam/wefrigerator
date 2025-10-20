# External Data Ingestion System

This document explains how the external data ingestion system works and how to use it.

## Overview

The system automatically imports community fridge and food distribution locations from three external sources:

1. **OpenStreetMap (OSM) Overpass API** - Community fridges tagged as `amenity=food_sharing`
2. **LA County ArcGIS** - Charitable food distribution sites from LA County Department of Public Health
3. **Freedge** - Community fridge network (if API available)

Imported data is stored in a staging area (`external_place` table) and reviewed by admins before being verified and added to the main fridge database.

## Architecture

### Database Schema

```
external_source
├─ id (uuid)
├─ name (text, unique)
├─ attribution (text)
├─ license (text)
├─ attribution_url (text)
└─ created_at (timestamptz)

external_place
├─ id (uuid)
├─ source_id (uuid → external_source)
├─ source_place_id (text)
├─ name (text)
├─ address (text)
├─ lat, lng (double precision)
├─ raw (jsonb)
├─ last_seen_at (timestamptz)
├─ ignored (boolean)
└─ created_at (timestamptz)

fridge
└─ external_place_id (uuid → external_place) [NEW COLUMN]
```

### API Routes

- `POST /api/ingest/overpass` - Import from OSM
- `POST /api/ingest/arcgis-la` - Import from LA County
- `POST /api/ingest/freedge` - Import from Freedge

All routes require authentication via `Authorization: Bearer <INGEST_SECRET>` header.

## Setup

### 1. Run Database Migrations

```bash
# The migration creates the necessary tables and seeds initial sources
# Run this via Supabase CLI or dashboard
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
INGEST_SECRET=your-random-secret-string
```

Generate a secure secret:
```bash
openssl rand -hex 32
```

### 3. Add to Vercel

In Vercel project settings:
1. Go to Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` and `INGEST_SECRET`
3. Apply to all environments (Production, Preview, Development)

### 4. Configure GitHub Actions

In GitHub repository settings:
1. Go to Settings → Secrets and variables → Actions
2. Add `INGEST_SECRET` as a repository secret

## Usage

### Manual Ingestion (Testing)

Test each API endpoint manually:

```bash
# OSM Overpass
curl -X POST \
  -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/overpass

# LA County ArcGIS
curl -X POST \
  -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/arcgis-la

# Freedge
curl -X POST \
  -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/ingest/freedge
```

Expected response:
```json
{
  "success": true,
  "source": "osm_overpass",
  "upserted": 12,
  "total_elements": 12
}
```

### Automated Ingestion (Production)

GitHub Actions runs daily at 2 AM Pacific:
- Workflow file: `.github/workflows/ingest-external-data.yml`
- Can be manually triggered from Actions tab
- Logs available in GitHub Actions interface

### Admin Review

1. Navigate to `/admin/imports`
2. View unlinked external places
3. For each location:
   - **Create Fridge**: Creates new fridge with pre-filled data
   - **Merge**: Links to existing fridge (updates `external_place_id`)
   - **Ignore**: Marks as reviewed but not actionable

### Map Display

Users can toggle "Show unverified imports" on the map to see:
- **Solid markers**: Verified fridges in database
- **Outline markers**: Imported but unverified locations
- Different colors indicate the source (OSM/ArcGIS/Freedge)

## Data Flow

```
External API
    ↓
API Route (/api/ingest/*)
    ↓
external_place table
    ↓
Admin Review (/admin/imports)
    ↓
Create or Merge
    ↓
fridge table (with external_place_id link)
    ↓
Public Map Display
```

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Environment variables configured
- [ ] Manual API calls return data
- [ ] External places appear in database
- [ ] Admin imports page shows candidates
- [ ] Create Fridge works
- [ ] Merge with existing fridge works
- [ ] Ignore functionality works
- [ ] Map toggle shows imported vs verified correctly
- [ ] Attribution page displays sources
- [ ] GitHub Action runs successfully

## Rate Limiting & Best Practices

### OSM Overpass API
- Respect rate limits (no more than 1 req/sec)
- Cache results when possible
- Use appropriate timeout (25s)
- Attribution required: "© OpenStreetMap contributors"

### LA County ArcGIS
- Public dataset, check terms of use
- May have rate limits
- Provide attribution to LA County DPH

### Freedge
- API may not be officially documented
- Fallback to manual curation if unavailable
- Contact Freedge for partnership opportunities

## Troubleshooting

### No data returned from API

Check:
1. API endpoint is accessible
2. Query parameters are correct
3. Response is in expected format
4. Network/firewall not blocking requests

### Authentication errors

Check:
1. `INGEST_SECRET` matches in all locations
2. Header format: `Authorization: Bearer <secret>`
3. Environment variable loaded correctly

### Duplicate locations

The system uses `(source_id, source_place_id)` as unique constraint to prevent duplicates.

### Missing imports in admin panel

Check:
1. `ignored = false` in query
2. Location has valid lat/lng
3. Not already linked to a fridge

## Attribution & Legal Compliance

All data sources require proper attribution. The `/data-sources` page automatically displays:

- Source name and description
- License information
- Attribution text
- Link to original source

For OSM data, we comply with ODbL by:
- Attributing "© OpenStreetMap contributors"
- Not republishing full datasets
- Deriving minimal information (location + name)
- Linking back to openstreetmap.org

## Future Enhancements

- [ ] Automatic duplicate detection (fuzzy matching)
- [ ] Confidence scores for matches
- [ ] Bulk review actions
- [ ] Historical tracking of data changes
- [ ] Integration with more data sources
- [ ] API for community contributions

