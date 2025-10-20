# wefrigerator - Community Fridge & Pantry Live Status V1

A modern, real-time web application for tracking community fridge and pantry status, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### Public Access
- 📍 **Interactive Map & List View** - View all community fridges with real-time status
- 🔴 **Live Status Updates** - Color-coded markers (Open, Stocked, Needs Items, Closed)
- 📦 **Inventory Tracking** - See what's available (produce, canned goods, dairy, etc.)
- 📸 **Photo Timeline** - View recent photos and status updates
- 🙏 **Item Requests** - See what items are needed

### Authenticated Users (Contributors)
- ✏️ **Post Updates** - Add status updates with photos and notes
- 📷 **Photo Upload** - Upload photos with automatic EXIF stripping
- 📋 **Update Inventory** - Toggle availability of 7 item categories
- 🎯 **Request Items** - Submit requests for needed items
- ✅ **Fulfill Requests** - Mark item requests as fulfilled

### Volunteers
- 🗺️ **Route Management** - View and claim volunteer routes
- 📅 **Schedule Routes** - Pick dates to complete route checks
- ✓ **Route Checklist** - Step-through interface for checking each fridge
- 📝 **Condition Reports** - Record fridge condition and notes
- 🏆 **Complete Routes** - Mark routes as completed

### Admins
- 🏪 **Fridge Management** - Create and manage fridge locations
- 🛣️ **Route Creation** - Build routes with multiple fridge stops
- 📊 **Reports & Analytics** - View weekly activity and high-need fridges
- 👥 **User Management** - Manage user roles and permissions

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Forms:** React Hook Form + Zod validation
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Storage:** Supabase Storage (photo uploads)
- **Maps:** Leaflet (React Leaflet)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd wefrigerator
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migration files in order:
   - \`supabase/migrations/001_initial_schema.sql\`
   - \`supabase/migrations/002_rls_policies.sql\`
   - \`supabase/migrations/003_storage_buckets.sql\`
4. (Optional) Run \`supabase/seed.sql\` for sample data

### 4. Configure Environment Variables

Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Find these in your Supabase project settings under **API**.

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your Admin Account

1. Sign in using the magic link authentication
2. Go to your Supabase dashboard → **Table Editor** → \`profile\`
3. Find your user and update the \`role\` column to \`'admin'\`

## Database Schema

### Core Tables

- \`profile\` - User profiles with roles (visitor, contributor, volunteer, admin)
- \`fridge\` - Community fridge locations with coordinates
- \`fridge_status\` - Append-only status log with photos
- \`fridge_inventory\` - Current inventory snapshot (boolean toggles)
- \`item_request\` - Community item requests
- \`pickup_window\` - Scheduled pickup/dropoff times
- \`route\` - Volunteer routes
- \`route_fridge\` - Routes ↔ Fridges mapping
- \`route_assignment\` - Volunteer route claims
- \`route_check\` - Per-fridge checks during routes

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Public read access for most data
- Authenticated-only writes
- Role-based permissions for admin actions
- Owner-based permissions for updates

## Project Structure

\`\`\`
app/
  ├── page.tsx                    # Home page (map + list)
  ├── fridge/[id]/page.tsx        # Fridge detail page
  ├── update/[fridgeId]/page.tsx  # Status update form
  ├── requests/[fridgeId]/new/    # Item request form
  ├── volunteer/routes/           # Volunteer routes
  ├── admin/                      # Admin pages
  ├── auth/login/                 # Authentication
  ├── profile/                    # User profile
  └── actions/                    # Server actions
components/
  ├── ui/                         # shadcn/ui components
  ├── FridgeMap.tsx               # Map component
  ├── FridgeCard.tsx              # Fridge list card
  ├── StatusTimeline.tsx          # Status history
  ├── UpdateForm.tsx              # Status update form
  ├── RouteClaimCard.tsx          # Route claiming
  └── RouteStepper.tsx            # Route completion
lib/
  ├── supabase/                   # Supabase clients
  ├── validators.ts               # Zod schemas
  ├── types.ts                    # TypeScript types
  └── utils/                      # Utility functions
supabase/
  ├── migrations/                 # SQL migrations
  └── seed.sql                    # Sample data
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

## Usage Guide

### For Contributors

1. **Sign in** with your email (magic link)
2. **Find a fridge** on the map or list
3. **Post an update** with current status, photo, and inventory
4. **Request items** that are needed
5. **Mark requests** as fulfilled when donated

### For Volunteers

1. **Become a volunteer** - Contact an admin to change your role
2. **View routes** in the Volunteer section
3. **Claim a route** by selecting a date
4. **Complete the route** by checking each fridge
5. **Submit condition reports** for each stop

### For Admins

1. **Add fridges** with name, location, and accessibility info
2. **Create routes** grouping fridges by area
3. **View reports** to see weekly activity
4. **Manage fridges** - activate/deactivate locations

## Status Color Guide

- 🟢 **Green (Open)** - Fridge is accessible
- 🔵 **Blue (Stocked)** - Recently restocked
- 🟠 **Amber (Needs)** - Low on supplies
- ⚫ **Gray (Closed)** - Currently unavailable

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color-blind friendly design (icons + labels, not color alone)
- Alt text for all images

## Security Features

- Row Level Security (RLS) on all tables
- EXIF GPS data stripped from photos
- File size and type validation
- Rate limiting on uploads
- Role-based access control

## Future Enhancements (V2+)

- [ ] Offline-first PWA for volunteers
- [ ] SMS/Email notifications for high-priority needs
- [ ] Multi-language support (Spanish, etc.)
- [ ] Photo ML for automatic condition detection
- [ ] CSV import for bulk fridge additions
- [ ] Weekly impact reports (PDF export)
- [ ] Mobile apps (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this for your community!

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the Supabase documentation

## Acknowledgments

**wefrigerator** is built with ❤️ for communities working to reduce food insecurity.

Special thanks to:
- Community fridge organizers and volunteers
- Open source contributors
- The Next.js and Supabase teams
