# ARIA HUB

A premium multilingual business, visa, and opportunity services platform built with Next.js, TypeScript, and Prisma.

## ✨ Features

- 🌍 **Multilingual Support** - Full support for English, Persian (فارسی), and Pashto (پښتو)
- 🎨 **Modern UI** - Beautiful, responsive design with light/dark mode
- 📱 **Mobile-First** - Optimized for all devices
- ⚡ **Fast & Efficient** - Built with Next.js 16 and Turbopack
- 🔐 **Secure** - Built-in authentication and authorization
- 📊 **Admin Panel** - Comprehensive content management system
- 🤖 **Auto Import System** - Automated content import from external sources
- 🎯 **SEO Optimized** - Built-in SEO features for better visibility

## 🚀 Quick Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import this repository
   - Add environment variables (see below)
   - Click Deploy

3. **Environment Variables (Add in Vercel):**
   ```env
   DATABASE_URL=file:./db/custom.db
   ADMIN_SESSION_SECRET=<your-secure-random-64-char-string>
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

**That's it! Your site will be live in 2-3 minutes.** 🎉

---

## 📚 Documentation

- **DEPLOYMENT.md** - Complete deployment guide
- **DEPLOY_NOW.md** - Quick 3-step deployment
- **DATABASE_AND_DOMAIN_GUIDE.md** - Database hosting & custom domain setup
- **docs/AUTO-IMPORT.md** - Auto import system documentation

---

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ or Bun
- npm, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env file (see .env.example)

# Initialize database
npx prisma db push
npx prisma generate

# Seed admin user
npx tsx scripts/seed-admin.ts

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Admin Access

- **URL:** `/admin` (or click logo 5 times quickly)
- **Default credentials:** admin@ariahub.com / admin123
- ⚠️ **Change password after first login!**

---

## 📦 Content Types

- Services & Service Categories
- Visa Information
- Opportunities (Jobs, Scholarships)
- News & Blog Posts
- Testimonials
- FAQs
- Gallery & Albums
- Team Members
- Pricing Packages
- Process Steps
- Site Settings

---

## 🤖 Auto Import System

Automatically import jobs and scholarships from external sources:

- **2 Pre-configured Sources:** Wazifaha.org, Scholarships.af
- **AI-Powered:** Content rewriting and translation (optional)
- **Smart Deduplication:** Prevents duplicate entries
- **Image Optimization:** Automatic WebP conversion
- **Multilingual:** Content in 3 languages (en/fa/ps)

**Access:** Admin Panel → Auto Import

---

## 🌐 Multilingual System

All content managed in three languages with automatic fallback:
- **English (en)** - LTR
- **Persian/Dari (fa)** - RTL, default
- **Pashto (ps)** - RTL

Content automatically displays in the user's selected language.

---

## 🔧 Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Authentication:** Custom secure auth system
- **Internationalization:** Custom i18n system
- **AI Integration:** Pluggable providers (ZAI, OpenAI, Gemini)

---

## 📜 Scripts

```bash
# Development
npm run dev                    # Start dev server

# Production
npm run build                  # Build for production
npm start                      # Start production server

# Database
npx prisma studio              # Open database GUI
npx prisma db push             # Push schema changes
npx prisma generate            # Generate Prisma client

# Testing
npm run test                   # Run tests
npm run test:run               # Run tests once

# Utilities
npx tsx scripts/seed-admin.ts  # Create admin user
npx tsx scripts/seed-import-sources.ts  # Seed import sources
```

---

## 💰 Hosting Cost

**FREE with Vercel:**
- Unlimited bandwidth
- Automatic SSL (HTTPS)
- Global CDN
- Custom domain support
- Automatic deployments

**Optional:** Custom domain ($10-15/year)

---

## 🔒 Security

- Session-based authentication
- Rate limiting on admin endpoints
- CSRF protection
- Input validation
- Secure password hashing (bcrypt)
- Environment variable protection

---

## 📱 Admin Panel Features

- Dashboard with statistics
- CRUD operations for all content types
- Multilingual content editor
- Image upload and management
- SEO configuration per page
- Auto Import management
- Site settings configuration
- User management
- Audit logs

---

## 🎨 Customization

### Change Theme Colors

Admin Panel → Site Settings → Theme Colors

### Add New Content

Admin Panel → Select content type → Add New

### Configure Auto Import

Admin Panel → Auto Import → Sources

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the deployment guide
3. Check Vercel deployment logs

---

## 📄 License

Private - All rights reserved
