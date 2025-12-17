-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cin VARCHAR(21) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    registered_address TEXT,
    authorized_capital NUMERIC,
    paid_up_capital NUMERIC,
    incorporation_date DATE,
    company_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Directors Table
CREATE TABLE directors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    din VARCHAR(8) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    valid_dsc BOOLEAN DEFAULT FALSE,
    UNIQUE(company_id, din)
);

-- AOC-4 Filings (Financials)
CREATE TABLE filings_aoc4 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    financial_year VARCHAR(20) NOT NULL,
    filing_type VARCHAR(50) DEFAULT 'STANDALONE',
    agm_date DATE,
    turnover NUMERIC,
    net_profit NUMERIC,
    assets NUMERIC,
    liabilities NUMERIC,
    srn VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    pdf_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MGT-7 Filings (Annual Return)
CREATE TABLE filings_mgt7 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    financial_year VARCHAR(20) NOT NULL,
    agm_date DATE,
    shareholders_count INT,
    srn VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
