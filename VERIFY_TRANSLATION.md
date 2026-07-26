# ✅ Translation Verification Checklist

Use this checklist to verify your translation system is working correctly.

## 🔍 Pre-Flight Checks

### ☐ 1. Environment Setup
```bash
# Check if .env.local exists
dir .env.local
```
**Expected:** File exists with your API keys

### ☐ 2. API Keys Present
```bash
# Check the file content (don't share these keys!)
type .env.local
```
**Expected:** See all your API keys configured

### ☐ 3. Dependencies Installed
```bash
npm install
```
**Expected:** No errors

## 🧪 Translation System Tests

### ☐ 4. Run Translation Test
```bash
npm run test:translation
```

**Expected Output:**
```
🧪 Testing AI Translation System

✅ AI provider loaded successfully

📝 Test Content (English):
Title: Quality Assurance / Quality Control (QA/QC) Engineer
...

🔄 Test 1: Translating title to Persian (fa)...
✅ Persian title: مهندس تضمین کیفیت / کنترل کیفیت (QA/QC)

🔄 Test 2: Translating title to Pashto (ps)...
✅ Pashto title: د کیفیت ډاډمنتیا / کنترول (QA/QC) انجینر

🔄 Test 3: Translating field values to Persian...
✅ Persian fields: {
  "Gender": "مرد",
  "Nationality": "ملی",
  "Contract Duration": "10 ماه (قابل تمدید)",
  ...
}

🔄 Test 4: Translating field values to Pashto...
✅ Pashto fields: {
  "Gender": "نارینه",
  "Nationality": "ملي",
  "Contract Duration": "10 میاشتې (د اوږدېدو وړ)",
  ...
}

✅ Translation tests completed!
```

**If you see errors:**
- Check API key is valid
- Try different provider (change AI_PROVIDER in .env.local)
- Check internet connection

## 🚀 Development Server Tests

### ☐ 5. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**If you see errors related to AI:**
- Check logs for specific provider errors
- Verify API keys are correct

### ☐ 6. Access Admin Panel
```
Visit: http://localhost:3000/admin
```

**Expected:** Admin panel loads without errors

### ☐ 7. Check Import Sources
In admin panel:
1. Navigate to "Import" section
2. View import sources list

**Expected:** See "Wazifaha Jobs" and "Scholarships.af" sources

## 📥 Import Process Tests

### ☐ 8. Trigger Manual Import
In admin panel:
1. Click "Run Import" on a source
2. Watch the progress

**Expected:**
- Status changes to "running"
- Progress updates appear
- Completes with "completed" status
- Shows "N items scraped, M items imported"

**Check logs for:**
```
[ai] Translating to fa...
[ai] Translating to ps...
✅ Translation to fa complete
✅ Translation to ps complete
```

### ☐ 9. Check Translation Status
After import completes, check the database or admin panel

**Expected:**
- translationStatus: "complete" (or "partial" if some failed)
- No "pending" status

## 🌐 Frontend Display Tests

### ☐ 10. View English Opportunities
```
Visit: http://localhost:3000/opportunities
```

**Expected:** List of opportunities in English

### ☐ 11. View Persian Opportunities
```
Visit: http://localhost:3000/opportunities?lang=fa
```

**Expected:** Same opportunities, but in Persian (Dari/فارسی)

**Check specifically:**
- [ ] Job title is in Persian
- [ ] Description is in Persian
- [ ] Field labels are in Persian (جنسیت، ملیت، etc.)
- [ ] Field VALUES are in Persian (مرد، ملی، etc.) ← IMPORTANT!
- [ ] Organization description is in Persian

### ☐ 12. View Pashto Opportunities
```
Visit: http://localhost:3000/opportunities?lang=ps
```

**Expected:** Same opportunities, but in Pashto (پښتو)

**Check specifically:**
- [ ] Job title is in Pashto
- [ ] Description is in Pashto
- [ ] Field labels are in Pashto
- [ ] Field VALUES are in Pashto (نارینه، ملي، etc.) ← IMPORTANT!
- [ ] Organization description is in Pashto

### ☐ 13. View Single Opportunity Detail Page

**English:**
```
http://localhost:3000/opportunities/[slug]
```

**Persian:**
```
http://localhost:3000/opportunities/[slug]?lang=fa
```

**Pashto:**
```
http://localhost:3000/opportunities/[slug]?lang=ps
```

**Check on detail page:**
- [ ] Title translated
- [ ] Full description translated
- [ ] Requirements section translated
- [ ] Benefits section translated
- [ ] Responsibilities section translated
- [ ] ALL extracted fields translated (both labels and values)
- [ ] Organization name handled correctly
- [ ] Dates, URLs, emails preserved

## 🔬 Database Verification

### ☐ 14. Check Database Records

If you have database access:

```sql
SELECT 
  title,
  titleI18n,
  extractedDataI18n,
  translationStatus
FROM Opportunity
LIMIT 1;
```

**Expected:**
```json
{
  "title": "Quality Assurance Engineer",
  "titleI18n": {
    "en": "Quality Assurance Engineer",
    "fa": "مهندس تضمین کیفیت",
    "ps": "د کیفیت انجینر"
  },
  "extractedDataI18n": {
    "en": {
      "Gender": "Male",
      "Nationality": "National"
    },
    "fa": {
      "Gender": "مرد",
      "Nationality": "ملی"
    },
    "ps": {
      "Gender": "نارینه",
      "Nationality": "ملي"
    }
  },
  "translationStatus": "complete"
}
```

## 🎯 Quality Checks

### ☐ 15. Verify Translation Quality

Pick one opportunity and check:

**Title Translation:**
- [ ] Makes sense in target language
- [ ] Technical terms translated appropriately
- [ ] No English words (except proper nouns)

**Description Translation:**
- [ ] Natural, fluent language
- [ ] No word-for-word literal translation
- [ ] Professional tone maintained
- [ ] Markdown formatting preserved

**Field Values Translation:**
- [ ] "Male" → "مرد" (Persian) / "نارینه" (Pashto)
- [ ] "Female" → "زن" (Persian) / "ښځينه" (Pashto)
- [ ] "Full-time" → "تمام وقت" (Persian) / "بشپړ وخت" (Pashto)
- [ ] Numbers preserved: "10 months" → "10 ماه"

**Preservation Check:**
- [ ] Organization names kept as-is (or translated appropriately)
- [ ] URLs unchanged
- [ ] Email addresses unchanged
- [ ] Dates unchanged
- [ ] Document names unchanged (TOEFL, IELTS, etc.)

## 📊 Performance Checks

### ☐ 16. Check Import Speed

Time a full import run:

**Expected:**
- Single opportunity: ~10-20 seconds (including all translations)
- 10 opportunities: ~2-5 minutes
- Depends on AI provider and API response time

**Groq is fastest** - should be under 2 seconds per API call

### ☐ 17. Check API Usage

Monitor your API usage:
- Groq: Check dashboard at groq.com
- OpenRouter: Check at openrouter.ai
- Cerebras: Check at cerebras.ai

**Expected:** ~7 API calls per opportunity

## 🐛 Troubleshooting

### Problem: No translation happening

**Check:**
1. [ ] .env.local file exists
2. [ ] API_PROVIDER is set
3. [ ] Corresponding API key is set
4. [ ] No errors in server logs
5. [ ] API key is valid (not expired)

**Fix:** Run `npm run test:translation` to diagnose

### Problem: Only English showing

**Check:**
1. [ ] Using correct URL parameter: ?lang=fa or ?lang=ps
2. [ ] Translation completed (check translationStatus)
3. [ ] No JavaScript errors in browser console

### Problem: Only labels translated, not values

**This should be FIXED now!** If still happening:

**Check:**
1. [ ] Using NEW providers (Groq/OpenRouter/Cerebras)
2. [ ] Not using old system
3. [ ] Re-import the opportunities
4. [ ] Check extractedDataI18n has all languages

### Problem: Poor translation quality

**Try:**
1. [ ] Switch to Groq (best quality): `AI_PROVIDER=groq`
2. [ ] Check source content is clear and well-formatted
3. [ ] Try different model (update MODEL env var)

### Problem: API rate limits

**Solution:**
1. [ ] Spread out imports (increase scheduleMinutes)
2. [ ] Switch to different provider
3. [ ] Reduce maxPages per source

## ✅ Success Criteria

You've successfully set up translation when:

- [x] All tests pass (`npm run test:translation`)
- [x] Server starts without errors
- [x] Import completes successfully
- [x] Opportunities visible in all 3 languages
- [x] **Both labels AND values are translated**
- [x] Translations are natural and professional
- [x] URLs, dates, emails preserved
- [x] No JavaScript errors in browser

## 🎉 Final Verification

### The Ultimate Test:

1. **Import 1-2 opportunities**
2. **View in Persian** - Should see:
   ```
   عنوان: مهندس تضمین کیفیت
   جنسیت: مرد
   ملیت: ملی
   توضیحات: [Full Persian text]
   ```
3. **View in Pashto** - Should see:
   ```
   سرلیک: د کیفیت انجینر
   جنسیت: نارینه
   ملیت: ملي
   توضیحات: [Full Pashto text]
   ```

**If you see this ↑ YOU'RE DONE! 🎊**

## 📞 Still Having Issues?

1. Check server logs for detailed error messages
2. Review `AI_TRANSLATION_SETUP.md` for detailed troubleshooting
3. Try different AI provider
4. Run `npm run test:translation` and share output

---

**Status:** [ ] All checks passed ✅ / [ ] Some issues found ⚠️

**Date tested:** _____________

**Notes:** _____________________________________
