// Shared types to be used by Frontend, Backend, and Automation

export enum CompanyType {
  OPC = 'OPC',
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  LISTED = 'LISTED',
  UNLISTED = 'UNLISTED',
  LLP = 'LLP'
}

export enum FilingStatus {
  PENDING = 'PENDING',
  DATA_GATHERING = 'DATA_GATHERING',
  PRE_SCRUTINY_PENDING = 'PRE_SCRUTINY_PENDING',
  READY_FOR_SIGNATURE = 'READY_FOR_SIGNATURE',
  SIGNED = 'SIGNED',
  UPLOADED = 'UPLOADED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Director {
  din: string;
  name: string;
  designation: 'Director' | 'Managing Director' | 'CFO' | 'Company Secretary';
  validDsc: boolean;
}

export interface Company {
  id: string; // UUID
  cin: string;
  name: string;
  email: string;
  registeredAddress: string;
  authorizedCapital: number;
  paidUpCapital: number;
  incorporationDate: string;
  companyType: CompanyType;
  directors: Director[];
  createdAt: string;
}

export interface AOC4Filing {
  id: string; // UUID
  companyId: string;
  financialYear: string; // e.g., "2023-2024"
  filingType: 'STANDALONE' | 'CONSOLIDATED';
  agmDate: string;
  auditorName: string;
  auditorMembershipNumber: string;
  balanceSheetPath?: string; // S3 or local path
  plStatementPath?: string;
  auditorReportPath?: string;
  directorsReportPath?: string;
  srn?: string; // Service Request Number
  status: FilingStatus;
  lastError?: string;
}

export interface MGT7Filing {
  id: string; // UUID
  companyId: string;
  financialYear: string;
  agmDate: string;
  hasShareholdersList: boolean;
  hasMgt8: boolean;
  srn?: string;
  status: FilingStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}