#!/bin/bash
# Test script for FamilyLink API

API="http://localhost:3000/api/v1"

echo "=== FamilyLink API Test ==="
echo ""

# Test 1: Health
echo "1. Health check..."
curl -s http://localhost:3000/health
echo ""
echo ""

# Test 2: Register
echo "2. Register user..."
REGISTER=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@familylink.com","username":"Tester","password":"TestPass123"}')
echo "$REGISTER"
echo ""

# Extract token
ACCESS_TOKEN=$(echo "$REGISTER" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Test 3: Login
echo "3. Login..."
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@familylink.com","password":"TestPass123"}')
echo "$LOGIN"
echo ""

# Update token from login
ACCESS_TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Test 4: Create circle
echo "4. Create circle..."
CIRCLE=$(curl -s -X POST "$API/circles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"name":"Mi Familia"}')
echo "$CIRCLE"
echo ""

echo "=== Done ==="
