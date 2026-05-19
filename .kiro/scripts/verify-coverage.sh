#!/bin/bash
# Task 6.6: Verify test coverage meets thresholds

echo "=== FamilyLink Coverage Verification ==="
echo ""

echo "--- Backend Unit Tests ---"
cd backend && npx vitest run --coverage 2>/dev/null
BACKEND_EXIT=$?

echo ""
echo "--- Frontend Unit Tests ---"
cd ../frontend && npx vitest run --coverage 2>/dev/null
FRONTEND_EXIT=$?

echo ""
echo "=== Results ==="
if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
  echo "✅ All coverage thresholds met"
  exit 0
else
  echo "❌ Coverage thresholds not met"
  exit 1
fi
