# Translation Flow Diagram

## 📊 Complete Translation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. WEB SCRAPING PHASE                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │  Wazifaha.org / Scholarships.af / etc.  │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Extract Raw Data (English):           │
        │   - Title                               │
        │   - Description                         │
        │   - Organization                        │
        │   - Fields (Gender, Nationality, etc.)  │
        │   - Requirements, Benefits, etc.        │
        └─────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. AI PROCESSING PHASE                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Step 2.1: Rewrite (English)          │
        │   - Professional tone                   │
        │   - SEO optimization                    │
        │   - Grammar fixes                       │
        │   - Generate summary                    │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Step 2.2: Translate to Persian (fa)  │
        │                                         │
        │   Batch Translation Call 1:             │
        │   ├─ Title                              │
        │   ├─ Summary                            │
        │   ├─ All field values (Gender, etc.)   │
        │   └─ Section texts (requirements, etc.)│
        │                                         │
        │   Single Translation Call 2:            │
        │   └─ Full Description (long text)      │
        │                                         │
        │   SEO Generation Call 3:                │
        │   └─ Persian SEO metadata              │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Step 2.3: Translate to Pashto (ps)   │
        │                                         │
        │   Batch Translation Call 1:             │
        │   ├─ Title                              │
        │   ├─ Summary                            │
        │   ├─ All field values                  │
        │   └─ Section texts                     │
        │                                         │
        │   Single Translation Call 2:            │
        │   └─ Full Description                  │
        │                                         │
        │   SEO Generation Call 3:                │
        │   └─ Pashto SEO metadata               │
        └─────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   3. DATABASE STORAGE                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Store in Database with i18n Fields:   │
        │                                         │
        │   title: "Quality Assurance Engineer"  │
        │   titleI18n: {                         │
        │     en: "Quality Assurance Engineer"   │
        │     fa: "مهندس تضمین کیفیت"            │
        │     ps: "د کیفیت انجینر"               │
        │   }                                     │
        │                                         │
        │   extractedDataI18n: {                 │
        │     en: {                               │
        │       Gender: "Male",                  │
        │       Nationality: "National"          │
        │     },                                  │
        │     fa: {                               │
        │       Gender: "مرد",                   │
        │       Nationality: "ملی"               │
        │     },                                  │
        │     ps: {                               │
        │       Gender: "نارینه",                │
        │       Nationality: "ملي"               │
        │     }                                   │
        │   }                                     │
        │                                         │
        │   descriptionI18n: { en, fa, ps }      │
        │   requirementsI18n: { en, fa, ps }     │
        │   benefitsI18n: { en, fa, ps }         │
        │   ... and all other fields             │
        └─────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. FRONTEND DISPLAY                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   User visits: /opportunities?lang=fa   │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   getLocalizedContent() helper          │
        │   extracts Persian (fa) values:         │
        │                                         │
        │   titleI18n.fa → "مهندس تضمین کیفیت"   │
        │   descriptionI18n.fa → Persian text    │
        │   extractedDataI18n.fa → {             │
        │     Gender: "مرد",                     │
        │     Nationality: "ملی"                 │
        │   }                                     │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Display fully translated page:        │
        │                                         │
        │   Title: مهندس تضمین کیفیت             │
        │   جنسیت: مرد                            │
        │   ملیت: ملی                             │
        │   Description: [Persian text]           │
        └─────────────────────────────────────────┘
```

## 🔄 API Call Optimization

### Old Approach (Many Calls):
```
Title       → API Call 1
Description → API Call 2
Gender      → API Call 3
Nationality → API Call 4
...         → API Call N
```

### New Approach (Batched):
```
{
  title: "...",
  summary: "...",
  sec_requirements: "...",
  sec_benefits: "...",
  ext_Gender: "Male",
  ext_Nationality: "National",
  ext_Duration: "10 months"
} → Single API Call! ✅

Long description → Separate call (to avoid JSON issues)
```

**Result:** ~7 API calls per opportunity instead of 20+

## 🚀 AI Provider Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Provider Selection                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Read AI_PROVIDER from .env.local      │
        │   Default: groq                         │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Load Provider Implementation:         │
        │                                         │
        │   groq       → GroqProvider             │
        │   openrouter → OpenRouterProvider       │
        │   cerebras   → CerebrasProvider         │
        │   gemini     → GeminiProvider           │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Provider makes API call:              │
        │                                         │
        │   POST https://api.groq.com/...         │
        │   Headers:                              │
        │     Authorization: Bearer YOUR_API_KEY  │
        │   Body:                                 │
        │     model: llama-3.3-70b-versatile      │
        │     messages: [system, user]            │
        │     temperature: 0.3                    │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Receive Response:                     │
        │   {                                     │
        │     "choices": [{                       │
        │       "message": {                      │
        │         "content": "{\"text\": \"...\"}"│
        │       }                                 │
        │     }]                                  │
        │   }                                     │
        └─────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │   Parse JSON Response                   │
        │   Extract translated text               │
        │   Return to pipeline                    │
        └─────────────────────────────────────────┘
```

## 🎯 Translation Quality Control

```
┌─────────────────────────────────────────────────────────────────┐
│                  Translation Validation                         │
└─────────────────────────────────────────────────────────────────┘

Input: "Male"
       ↓
┌──────────────────────────┐
│  AI Provider translates: │
│  fa: "مرد"               │
│  ps: "نارینه"            │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│  Validation checks:      │
│  ✅ Not empty           │
│  ✅ Different from input│
│  ✅ In target language  │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│  Store in database       │
│  with translationStatus: │
│  "complete"              │
└──────────────────────────┘
```

## 📦 What Gets Preserved

```
Input Text:
"Apply at jobs@company.com before Jan 15, 2025. 
Salary: $3,000. Required: TOEFL, IELTS.
Visit: https://company.com/careers"

                    ↓

Translation Process:
┌────────────────────────────────────────────┐
│  Translate:    "Apply", "before", "Salary" │
│                "Required", "Visit"         │
│                                            │
│  Keep as-is:   jobs@company.com            │
│                Jan 15, 2025                │
│                $3,000                      │
│                TOEFL, IELTS                │
│                https://company.com/careers  │
└────────────────────────────────────────────┘

                    ↓

Output (Persian):
"در jobs@company.com قبل از Jan 15, 2025 درخواست دهید.
حقوق: $3,000. مورد نیاز: TOEFL, IELTS.
بازدید: https://company.com/careers"
```

## 🎊 Result Comparison

### BEFORE (Problem):
```
┌─────────────────────────────────────────┐
│  Quality Assurance Engineer             │
│  جنسیت: Male         ← Only label!      │
│  ملیت: National      ← Only label!      │
│  Description: [English text...]         │
└─────────────────────────────────────────┘
```

### AFTER (Solution):
```
┌─────────────────────────────────────────┐
│  مهندس تضمین کیفیت                      │
│  جنسیت: مرد          ← Both!           │
│  ملیت: ملی           ← Both!           │
│  توضیحات: [Persian text...]             │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Commands

```bash
# Test translation system
npm run test:translation

# Start development server
npm run dev

# Check logs for translation status
# Look for: "✅ Translation to fa complete"
```

## 📚 Related Files

- `.env.local` - API keys and provider config
- `src/lib/ai/provider.ts` - Provider factory
- `src/lib/ai/providers/groq.ts` - Groq implementation
- `src/lib/ai/pipeline.ts` - Translation orchestration
- `src/lib/ai/prompts.ts` - Translation instructions
