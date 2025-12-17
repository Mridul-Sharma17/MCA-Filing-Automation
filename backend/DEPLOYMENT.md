# Backend Deployment Guide

## Installing Playwright Browsers

The backend uses Playwright with stealth plugin to scrape company data from Zaubacorp (bypasses Cloudflare protection).

### For Local Development
If you have Chrome installed on your system, you can use it:
```bash
# In your .env file
USE_SYSTEM_CHROME=true
```

### For Production/Docker/CI
Playwright needs to download its own Chromium browser:

```bash
# After npm install, run:
npx playwright install chromium

# Or install with system dependencies (recommended for Docker/CI):
npx playwright install --with-deps chromium
```

### Docker Example
```dockerfile
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install

# Install Playwright browsers and dependencies
RUN npx playwright install --with-deps chromium

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Environment Variables
- `USE_SYSTEM_CHROME=true` - Use system Chrome (Linux only)
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 4000)

### System Requirements
- Node.js 18+
- PostgreSQL 12+
- For Playwright: ~200MB disk space for Chromium browser

## Troubleshooting

**"Executable doesn't exist" error:**
Run `npx playwright install chromium`

**Cloudflare challenges:**
The stealth plugin should handle this. If issues persist, increase the wait timeout in `scraper.ts`.

**Memory issues:**
Playwright's Chromium needs ~100-200MB RAM per instance. Consider implementing a queue for concurrent requests.
