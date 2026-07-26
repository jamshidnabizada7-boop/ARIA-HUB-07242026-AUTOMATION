# 🚀 DEPLOY TO VERCEL NOW - Simple Guide

## Method 1: Using Vercel Dashboard (EASIEST)

### Step 1: Push Your Code to GitHub

```bash
# If you don't have a GitHub repo yet, create one at github.com
# Then add it as remote:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push your code
git push -u origin master
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project

### Step 3: Add Environment Variables

Before clicking "Deploy", add these environment variables:

```
AI_PROVIDER = groq
GROQ_API_KEY = YOUR_GROQ_API_KEY
GROQ_MODEL = llama-3.1-8b-instant
```

Also add your existing environment variables (database, etc.)

### Step 4: Deploy!

Click "Deploy" and wait ~5 minutes.

---

## Method 2: Using Vercel CLI (FAST)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
cd "d:\ARIA-HUB-07242026-AUTOMATION-main (1)\ARIA-HUB-07242026-AUTOMATION-main"

# Deploy to production
vercel --prod
```

### Step 4: Set Environment Variables

After deployment, go to your Vercel dashboard:
1. Select your project
2. Go to Settings → Environment Variables
3. Add:
   - `AI_PROVIDER` = `groq`
   - `GROQ_API_KEY` = `YOUR_GROQ_API_KEY`
   - `GROQ_MODEL` = `llama-3.1-8b-instant`
4. Redeploy for changes to take effect

---

## Method 3: Connect Existing Vercel Project

If you already have a Vercel project:

### Step 1: Link Your Local Project

```bash
vercel link
```

Follow the prompts to link to your existing project.

### Step 2: Set Environment Variables via CLI

```bash
vercel env add AI_PROVIDER production
# Enter: groq

vercel env add GROQ_API_KEY production
# Paste: YOUR_GROQ_API_KEY

vercel env add GROQ_MODEL production
# Enter: llama-3.1-8b-instant
```

### Step 3: Deploy

```bash
git push origin master
```

Or deploy directly:

```bash
vercel --prod
```

---

## ✅ Verify Your Deployment

After deployment:

1. **Visit your domain:** `https://your-domain.com`
2. **Go to admin:** `https://your-domain.com/admin`
3. **Trigger import:** Click "Run Import" on a source
4. **Check Persian:** `https://your-domain.com/opportunities?lang=fa`
5. **Check Pashto:** `https://your-domain.com/opportunities?lang=ps`

---

## 🎯 What You Should See

### Before Translation (English only):
```
Title: Quality Assurance Engineer
Gender: Male
Nationality: National
```

### After Translation (Persian):
```
عنوان: مهندس تضمین کیفیت
جنسیت: مرد
ملیت: ملی
```

### After Translation (Pashto):
```
سرلیک: د کیفیت انجینر
جنسیت: نارینه
ملیت: ملي
```

---

## 🔧 Troubleshooting

### "Build failed"
- Check that all dependencies are in package.json
- Verify Next.js version compatibility

### "Environment variables not found"
- Make sure you added them in Vercel dashboard
- Select "Production" environment when adding
- Redeploy after adding variables

### "Translations not working"
- Check admin logs for AI errors
- Verify GROQ_API_KEY is correct
- Try re-running import

---

## 📊 Expected Results

- **Build time:** ~3-5 minutes
- **Translation speed:** ~15-20 seconds per opportunity
- **Daily capacity:** Thousands of opportunities
- **Languages:** English, Persian (Dari), Pashto

---

## 🎉 Success!

Once deployed, every new scraped opportunity will automatically:
- ✅ Be translated to Persian and Pashto
- ✅ Have all content translated (titles, descriptions, fields)
- ✅ Store in database with proper i18n support
- ✅ Display correctly with RTL support

**You're all set!** 🚀
