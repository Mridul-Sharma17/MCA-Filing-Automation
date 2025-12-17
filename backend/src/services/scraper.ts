import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to bypass Cloudflare detection
chromium.use(StealthPlugin());

export interface CompanyMetadata {
  name?: string;
  registeredAddress?: string;
  authorizedCapital?: number;
  paidUpCapital?: number;
  incorporationDate?: string;
  email?: string;
  companyType?: string;
}

/**
 * Fetch company metadata from public sources using Playwright
 * Uses Zaubacorp as a fallback public directory
 * Playwright is used because Zaubacorp blocks axios requests (403)
 */
export const fetchCompanyMetadata = async (cin: string): Promise<CompanyMetadata | null> => {
  let browser = null;
  try {
    console.log(`[SCRAPER] Fetching metadata for CIN: ${cin}`);

    // Try Zaubacorp using Playwright (bypasses bot detection)
    const url = `https://www.zaubacorp.com/company/${cin}`;
    console.log(`[SCRAPER] Fetching from URL: ${url}`);

    // Launch browser using system Chrome or Playwright's Chromium
    // Falls back to Playwright's bundled Chromium if system Chrome not found
    browser = await chromium.launch({
      headless: true,
      // Only use executablePath if running on Linux with system Chrome
      // For deployment/Docker, Playwright will download its own Chromium
      ...(process.platform === 'linux' && process.env.USE_SYSTEM_CHROME === 'true'
        ? { executablePath: '/usr/bin/google-chrome' }
        : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to the page (use 'load' instead of 'networkidle' as Zaubacorp has continuous network activity)
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    console.log(`[SCRAPER] Page loaded successfully`);

    // Wait for Cloudflare challenge to complete and dynamic content to load
    await page.waitForTimeout(5000);
    console.log(`[SCRAPER] Waited for Cloudflare challenge and dynamic content`);

    // Get the HTML content
    const htmlContent = await page.content();

    // Close the browser
    await browser.close();
    browser = null;

    // Parse with Cheerio
    const $ = cheerio.load(htmlContent);
    const metadata: CompanyMetadata = {};

    // Extract company name from h1 tag (current Zaubacorp structure)
    const companyName = $('h1').first().text().trim() ||
                       $('h5').first().text().trim() ||
                       $('h1.company-name').text().trim() ||
                       $('title').text().split('-')[0].trim();

    if (companyName && companyName !== 'Zaubacorp') {
      metadata.name = companyName;
    }

    // Extract data from table rows (target table.table-striped for current structure)
    $('table.table-striped tr, table tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = cells.first().text().trim().toLowerCase();
        const value = cells.last().text().trim();

        if (label.includes('registered address') || label === 'address') {
          metadata.registeredAddress = value;
        } else if (label.includes('authorised') && label.includes('capital')) {
          // Zaubacorp uses "Authorised Share Capital" (British spelling)
          metadata.authorizedCapital = parseCapital(value);
        } else if (label.includes('paid') && label.includes('capital')) {
          // Matches "Paid-up Share Capital" and other variations
          metadata.paidUpCapital = parseCapital(value);
        } else if (label.includes('incorporation date') || label.includes('date of incorporation')) {
          metadata.incorporationDate = parseDate(value);
        } else if (label.includes('email')) {
          metadata.email = value;
        } else if (label.includes('company category') || label.includes('company type') || label.includes('class')) {
          metadata.companyType = value;
        }
      }
    });

    // Alternative parsing for different HTML structures
    if (!metadata.name) {
      metadata.name = $('.company-title').text().trim() ||
                     $('[itemprop="name"]').text().trim();
    }

    // Extract email from page text (not in tables on Zaubacorp)
    if (!metadata.email) {
      const pageText = $('body').text();
      const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
      const emails = pageText.match(emailRegex);
      if (emails && emails.length > 0) {
        // Filter out zaubacorp.com emails, get company email
        const companyEmail = emails.find(email => !email.includes('zaubacorp.com'));
        if (companyEmail) {
          metadata.email = companyEmail;
        }
      }
    }

    console.log('[SCRAPER] Extracted metadata:', JSON.stringify(metadata, null, 2));

    // Return null if we couldn't extract any meaningful data
    if (!metadata.name && !metadata.registeredAddress) {
      console.log('[SCRAPER] No meaningful data extracted - missing both name and address');
      return null;
    }

    console.log('[SCRAPER] Successfully extracted metadata');
    return metadata;

  } catch (error: any) {
    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[SCRAPER] Error closing browser:', closeError);
      }
    }

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.log(`[SCRAPER] Company not found: ${cin}`);
      return null;
    }

    console.error('[SCRAPER] Error fetching company metadata:', error.message);
    if (error.code) {
      console.error('[SCRAPER] Error code:', error.code);
    }
    return null;
  }
};

/**
 * Parse capital value from string (e.g., "Rs. 1,00,000" -> 100000)
 */
function parseCapital(value: string): number | undefined {
  if (!value) return undefined;
  
  // Remove currency symbols, commas, and extract numbers
  const cleaned = value.replace(/[Rs.,₹\s]/gi, '');
  const number = parseFloat(cleaned);
  
  return isNaN(number) ? undefined : number;
}

/**
 * Parse date from various formats
 */
function parseDate(value: string): string | undefined {
  if (!value) return undefined;

  try {
    // Check if already in YYYY-MM-DD format (Zaubacorp format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    // Try to parse common Indian date formats
    // Format: DD-MM-YYYY, DD/MM/YYYY, DD-MMM-YYYY
    const parts = value.split(/[-/\s]/);

    if (parts.length === 3) {
      // Check if first part is a 4-digit year (YYYY-MM-DD format)
      if (parts[0].length === 4) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        if (year && month && day) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }

      // Otherwise assume DD-MM-YYYY format
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);

      // Convert month name to number if needed
      const monthMap: { [key: string]: number } = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12,
      };

      const month = isNaN(parseInt(monthStr))
        ? monthMap[monthStr.toLowerCase()]
        : parseInt(monthStr);

      if (day && month && year) {
        // Return in YYYY-MM-DD format
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    return undefined;
  } catch (error) {
    console.error('Error parsing date:', error);
    return undefined;
  }
}

/**
 * Alternative: Fetch from MCA official API (if available)
 * This is a placeholder for future implementation when MCA provides public API
 */
export const fetchFromMCAAPI = async (cin: string): Promise<CompanyMetadata | null> => {
  // TODO: Implement when MCA provides official API
  // For now, this is a placeholder
  console.log('MCA API not yet implemented');
  return null;
};
