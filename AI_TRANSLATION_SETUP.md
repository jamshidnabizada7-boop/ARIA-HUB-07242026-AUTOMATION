# AI Translation Setup Guide

This guide explains how to configure the AI translation system for your scraper to translate content into Persian (Dari/فارسی) and Pashto (پښتو).

## Overview

The scraper now supports automatic translation of ALL content including:
- ✅ Job titles and descriptions
- ✅ Organization information
- ✅ Requirements, responsibilities, and eligibility criteria
- ✅ Benefits and compensation details
- ✅ All extracted field values (Gender, Nationality, Contract Duration, etc.)
- ✅ SEO metadata (titles, descriptions, keywords)

## Supported AI Providers

You can use any of these FREE AI providers:

### 1. **Groq** (RECOMMENDED - Fast & Free)
- Model: Llama 3.3 70B
- Speed: Ultra-fast inference
- Free tier: Generous limits
- Best for: Production use

### 2. **OpenRouter**
- Access to multiple models
- Model: Llama 3.3 70B Instruct
- Free tier available

### 3. **Cerebras**
- Ultra-fast inference
- Model: Llama 3.1 70B
- Free tier available

### 4. **Google AI Studio (Gemini)**
- Model: Gemini 2.0 Flash
- Free tier available

## Configuration

### Step 1: Set Environment Variables

The `.env.local` file has been created with your API keys. You can switch providers by changing the `AI_PROVIDER` variable:

```bash
# Choose one: groq, openrouter, cerebras, gemini
AI_PROVIDER=groq

# Groq (RECOMMENDED)
GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile

# OpenRouter (Backup)
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct

# Cerebras (Backup)
CEREBRAS_API_KEY=YOUR_CEREBRAS_API_KEY
CEREBRAS_MODEL=llama3.1-70b

# Google Gemini (Backup)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash
```

### Step 2: Verify the Setup

Run the import command to test:

```bash
npm run dev
```

Then trigger an import from the admin panel or API endpoint.

## How It Works

### Translation Pipeline

1. **Scraping**: The scraper extracts content from websites (Wazifaha, Scholarships.af, etc.)

2. **Rewriting**: English content is professionally rewritten for clarity and SEO

3. **Translation**: Content is translated into Persian and Pashto:
   - Job titles → Translated
   - Descriptions → Translated
   - All sections (eligibility, benefits, requirements) → Translated
   - Field labels AND values → Translated
   - SEO metadata → Translated

4. **Storage**: All languages stored in i18n fields:
   ```typescript
   {
     title: "Original English",
     titleI18n: {
       en: "English Title",
       fa: "عنوان فارسی",
       ps: "پښتو سرلیک"
     },
     description: "Original English description",
     descriptionI18n: {
       en: "English description",
       fa: "توضیحات فارسی",
       ps: "پښتو توضیحات"
     }
   }
   ```

### What Gets Translated

✅ **Translated Content:**
- Job/scholarship titles
- Full descriptions
- Organization names (when appropriate)
- All text sections (responsibilities, requirements, eligibility, benefits)
- Field values (Male/Female, Full-time/Part-time, etc.)
- Categories and tags
- SEO titles and descriptions

❌ **NOT Translated (Preserved):**
- URLs and web links
- Email addresses
- Phone numbers
- Dates and deadlines
- Document names (TOEFL, IELTS, Passport, etc.)
- Application links
- Numbers and currency amounts

## Troubleshooting

### Issue: Content not translating

**Check:**
1. Verify API key is set in `.env.local`
2. Check the provider is correctly set
3. Look at server logs for AI errors
4. Try a different provider if one fails

### Issue: Partial translation

**Solution:**
- The system marks translation status as 'partial' or 'complete'
- Check which fields failed in the database
- Re-run the import to retry failed translations

### Issue: API rate limits

**Solution:**
- Switch to a different provider
- Adjust `scheduleMinutes` in import source settings
- Reduce `maxPages` in scraper config

### Issue: Poor translation quality

**Solution:**
- Try a different model/provider
- Groq with Llama 3.3 70B typically provides best quality
- Check that the source content is clear and well-formatted

## API Endpoints

### Trigger Manual Import
```bash
GET /api/admin/import/simple-import
```

### Check Import Status
```bash
GET /api/admin/import/runs
```

### View Translated Opportunities
```bash
GET /api/opportunities?lang=fa  # Persian
GET /api/opportunities?lang=ps  # Pashto
```

## Monitoring

Check translation status in the admin panel:
- Import runs show success/failure counts
- Each opportunity shows `translationStatus` field
- View opportunities in different languages to verify

## Performance Tips

1. **Use Groq** for fastest translation (recommended)
2. **Batch processing** is automatic - multiple fields translated in one API call
3. **Caching** - Translated content is stored and not re-translated
4. **Retries** - Failed translations are automatically retried up to 3 times

## Support

If you encounter issues:
1. Check server logs: `npm run dev` output
2. Verify API keys are valid
3. Test with a single opportunity first
4. Try different AI providers

## Notes

- Translation preserves all Markdown formatting
- RTL (right-to-left) text is properly handled for Persian and Pashto
- Technical terms are translated with originals in parentheses when needed
- All translations are stored in database i18n fields for multi-language support
