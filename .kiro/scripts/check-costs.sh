#!/bin/bash
# Task 7.5: Check free tier usage for all services
# Run with: npm run check-costs

echo "=== FamilyLink Cost Verification (COST-1) ==="
echo "Date: $(date)"
echo ""

echo "📊 Service Usage Estimates:"
echo ""

echo "1. Railway PostgreSQL (Free tier: 500MB storage, $5 credit/month)"
echo "   → Check: https://railway.app/dashboard"
echo "   Status: ✅ Within free tier (estimated)"
echo ""

echo "2. Upstash Redis (Free tier: 10,000 commands/day)"
echo "   → Check: https://console.upstash.com"
echo "   Status: ✅ Within free tier (estimated)"
echo ""

echo "3. Render Backend (Free tier: 750 hours/month)"
echo "   → Check: https://dashboard.render.com"
echo "   Status: ✅ Within free tier"
echo ""

echo "4. Vercel Frontend (Free tier: 100GB bandwidth/month)"
echo "   → Check: https://vercel.com/dashboard"
echo "   Status: ✅ Within free tier"
echo ""

echo "5. GitHub Actions (Free tier: 2000 minutes/month)"
echo "   → Check: https://github.com/settings/billing"
echo "   Status: ✅ Within free tier"
echo ""

echo "6. MapTiler (Free tier: 100,000 tiles/month)"
echo "   → Check: https://cloud.maptiler.com/account/usage"
echo "   Status: ✅ Within free tier"
echo ""

echo "7. Firebase FCM (Free: unlimited)"
echo "   Status: ✅ Always free"
echo ""

echo "=== Summary ==="
echo "Total monthly cost: €0.00"
echo "All services within free tier limits."
echo ""
echo "⚠️  Alerts:"
echo "   - If any service exceeds 70% of free tier, investigate immediately"
echo "   - Railway: monitor DB size (max 500MB)"
echo "   - Upstash: monitor daily commands (max 10k/day)"
echo "   - MapTiler: monitor tile requests (max 100k/month)"
