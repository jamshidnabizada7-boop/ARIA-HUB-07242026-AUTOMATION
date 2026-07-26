# 🚀 Deploy Translation System to Vercel

## Quick Deploy Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

```bash
# AI Translation Settings
AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=llama-3.1-8b-instant

# Backup Providers (Optional)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
CEREBRAS_API_KEY=YOUR_CEREBRAS_API_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
```

### 2. Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Set environment variables
vercel env add AI_PROVIDER
# Enter: groq

vercel env add GROQ_API_KEY  
# Enter: YOUR_GROQ_API_KEY

vercel env add GROQ_MODEL
# Enter: llama-3.1-8b-instant

# Deploy
vercel --prod
```

### 3. Using Vercel Dashboard (Alternative)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `AI_PROVIDER` = `groq`
   - `GROQ_API_KEY` = `YOUR_GROQ_API_KEY`
   - `GROQ_MODEL` = `llama-3.1-8b-instant`
5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### 4. Push to Git and Deploy

```bash
# If you have a Git remote already
git remote -v

# If not, add your Vercel Git remote
git remote add origin YOUR_REPO_URL

# Push to main/master branch
git push origin master

# Or push to main
git push origin main
```

Vercel will automatically deploy when you push!

## 🔄 Alternative: Deploy Directly

If you don't have Git setup:

```bash
# Deploy directly from local
vercel --prod
```

## ✅ Verify Deployment

After deployment:

1. Visit your domain: `https://your-domain.com/admin`
2. Trigger an import
3. Check translations at: `https://your-domain.com/opportunities?lang=fa`
4. Check Pashto: `https://your-domain.com/opportunities?lang=ps`

## 🎯 What Gets Translated

- ✅ Job/scholarship titles
- ✅ Full descriptions  
- ✅ All field values (Gender, Nationality, Duration, etc.)
- ✅ Requirements, benefits, responsibilities
- ✅ SEO metadata

## ⚙️ AI Provider Priority

Current setup uses **Groq** with `llama-3.1-8b-instant`:
- ✅ 14,400 requests/day limit
- ✅ 6,000 tokens/minute
- ✅ Fast & reliable
- ✅ Perfect for production

## 🔧 Troubleshooting

### Issue: Translations not working

**Check:**
1. Environment variables are set in Vercel
2. Variables are enabled for Production environment
3. Redeploy after adding env vars

### Issue: Rate limits

**Solution:**
- Groq 8B model has generous limits
- Natural spacing between imports prevents issues
- Consider switching to Gemini if needed

### Issue: Deployment fails

**Check:**
1. All dependencies in package.json
2. Build command in vercel.json is correct
3. Node version compatibility

## 📊 Expected Performance

- Import speed: ~15-20 seconds per opportunity
- Translation quality: Excellent (natural, professional)
- API calls: ~7 per opportunity
- Daily capacity: Thousands of opportunities

## 🎉 Success!

Once deployed, your scraper will:
- Automatically translate ALL content
- Store in 3 languages (English, Persian, Pashto)  
- Display correctly with RTL support
- Work seamlessly across your domain

---

**Need help?** Check the translation documentation files in your project.
