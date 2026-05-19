#!/bin/bash
# Task 8.7: Smoke tests for production deployment
# Usage: ./scripts/smoke-test.sh https://familylink-api.onrender.com

API_URL=${1:-"http://localhost:3000"}

echo "=== FamilyLink Smoke Tests ==="
echo "Target: $API_URL"
echo ""

# Test 1: Health check
echo -n "1. Health check... "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH" = "200" ]; then
  echo "✅ OK (200)"
else
  echo "❌ FAILED ($HEALTH)"
  exit 1
fi

# Test 2: Health response body
echo -n "2. Health response body... "
BODY=$(curl -s "$API_URL/health")
if echo "$BODY" | grep -q '"status":"ok"'; then
  echo "✅ OK (status: ok)"
elif echo "$BODY" | grep -q '"status":"degraded"'; then
  echo "⚠️  DEGRADED"
else
  echo "❌ UNEXPECTED: $BODY"
fi

# Test 3: Auth endpoint exists
echo -n "3. Auth register endpoint... "
REGISTER=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/v1/auth/register" -H "Content-Type: application/json" -d '{}')
if [ "$REGISTER" = "400" ]; then
  echo "✅ OK (400 = validation working)"
else
  echo "⚠️  Unexpected: $REGISTER"
fi

# Test 4: Protected endpoint requires auth
echo -n "4. Protected endpoint (no auth)... "
CIRCLES=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/circles")
if [ "$CIRCLES" = "401" ]; then
  echo "✅ OK (401 = auth required)"
else
  echo "⚠️  Unexpected: $CIRCLES"
fi

# Test 5: Metrics endpoint
echo -n "5. Metrics endpoint... "
METRICS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/metrics")
if [ "$METRICS" = "200" ]; then
  echo "✅ OK (200)"
else
  echo "⚠️  Unexpected: $METRICS"
fi

# Test 6: Rate limiting headers
echo -n "6. Rate limit headers... "
HEADERS=$(curl -s -I "$API_URL/health" | grep -i "ratelimit")
if [ -n "$HEADERS" ]; then
  echo "✅ OK (rate limit headers present)"
else
  echo "⚠️  No rate limit headers found"
fi

echo ""
echo "=== Smoke Tests Complete ==="
