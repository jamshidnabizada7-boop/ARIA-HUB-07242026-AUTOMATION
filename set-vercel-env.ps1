# Set Vercel Environment Variables
# Run this script to configure your Vercel project

Write-Host "Setting up Vercel environment variables..." -ForegroundColor Green

# DATABASE_URL
Write-Host "`nAdding DATABASE_URL..." -ForegroundColor Yellow
echo "file:./db/custom.db" | vercel env add DATABASE_URL production

# ADMIN_SESSION_SECRET
Write-Host "`nAdding ADMIN_SESSION_SECRET..." -ForegroundColor Yellow
echo "PEcmdjknvhxy7XA6LCoRtKgwluzDVqY0s4TpirO92MGI8HQ5JaBN1bUeZSfW3F" | vercel env add ADMIN_SESSION_SECRET production

# NODE_ENV
Write-Host "`nAdding NODE_ENV..." -ForegroundColor Yellow
echo "production" | vercel env add NODE_ENV production

Write-Host "`n✅ Environment variables configured!" -ForegroundColor Green
Write-Host "Now run: vercel --prod" -ForegroundColor Cyan
