# Deploy to Vercel with Environment Variables
# This script helps you deploy your translation system to Vercel

Write-Host "🚀 Deploying Translation System to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    Write-Host ""
}

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host ""
Write-Host "🔗 Linking to your Vercel project..." -ForegroundColor Cyan
vercel link

Write-Host ""
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Cyan
Write-Host ""

# Set AI Provider
Write-Host "Setting AI_PROVIDER..." -ForegroundColor Yellow
echo "groq" | vercel env add AI_PROVIDER production

# Set Groq API Key
Write-Host "Setting GROQ_API_KEY..." -ForegroundColor Yellow
echo "YOUR_GROQ_API_KEY" | vercel env add GROQ_API_KEY production

# Set Groq Model
Write-Host "Setting GROQ_MODEL..." -ForegroundColor Yellow
echo "llama-3.1-8b-instant" | vercel env add GROQ_MODEL production

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host ""

# Deploy
Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Visit your domain/admin" -ForegroundColor White
Write-Host "  2. Trigger an import" -ForegroundColor White
Write-Host "  3. Check translations at /opportunities with ?lang=fa" -ForegroundColor White
Write-Host "  4. Check Pashto at /opportunities with ?lang=ps" -ForegroundColor White
Write-Host ""
