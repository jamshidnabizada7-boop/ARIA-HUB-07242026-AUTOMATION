# 🚀 ARIA HUB - Deployment Guide

## Recommended Hosting: Vercel (FREE)

Vercel is the BEST choice for Next.js applications - it's made by the creators of Next.js!

### ✨ Why Vercel?
- ✅ **FREE** for personal/hobby projects
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificate (HTTPS)
- ✅ Global CDN (super fast worldwide)
- ✅ Automatic image optimization
- ✅ Easy custom domain setup
- ✅ Zero configuration needed

---

## 🎯 Step-by-Step Deployment to Vercel

### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository

1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find **"ARIA-HUB"** and click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

**Environment Variables:** Click "Add" and add these:

```env
DATABASE_URL=file:./prisma/db/custom.db
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

*(Replace `your-domain` with your actual Vercel domain after deployment)*

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://aria-hub-xxx.vercel.app`
4. ✅ **Your site is LIVE!**

---

## 🔧 Post-Deployment Setup

### 1. Initialize Database

Your database is currently empty on production. You need to seed it:

**Option A: Use Local Database (Recommended for Quick Start)**

Your local `db/custom.db` file is already in the repository and will be deployed. All your existing data is there!

**Option B: Create New Production Database**

After deployment, run these commands locally with production environment:

```bash
# Set production database URL
$env:DATABASE_URL="file:./prisma/db/custom.db"

# Push schema
npx prisma db push

# Seed admin user
npx tsx scripts/seed-admin.ts

# Create menu items
npx tsx scripts/create-default-menu.ts

# Update language names
npx tsx scripts/update-language-names.ts
```

### 2. Access Admin Panel

1. Go to `https://your-domain.vercel.app`
2. Click the logo 5 times quickly (within 2 seconds)
3. Or navigate directly to `https://your-domain.vercel.app/admin`
4. Login with your admin credentials from `scripts/seed-admin.ts`

### 3. Add Your Logo

1. Upload your logo file to `public/images/aria-logo.png`
2. Push to GitHub: `git add . && git commit -m "Add logo" && git push`
3. Vercel will automatically redeploy!

---

## 🌐 Custom Domain Setup

### Free Vercel Domain

You automatically get: `https://aria-hub-xxx.vercel.app`

### Add Your Own Domain (Example: ariahub.com)

1. Buy a domain from:
   - **Namecheap** (recommended, cheap)
   - **GoDaddy**
   - **Google Domains**
   - **Cloudflare**

2. In Vercel Dashboard:
   - Go to your project → **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain (e.g., `ariahub.com`)
   - Click **"Add"**

3. Configure DNS (at your domain registrar):
   - Add **A Record**: `76.76.21.21`
   - Add **CNAME Record**: `cname.vercel-dns.com`

4. Wait 5-30 minutes for DNS propagation
5. ✅ Your custom domain is live with FREE SSL!

---

## 🔄 Automatic Deployments

Once set up, every time you push to GitHub:

```bash
git add .
git commit -m "Update content"
git push
```

Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys to production
4. Updates your live site

**No manual work needed!** 🎉

---

## 📊 Alternative Hosting Options

### Option 2: Netlify (Also FREE)

**Pros:**
- Free tier
- Automatic deployments
- Custom domains

**Cons:**
- Slightly slower than Vercel for Next.js
- More configuration needed

**Deploy to Netlify:**
1. Go to **https://netlify.com**
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import from Git"**
4. Select **ARIA-HUB**
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click **"Deploy"**

### Option 3: VPS (DigitalOcean, Linode, AWS)

**Cost:** $5-20/month

**Pros:**
- Full control
- Can run database
- Good for scaling

**Cons:**
- Requires technical knowledge
- Manual setup
- Need to manage server

**Not recommended unless you need advanced features.**

---

## 🛠️ Production Checklist

Before going live, make sure:

- [ ] Admin credentials are secure (change from defaults)
- [ ] Add your actual logo at `public/images/aria-logo.png`
- [ ] Update site settings in admin panel:
  - Site name
  - Contact information
  - Social media links
- [ ] Add real content:
  - Services
  - Visas
  - Opportunities
  - News articles
- [ ] Configure custom domain
- [ ] Set up Google Analytics (optional)
- [ ] Test all forms:
  - Contact form
  - Newsletter signup
- [ ] Test on mobile devices
- [ ] Test language switching (EN, FA, PS)

---

## 🔐 Security Tips

1. **Change Admin Password:**
   - Login to admin panel
   - Go to settings
   - Update admin credentials

2. **Environment Variables:**
   - Never commit `.env` to GitHub
   - Use Vercel's Environment Variables section

3. **Database Backups:**
   ```bash
   # Backup database locally
   cp prisma/db/custom.db prisma/db/backup-$(date +%Y%m%d).db
   ```

4. **Enable Two-Factor Auth:**
   - Add 2FA to your GitHub account
   - Add 2FA to your Vercel account

---

## 📈 Monitoring & Analytics

### Add Google Analytics

1. Get your GA4 ID from Google Analytics
2. Add to Admin Panel → Site Settings → `gaId`
3. Tracking will start automatically!

### Vercel Analytics

1. In Vercel Dashboard → Your Project
2. Go to **"Analytics"** tab
3. Enable Vercel Analytics (FREE)
4. See real-time visitor stats!

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Issue:** Build error during deployment

**Solution:**
1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in `package.json`
3. Test build locally: `npm run build`
4. Common issue: Missing environment variables

### Database Not Found

**Issue:** "Database file not found" error

**Solution:**
```bash
# Make sure database is committed to Git
git add prisma/db/custom.db -f
git commit -m "Add database"
git push
```

### Images Not Loading

**Issue:** Images showing 404

**Solution:**
1. Check images are in `public/images/` folder
2. Make sure paths in admin panel don't have `/public`
3. Use relative paths: `/images/logo.png` not `public/images/logo.png`

### Admin Panel Not Accessible

**Issue:** Can't access /admin

**Solution:**
1. Clear browser cache
2. Try incognito/private mode
3. Check if you're logged in
4. Verify admin user exists in database

---

## 💰 Pricing (Vercel)

### Free Plan (Hobby)
- Perfect for ARIA HUB
- Unlimited bandwidth
- Automatic SSL
- Custom domain (1 free)
- 100GB bandwidth/month
- **$0/month** ✅

### Pro Plan (If you grow)
- $20/month
- Team collaboration
- Advanced analytics
- Priority support
- Password protection

**Recommendation:** Start with FREE plan! Upgrade only if needed.

---

## 🎉 You're Ready to Launch!

Your ARIA HUB is now ready to go live. Follow the Vercel deployment steps above and you'll have a professional, fast, secure website in less than 10 minutes!

### Quick Launch Summary:

1. ✅ Sign up at vercel.com with GitHub
2. ✅ Import ARIA-HUB repository
3. ✅ Add environment variables
4. ✅ Click Deploy
5. ✅ Wait 2-3 minutes
6. ✅ Your site is LIVE! 🚀

**Need help?** Contact your development team or check Vercel's excellent documentation at https://vercel.com/docs

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Your GitHub Repo:** https://github.com/jamshidnabizada7-boop/ARIA-HUB

Good luck with your launch! 🎊
