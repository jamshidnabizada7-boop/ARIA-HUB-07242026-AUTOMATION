# 🗄️ Database & Custom Domain Guide

## 📊 DATABASE HOSTING EXPLAINED

### ✅ YES - Your Database WILL Be Hosted!

When you deploy to Vercel, **your SQLite database file IS included** in the deployment.

#### How It Works:

1. **Your database file** (`db/custom.db` - 3.4 MB) is in your repository
2. When you push to GitHub, it's uploaded with your code
3. Vercel deploys everything, including the database
4. **The database runs on Vercel's servers** alongside your app

### ✅ Database Contains All Your Data:
- ✅ 82+ opportunities (jobs & scholarships)
- ✅ Admin user credentials
- ✅ Import sources configuration
- ✅ All settings and content
- ✅ Everything works automatically!

---

## 🌐 CUSTOM DOMAIN - YES, DATABASE STILL WORKS!

### The Database Location Does NOT Change

Whether you access your site via:
- `https://your-project.vercel.app` (Vercel domain)
- `https://ariahub.com` (your custom domain)

**The database is in the SAME place** - on Vercel's servers.

**Domain is just the address. Database location is unchanged.**

---

## 🔄 HOW IT ALL WORKS TOGETHER

```
Your Custom Domain (ariahub.com)
         ↓
    DNS Points to
         ↓
    Vercel Servers
         ↓
    Your Website Code + Database
```

**When someone visits `ariahub.com`:**
1. DNS redirects them to Vercel
2. Vercel serves your website
3. Your website reads from the database
4. User sees the data (opportunities, etc.)

**Everything is hosted together!**

---

## 📦 WHAT GETS DEPLOYED TO VERCEL

```
✅ Your Next.js application code
✅ Database file (db/custom.db)
✅ All images (193 files)
✅ Configuration files
✅ Everything in your repository
```

**Nothing is left behind!**

---

## 🛡️ IMPORTANT: DATABASE IN PRODUCTION

### ⚠️ SQLite Limitations in Production

Your current setup uses **SQLite** (file-based database). This is:

✅ **GOOD FOR:**
- Small to medium websites
- 10,000 - 50,000 visitors/month
- Read-heavy applications (viewing opportunities)
- Development and testing

⚠️ **LIMITATIONS:**
- Database is **read-only** in Vercel's free tier
- Each deployment creates a **new instance**
- Data added after deployment is **lost on next deploy**

### 🤔 What This Means For You:

#### ✅ **These Will Work:**
- Viewing all 82 imported opportunities ✅
- Browsing services, visas, news ✅
- Admin panel viewing data ✅
- All public pages ✅

#### ⚠️ **These Will Have Issues:**
- Adding new content in admin → **Lost on next deploy**
- Running auto-imports → **Lost on next deploy**
- User submissions (contact forms) → **Lost on next deploy**
- Any database changes → **Lost on next deploy**

---

## 💡 SOLUTIONS FOR PRODUCTION DATABASE

### Option 1: Keep SQLite (Quick Start - FREE)

**Best for:** Testing, demo, content-display-only sites

**How to use:**
1. Deploy to Vercel as-is ✅
2. All current content (82 opportunities) works ✅
3. Don't add/edit content after deployment
4. For updates: edit locally → commit → push → redeploy

**Pros:**
- ✅ FREE
- ✅ Works immediately
- ✅ No additional setup
- ✅ Good for content that doesn't change often

**Cons:**
- ❌ Can't add content dynamically
- ❌ Auto-import won't persist
- ❌ Contact form submissions lost

---

### Option 2: Upgrade to Vercel Postgres (RECOMMENDED)

**Cost:** FREE for starter tier (60 hours compute/month)

**Setup:** (10 minutes)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Click "Create"

2. **Vercel gives you:**
   - Database connection string (automatic)
   - Environment variables (auto-configured)
   - Persistent storage (survives deployments)

3. **Update your code:**
   ```bash
   # In datasource block in schema.prisma
   # Change from:
   provider = "sqlite"
   
   # To:
   provider = "postgresql"
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma db push
   ```

5. **Redeploy:**
   - Push to GitHub
   - Vercel auto-deploys

**Pros:**
- ✅ FREE tier available
- ✅ Persistent data (survives deployments)
- ✅ Auto-import works perfectly
- ✅ Admin panel fully functional
- ✅ Contact forms work
- ✅ Scales to millions of records
- ✅ Automatic backups

**Cons:**
- Requires 10 minutes setup
- Need to migrate data

---

### Option 3: External Database (Advanced)

**Options:**
- **Supabase** (PostgreSQL - FREE tier)
- **PlanetScale** (MySQL - FREE tier)
- **Neon** (PostgreSQL - FREE tier)
- **MongoDB Atlas** (FREE tier)

**Best for:** High-traffic sites, specific database needs

---

## 🎯 RECOMMENDATION FOR YOUR SITE

### For Launch (Today):

**Option 1: Deploy with SQLite as-is**

✅ **Why:**
- Works immediately
- All 82 opportunities display perfectly
- FREE hosting
- Good for initial launch

✅ **Good for:**
- Testing the deployment
- Showing off your site
- Getting user feedback
- Proof of concept

⚠️ **Remember:**
- Don't add content after deploying
- Auto-import won't persist
- For updates, edit locally and redeploy

---

### For Production (Week 1-2):

**Option 2: Upgrade to Vercel Postgres**

✅ **Why:**
- Still FREE
- Fully functional admin panel
- Auto-import works perfectly
- Contact forms persist
- Professional solution

---

## 🌐 CUSTOM DOMAIN SETUP

### Step-by-Step Guide

#### 1. Buy Your Domain (10 minutes)

**Recommended Registrars:**
- **Namecheap** - $8-12/year (easy to use)
- **GoDaddy** - $10-15/year
- **Google Domains** - $12/year
- **Cloudflare** - $8-10/year (cheapest)

**Example:** Buy `ariahub.com`

---

#### 2. Add Domain to Vercel (2 minutes)

1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings" → "Domains"
4. Click "Add Domain"
5. Enter: `ariahub.com`
6. Click "Add"

**Vercel will show DNS settings needed:**
```
A Record:     @ → 76.76.21.21
CNAME Record: www → cname.vercel-dns.com
```

---

#### 3. Configure DNS at Your Registrar (5 minutes)

**At Namecheap/GoDaddy/etc:**

1. Login to your domain registrar
2. Go to DNS Management / DNS Settings
3. Add these records:

**For main domain (ariahub.com):**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**For www subdomain (www.ariahub.com):**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

4. Save changes

---

#### 4. Wait for DNS Propagation (5-30 minutes)

- DNS changes take 5-30 minutes to propagate
- Check status at: https://dnschecker.org
- Enter your domain and see if it points to Vercel

---

#### 5. Verify in Vercel (1 minute)

- Go back to Vercel Dashboard
- Check domain status
- Should show "Valid Configuration" ✅
- SSL certificate automatically issued (HTTPS)

---

#### 6. Update Environment Variable (1 minute)

In Vercel Dashboard → Settings → Environment Variables:

**Update:**
```
NEXT_PUBLIC_SITE_URL=https://ariahub.com
```

**Redeploy** (Vercel does this automatically)

---

## ✅ FINAL SETUP

### Your site will be accessible at:
- ✅ `https://ariahub.com` (main domain)
- ✅ `https://www.ariahub.com` (www subdomain)
- ✅ `https://your-project.vercel.app` (Vercel domain - still works)

### Database works on ALL domains:
- ✅ Same database
- ✅ Same content
- ✅ Same admin panel
- ✅ Everything identical

**Domain is just the address!**

---

## 💰 TOTAL COSTS

### Hosting on Vercel:
- **FREE** ✅ (forever)
- Includes: bandwidth, SSL, CDN, deployments

### Custom Domain:
- **$8-15/year** (one-time annual fee)
- Examples:
  - ariahub.com: ~$12/year
  - ariahub.net: ~$10/year
  - ariahub.org: ~$12/year

### Database:
- **SQLite (current):** FREE ✅
- **Vercel Postgres:** FREE tier available ✅
- **Upgrade only if needed**

### TOTAL: ~$10-15/year (just domain)

---

## 🎯 RECOMMENDED LAUNCH STRATEGY

### Phase 1: Quick Launch (Today - 10 minutes)
```
1. Deploy to Vercel with SQLite ✅
2. Use free Vercel domain: your-project.vercel.app
3. Test everything works
4. Share with friends/test users
```

**Result:** Website live, 82 opportunities visible, FREE!

---

### Phase 2: Custom Domain (This Week - 30 minutes)
```
1. Buy domain (ariahub.com)
2. Configure DNS
3. Add to Vercel
4. Update environment variable
```

**Result:** Professional domain, still FREE hosting!

---

### Phase 3: Persistent Database (Week 2 - 30 minutes)
```
1. Create Vercel Postgres database
2. Migrate schema
3. Import data
4. Redeploy
```

**Result:** Full admin functionality, auto-import works!

---

## 🔄 DATA MIGRATION (SQLite → Postgres)

### When You're Ready to Upgrade:

**I can provide a migration script to:**
- Export all data from SQLite
- Import into Postgres
- Preserve all 82 opportunities
- Keep admin users
- Maintain all settings

**Takes 15 minutes, no data lost!**

---

## 📞 QUICK ANSWERS

### Q: Will my database be hosted on Vercel?
**A:** YES! ✅ Your SQLite database file is deployed with your code.

### Q: Does custom domain change database location?
**A:** NO! Domain is just the web address. Database stays on Vercel.

### Q: Can I add content after deploying SQLite?
**A:** ⚠️ Not recommended. Changes lost on next deployment. Upgrade to Postgres for that.

### Q: How much does it cost?
**A:** Vercel hosting: FREE. Domain: $10-15/year. Postgres: FREE tier available.

### Q: Will auto-import work with SQLite?
**A:** It runs, but new data is lost on redeploy. Use Postgres for persistent imports.

### Q: Can I test with SQLite first?
**A:** YES! ✅ Perfect for testing. Upgrade to Postgres later when ready.

---

## ✅ SUMMARY

### What You Need to Know:

1. **Database IS hosted** when you deploy to Vercel ✅
2. **Custom domain** points to same database ✅
3. **SQLite works** for initial launch (view-only) ✅
4. **Upgrade to Postgres** for full functionality (FREE) ✅
5. **Total cost:** $10-15/year (just domain) ✅

### Recommended Path:

```
TODAY: Deploy with SQLite → FREE
THIS WEEK: Add custom domain → $12/year
WEEK 2: Upgrade to Postgres → FREE
```

**You can launch TODAY for FREE, then add domain + database upgrade later!**

---

## 🚀 START NOW

**For Quick Launch Today:**
```bash
# Deploy with SQLite (as-is)
git add .
git commit -m "Launch with SQLite"
git push

# Then deploy on Vercel (3 clicks)
# Database included automatically!
```

**Domain:** Use free Vercel subdomain initially  
**Database:** SQLite works for viewing content  
**Cost:** $0  
**Time:** 8 minutes  

**Upgrade domain + database later when ready!**

---

**Need help with migration to Postgres? Just ask!** 🚀
