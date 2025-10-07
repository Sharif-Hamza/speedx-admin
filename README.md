# SpeedX Admin Dashboard 🚀

A powerful, modern admin dashboard for managing your SpeedX application.

## Features ✨

- 📊 **Real-time Dashboard** - View stats, analytics, and user activity
- 👥 **User Management** - View, search, and manage all users
- 📢 **Announcements** - Post announcements to your app users
- 🏆 **Badge Management** - Award badges to users
- 📈 **Analytics** - Track app performance and user engagement
- ⚙️ **Settings** - Configure app settings and features

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend and database
- **React Query** - Data fetching (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Service Role Key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Emails (comma-separated)
ADMIN_EMAILS=your-email@example.com
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (optional) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Database Tables

Run the SQL schema to create required tables:

```sql
-- See SUPABASE_SCHEMA.sql file
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Add environment variables in Netlify dashboard
7. Deploy!

## Project Structure

```
speedx-admin/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Header.tsx        # Top header
│   ├── StatsCards.tsx    # Dashboard stats
│   ├── UsersTable.tsx    # User management
│   └── AnnouncementsPanel.tsx  # Announcements
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
└── package.json
```

## Features Guide

### Dashboard
- View total users, trips, badges
- See active users today
- Quick actions for common tasks

### User Management
- View all users with stats
- Search users by email or ID
- View user details (trips, badges)
- Award badges to users

### Announcements
- Create new announcements
- Set priority levels (low/medium/high/critical)
- Target all users or specific users
- Activate/deactivate announcements
- Delete announcements

### Analytics (Coming Soon)
- User growth charts
- Trip statistics
- Popular destinations
- Speed analytics

### Settings (Coming Soon)
- App configuration
- Feature flags
- Badge management
- Content moderation

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key for admin ops |
| `ADMIN_EMAILS` | No | Allowed admin emails |

## Troubleshooting

### "Cannot connect to Supabase"
- Verify your `.env.local` file exists
- Check that environment variables are correct
- Restart the dev server after changing env vars

### "Table doesn't exist"
- Make sure you ran the SQL schema in Supabase
- Check table names match your schema

### "Permission denied"
- Check Supabase RLS policies
- Verify service role key if using admin operations

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment Checklist

- [ ] Create `.env.local` with Supabase credentials
- [ ] Run database schema in Supabase
- [ ] Test locally with `npm run dev`
- [ ] Push code to GitHub
- [ ] Deploy to Netlify
- [ ] Add environment variables in Netlify
- [ ] Test production deployment
- [ ] Share admin URL with team

## Security Notes

- Never commit `.env.local` to Git
- Use service role key only server-side
- Enable Supabase RLS policies
- Whitelist admin emails
- Use HTTPS in production

## Support

For issues or questions:
- Check the Supabase documentation
- Review Next.js documentation
- Check GitHub issues

---

Built with ❤️ for SpeedX
