#!/bin/bash

echo "🧪 Testing MCA Filing Automation API"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -n "Checking if backend is running... "
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "${YELLOW}Please start the backend with: cd backend && npm run dev${NC}"
    exit 1
fi

echo ""
echo "📋 Test 1: Create a new company"
echo "--------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "cin": "U12345MH2023PTC999999",
    "name": "Test Company Private Limited",
    "email": "test@testcompany.com",
    "companyType": "PRIVATE",
    "registeredAddress": "123 Test Street, Mumbai, MH 400001",
    "authorizedCapital": 10000000,
    "paidUpCapital": 5000000,
    "incorporationDate": "2023-01-15"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Company created successfully${NC}"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo -e "${RED}✗ Failed to create company${NC}"
    echo "$RESPONSE" | python3 -m json.tool
fi

echo ""
echo "📋 Test 2: Get all companies"
echo "--------------------------------"

RESPONSE=$(curl -s http://localhost:4000/api/companies)

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Successfully fetched companies${NC}"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo -e "${RED}✗ Failed to fetch companies${NC}"
    echo "$RESPONSE" | python3 -m json.tool
fi

echo ""
echo "📋 Test 3: Test duplicate CIN error"
echo "--------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "cin": "U12345MH2023PTC999999",
    "name": "Duplicate Company",
    "email": "duplicate@test.com",
    "companyType": "PRIVATE"
  }')

if echo "$RESPONSE" | grep -q 'already exists'; then
    echo -e "${GREEN}✓ Duplicate CIN correctly rejected${NC}"
    echo "$RESPONSE" | python3 -m json.tool
else
    echo -e "${YELLOW}⚠ Expected duplicate error${NC}"
    echo "$RESPONSE" | python3 -m json.tool
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ API Testing Complete!${NC}"
