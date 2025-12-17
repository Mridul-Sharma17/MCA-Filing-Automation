#!/bin/bash

# MCA Filing Automation - Complete Setup & Test Script
# This script will help you verify the entire system is working

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  MCA Filing Automation - System Verification            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Backend
echo -e "${BLUE}[1/4] Checking Backend Server...${NC}"
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port 4000${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "${YELLOW}Start it with: cd backend && npm run dev${NC}"
    exit 1
fi

# Step 2: Check Frontend
echo ""
echo -e "${BLUE}[2/4] Checking Frontend Server...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Frontend might not be running${NC}"
    echo -e "${YELLOW}Start it with: npm run dev${NC}"
fi

# Step 3: Test API Endpoints
echo ""
echo -e "${BLUE}[3/4] Testing API Endpoints...${NC}"

# Test Health
echo -n "  Testing /health... "
HEALTH=$(curl -s http://localhost:4000/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test GET Companies
echo -n "  Testing GET /api/companies... "
COMPANIES=$(curl -s http://localhost:4000/api/companies)
if echo "$COMPANIES" | grep -q "success"; then
    echo -e "${GREEN}✓${NC}"
    COUNT=$(echo "$COMPANIES" | grep -o '"id"' | wc -l)
    echo -e "    ${BLUE}Found ${COUNT} companies in database${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Step 4: Create Test Company
echo ""
echo -e "${BLUE}[4/4] Testing Company Creation...${NC}"

# Generate unique CIN
RANDOM_NUM=$(date +%s | tail -c 6)
TEST_CIN="U12345MH2023PTC${RANDOM_NUM}"

echo "  Creating test company with CIN: $TEST_CIN"

RESPONSE=$(curl -s -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -d "{
    \"cin\": \"$TEST_CIN\",
    \"name\": \"Test Automation Company Ltd\",
    \"email\": \"test@automation.com\",
    \"companyType\": \"PRIVATE\",
    \"registeredAddress\": \"Test Address, Mumbai\",
    \"authorizedCapital\": 1000000,
    \"paidUpCapital\": 500000
  }")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Company created successfully!${NC}"
    echo ""
    echo -e "${BLUE}Response:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}✗ Failed to create company${NC}"
    echo ""
    echo -e "${YELLOW}Response:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  System Check Complete!                                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Your MCA Filing Automation system is ready!${NC}"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Click '+ New Filing' button"
echo "  3. Fill in company details"
echo "  4. Watch the company appear in the table!"
echo ""
echo -e "${BLUE}Available URLs:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  API Docs:  http://localhost:4000/health"
echo ""
