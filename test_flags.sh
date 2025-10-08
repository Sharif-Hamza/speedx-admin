#!/bin/bash

echo "🧪 Testing Feature Flags API..."
echo ""

# Test 1: Get all flags
echo "📋 Current flags:"
curl -s "http://localhost:3000/api/features" | python3 -m json.tool | grep -A 3 '"feature_key"'
echo ""

# Test 2: Disable Blitz Mode
echo "🔄 Disabling Blitz Mode..."
curl -s -X PATCH "http://localhost:3000/api/features/blitz_mode" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}' | python3 -m json.tool
echo ""

# Test 3: Check if it stuck
sleep 1
echo "✅ Checking if Blitz Mode is disabled..."
curl -s "http://localhost:3000/api/features/blitz_mode" | python3 -m json.tool | grep -E '"feature_key"|"enabled"'
echo ""

# Test 4: Re-enable Blitz Mode
echo "🔄 Re-enabling Blitz Mode..."
curl -s -X PATCH "http://localhost:3000/api/features/blitz_mode" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}' | python3 -m json.tool
echo ""

echo "✅ Test complete!"
