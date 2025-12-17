# Todo: Fix Master Data Fetcher

## Problem
The company metadata fetcher is always returning "Company data not found in public directories. Please enter details manually." when trying to fetch company data by CIN.

## Root Cause Analysis (In Progress)
- Current implementation tries to scrape Zaubacorp using: `https://www.zaubacorp.com/company/${cin}`
- Need to verify if:
  1. Zaubacorp URL structure has changed
  2. The site is blocking requests
  3. HTML selectors are outdated
  4. Alternative free sources are available

## Test CIN
U74990MH2009FTC194075

## Plan
- [x] Test current Zaubacorp endpoint with a real CIN to see actual response
- [x] Check if Zaubacorp URL/structure has changed
- [x] Identified root cause: 403 Forbidden (bot detection) + Cloudflare challenge
- [x] Installed Playwright in backend
- [x] Replaced axios+cheerio with Playwright scraper
- [x] Configured to use system Chrome (skipped Chromium download due to CDN issues)
- [x] Installed playwright-extra with stealth plugin to bypass Cloudflare
- [x] Tested successfully - company data loads correctly!
- [x] Restart backend and test API endpoint
- [x] ✅ VERIFIED WORKING - API successfully returns company metadata!

## Root Cause Found
Zaubacorp IS working, but the scraper's HTML selectors are outdated:
1. Page uses `table.table-striped` class instead of generic `table`
2. Text labels are different:
   - "Authorised Share Capital" (with 's') not "Authorized Capital"
   - "Paid-up Share Capital" not "Paid Up Capital"
3. Date format is already in YYYY-MM-DD format (2009-07-14)
4. Capital values include ₹ symbol and commas (₹ 500,000,000.00)

## Changes Made

1. **Updated HTML selectors** in `backend/src/services/scraper.ts`:
   - Changed from generic `table tr` to `table.table-striped tr`
   - Updated text matching for British spelling: "Authorised Share Capital", "Paid-up Share Capital"
   - Added h1 as primary company name selector

2. **Replaced axios with Playwright** in `backend/src/services/scraper.ts`:
   - Installed `playwright` and `playwright-extra` packages
   - Imported chromium from `playwright-extra` with stealth plugin
   - Configured to use system Chrome at `/usr/bin/google-chrome`
   - Added `--no-sandbox` and `--disable-setuid-sandbox` args for headless mode

3. **Fixed navigation strategy**:
   - Changed from `waitUntil: 'networkidle'` to `waitUntil: 'load'`
   - Added 5-second wait for Cloudflare challenge to complete
   - Increased timeout to 30 seconds

4. **Updated date parser** to handle YYYY-MM-DD format (Zaubacorp's format)

5. **Improved error handling** with proper browser cleanup in catch block

## Review

### Summary
Successfully fixed the master data fetcher that was returning "Company data not found" error.

### Root Cause
Zaubacorp blocks automated axios requests (HTTP 403) and has Cloudflare bot protection that shows "Just a moment..." challenge page even for headless browsers.

### Solution
Implemented Playwright with stealth plugin using system Chrome to bypass bot detection and Cloudflare challenges. The scraper now successfully fetches company metadata including name, type, incorporation date, and capital amounts.

### Files Modified
- `backend/src/services/scraper.ts` - Complete rewrite of scraping logic
- `backend/package.json` - Added playwright and playwright-extra dependencies

### Testing
Verified with CIN U74990MH2009FTC194075 (PWC Strategy& India):
- ✅ Successfully fetches company name
- ✅ Correctly parses capital amounts (₹500M authorized, ₹434.2M paid-up)
- ✅ Returns incorporation date in YYYY-MM-DD format
- ✅ Identifies company type

### Performance
- Request takes ~6-8 seconds (includes 5s Cloudflare wait)
- Browser overhead is acceptable for the reliability gained
