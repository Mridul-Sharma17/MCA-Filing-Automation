import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { Company, CompanyType, ApiResponse } from '../../types.js';

const router = Router();

interface CreateCompanyRequest {
  cin: string;
  name: string;
  email: string;
  companyType: CompanyType;
  registeredAddress?: string;
  authorizedCapital?: number;
  paidUpCapital?: number;
  incorporationDate?: string;
}

// POST /api/companies - Create a new company
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      cin,
      name,
      email,
      companyType,
      registeredAddress,
      authorizedCapital,
      paidUpCapital,
      incorporationDate,
    }: CreateCompanyRequest = req.body;

    // Validation
    if (!cin || !name || !email || !companyType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: cin, name, email, companyType',
      } as ApiResponse<null>);
    }

    // Validate CIN format (21 characters for Indian companies)
    if (cin.length !== 21) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CIN format. CIN must be 21 characters.',
      } as ApiResponse<null>);
    }

    // Validate company type
    if (!Object.values(CompanyType).includes(companyType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid company type. Must be one of: ${Object.values(CompanyType).join(', ')}`,
      } as ApiResponse<null>);
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO companies (
        cin, name, email, company_type, registered_address, 
        authorized_capital, paid_up_capital, incorporation_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, cin, name, email, registered_address, authorized_capital, 
                paid_up_capital, incorporation_date, company_type, created_at, updated_at
    `;

    const values = [
      cin,
      name,
      email,
      companyType,
      registeredAddress || null,
      authorizedCapital || null,
      paidUpCapital || null,
      incorporationDate || null,
    ];

    const result = await query(insertQuery, values);
    const newCompany = result.rows[0];

    // Transform database response to match Company interface
    const company: Partial<Company> = {
      id: newCompany.id,
      cin: newCompany.cin,
      name: newCompany.name,
      email: newCompany.email,
      registeredAddress: newCompany.registered_address,
      authorizedCapital: newCompany.authorized_capital,
      paidUpCapital: newCompany.paid_up_capital,
      incorporationDate: newCompany.incorporation_date,
      companyType: newCompany.company_type,
      createdAt: newCompany.created_at,
      directors: [], // Empty array initially
    };

    return res.status(201).json({
      success: true,
      data: company,
    } as ApiResponse<Partial<Company>>);

  } catch (error: any) {
    console.error('Error creating company:', error);

    // Handle duplicate CIN error (PostgreSQL error code 23505)
    if (error.code === '23505' && error.constraint === 'companies_cin_key') {
      return res.status(409).json({
        success: false,
        error: `Company with CIN ${req.body.cin} already exists`,
      } as ApiResponse<null>);
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: 'Failed to create company. Please try again.',
    } as ApiResponse<null>);
  }
});

// GET /api/companies - Get all companies
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, cin, name, email, registered_address, authorized_capital, 
             paid_up_capital, incorporation_date, company_type, created_at, updated_at
      FROM companies
      ORDER BY created_at DESC
    `);

    const companies = result.rows.map((row) => ({
      id: row.id,
      cin: row.cin,
      name: row.name,
      email: row.email,
      registeredAddress: row.registered_address,
      authorizedCapital: row.authorized_capital,
      paidUpCapital: row.paid_up_capital,
      incorporationDate: row.incorporation_date,
      companyType: row.company_type,
      createdAt: row.created_at,
      directors: [], // Will be populated separately if needed
    }));

    return res.json({
      success: true,
      data: companies,
    } as ApiResponse<Partial<Company>[]>);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
    } as ApiResponse<null>);
  }
});

// GET /api/companies/:id - Get a specific company
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT id, cin, name, email, registered_address, authorized_capital, 
             paid_up_capital, incorporation_date, company_type, created_at, updated_at
      FROM companies
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      } as ApiResponse<null>);
    }

    const row = result.rows[0];
    const company: Partial<Company> = {
      id: row.id,
      cin: row.cin,
      name: row.name,
      email: row.email,
      registeredAddress: row.registered_address,
      authorizedCapital: row.authorized_capital,
      paidUpCapital: row.paid_up_capital,
      incorporationDate: row.incorporation_date,
      companyType: row.company_type,
      createdAt: row.created_at,
      directors: [], // Will be populated separately if needed
    };

    return res.json({
      success: true,
      data: company,
    } as ApiResponse<Partial<Company>>);

  } catch (error) {
    console.error('Error fetching company:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch company',
    } as ApiResponse<null>);
  }
});

export default router;
