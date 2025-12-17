import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { ApiResponse } from '../../../types.js';

const router = Router();

interface CreateAOC4Request {
  companyId: string;
  financialYear: string;
  filingType: 'STANDALONE' | 'CONSOLIDATED';
  agmDate: string;
  turnover: number;
  netProfit: number;
  assets: number;
  liabilities: number;
}

// GET /api/filings/:companyId - Get all AOC-4 filings for a company
router.get('/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    // Validate companyId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid company ID format',
      } as ApiResponse<null>);
    }

    // Check if company exists
    const companyCheck = await query(
      'SELECT id FROM companies WHERE id = $1',
      [companyId]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      } as ApiResponse<null>);
    }

    // Fetch all filings for this company
    const result = await query(
      `SELECT
        id, company_id, financial_year, filing_type, agm_date,
        turnover, net_profit, assets, liabilities, srn, status,
        pdf_path, created_at
      FROM filings_aoc4
      WHERE company_id = $1
      ORDER BY created_at DESC`,
      [companyId]
    );

    const filings = result.rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      financialYear: row.financial_year,
      filingType: row.filing_type,
      agmDate: row.agm_date,
      turnover: row.turnover,
      netProfit: row.net_profit,
      assets: row.assets,
      liabilities: row.liabilities,
      srn: row.srn,
      status: row.status,
      pdfPath: row.pdf_path,
      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      data: filings,
    } as ApiResponse<typeof filings>);

  } catch (error) {
    console.error('Error fetching filings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch filings',
    } as ApiResponse<null>);
  }
});

// POST /api/filings/aoc4 - Create a new AOC-4 filing draft
router.post('/aoc4', async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      financialYear,
      filingType,
      agmDate,
      turnover,
      netProfit,
      assets,
      liabilities,
    }: CreateAOC4Request = req.body;

    // Validation
    if (!companyId || !financialYear || !filingType || !agmDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyId, financialYear, filingType, agmDate',
      } as ApiResponse<null>);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid company ID format',
      } as ApiResponse<null>);
    }

    // Validate filing type
    if (filingType !== 'STANDALONE' && filingType !== 'CONSOLIDATED') {
      return res.status(400).json({
        success: false,
        error: 'Filing type must be STANDALONE or CONSOLIDATED',
      } as ApiResponse<null>);
    }

    // Validate financial year format (e.g., "2023-2024")
    const fyRegex = /^\d{4}-\d{4}$/;
    if (!fyRegex.test(financialYear)) {
      return res.status(400).json({
        success: false,
        error: 'Financial year must be in format YYYY-YYYY (e.g., "2023-2024")',
      } as ApiResponse<null>);
    }

    // Balance Sheet Validation: Assets must equal Liabilities
    // (Liabilities field includes both liabilities + equity as per Indian balance sheet)
    if (assets !== undefined && liabilities !== undefined && assets !== liabilities) {
      return res.status(400).json({
        success: false,
        error: 'Balance Sheet Mismatch: Total Assets must equal Total Liabilities (including Equity)',
      } as ApiResponse<null>);
    }

    // Check if company exists
    const companyCheck = await query(
      'SELECT id FROM companies WHERE id = $1',
      [companyId]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      } as ApiResponse<null>);
    }

    // Check for duplicate filing (same company + financial year)
    const duplicateCheck = await query(
      'SELECT id FROM filings_aoc4 WHERE company_id = $1 AND financial_year = $2',
      [companyId, financialYear]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: `AOC-4 filing for financial year ${financialYear} already exists`,
      } as ApiResponse<null>);
    }

    // Insert new filing
    const insertQuery = `
      INSERT INTO filings_aoc4 (
        company_id, financial_year, filing_type, agm_date,
        turnover, net_profit, assets, liabilities, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company_id, financial_year, filing_type, agm_date,
                turnover, net_profit, assets, liabilities, srn, status,
                pdf_path, created_at
    `;

    const values = [
      companyId,
      financialYear,
      filingType,
      agmDate,
      turnover || null,
      netProfit || null,
      assets || null,
      liabilities || null,
      'PENDING',
    ];

    const result = await query(insertQuery, values);
    const newFiling = result.rows[0];

    const filing = {
      id: newFiling.id,
      companyId: newFiling.company_id,
      financialYear: newFiling.financial_year,
      filingType: newFiling.filing_type,
      agmDate: newFiling.agm_date,
      turnover: newFiling.turnover,
      netProfit: newFiling.net_profit,
      assets: newFiling.assets,
      liabilities: newFiling.liabilities,
      srn: newFiling.srn,
      status: newFiling.status,
      pdfPath: newFiling.pdf_path,
      createdAt: newFiling.created_at,
    };

    return res.status(201).json({
      success: true,
      data: filing,
    } as ApiResponse<typeof filing>);

  } catch (error: any) {
    console.error('Error creating AOC-4 filing:', error);

    // Handle duplicate error (PostgreSQL error code 23505)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Filing already exists for this financial year',
      } as ApiResponse<null>);
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create AOC-4 filing. Please try again.',
    } as ApiResponse<null>);
  }
});

export default router;
