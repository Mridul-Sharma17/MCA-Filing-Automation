import axios from 'axios';
import { Company, CompanyType, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Company API
export interface CreateCompanyData {
  cin: string;
  name: string;
  email: string;
  companyType: CompanyType;
  registeredAddress?: string;
  authorizedCapital?: number;
  paidUpCapital?: number;
  incorporationDate?: string;
}

/**
 * Create a new company
 */
export const createCompany = async (data: CreateCompanyData): Promise<ApiResponse<Partial<Company>>> => {
  try {
    const response = await api.post<ApiResponse<Partial<Company>>>('/api/companies', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'Failed to create company',
    };
  }
};

/**
 * Get all companies
 */
export const getCompanies = async (): Promise<ApiResponse<Partial<Company>[]>> => {
  try {
    const response = await api.get<ApiResponse<Partial<Company>[]>>('/api/companies');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'Failed to fetch companies',
    };
  }
};

/**
 * Get a specific company by ID
 */
export const getCompanyById = async (id: string): Promise<ApiResponse<Partial<Company>>> => {
  try {
    const response = await api.get<ApiResponse<Partial<Company>>>(`/api/companies/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'Failed to fetch company',
    };
  }
};

export default api;
