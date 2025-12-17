# MCA Filing Automation - API Documentation

## 🚀 Setup Complete!

Your "Add Company" API is now fully implemented with database integration.

## 📁 What Was Created

### Backend Files
1. **`backend/src/db.ts`** - PostgreSQL connection pool
2. **`backend/src/routes/companies.ts`** - Company CRUD routes
3. **`backend/src/index.ts`** - Updated with company routes mounted at `/api/companies`
4. **`backend/tsconfig.json`** - TypeScript configuration for backend
5. **`backend/.env`** - Backend environment variables

### Frontend Files
1. **`src/services/api.ts`** - API client with `createCompany()`, `getCompanies()`, `getCompanyById()`
2. **`src/vite-env.d.ts`** - TypeScript definitions for Vite environment variables

### Configuration Files
1. **`.env`** - Root environment variables (for frontend via Vite)
2. **`.env.example`** - Template for environment setup

## 🔌 API Endpoints

### Base URL
```
http://localhost:4000
```

### Company Endpoints

#### 1. Create Company
**POST** `/api/companies`

**Request Body:**
```json
{
  "cin": "U12345MH2020PTC123456",
  "name": "Example Private Limited",
  "email": "contact@example.com",
  "companyType": "PRIVATE",
  "registeredAddress": "123 Main St, Mumbai, MH 400001",
  "authorizedCapital": 10000000,
  "paidUpCapital": 5000000,
  "incorporationDate": "2020-01-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "cin": "U12345MH2020PTC123456",
    "name": "Example Private Limited",
    "email": "contact@example.com",
    "companyType": "PRIVATE",
    "registeredAddress": "123 Main St, Mumbai, MH 400001",
    "authorizedCapital": 10000000,
    "paidUpCapital": 5000000,
    "incorporationDate": "2020-01-15",
    "createdAt": "2025-12-17T10:30:00Z",
    "directors": []
  }
}
```

**Error Response (409 Conflict - Duplicate CIN):**
```json
{
  "success": false,
  "error": "Company with CIN U12345MH2020PTC123456 already exists"
}
```

#### 2. Get All Companies
**GET** `/api/companies`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "cin": "U12345MH2020PTC123456",
      "name": "Example Private Limited",
      ...
    }
  ]
}
```

#### 3. Get Company by ID
**GET** `/api/companies/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "cin": "U12345MH2020PTC123456",
    "name": "Example Private Limited",
    ...
  }
}
```

## 💻 Frontend Usage

```typescript
import { createCompany, getCompanies, getCompanyById } from './services/api';
import { CompanyType } from './types';

// Create a new company
const handleCreateCompany = async () => {
  const result = await createCompany({
    cin: 'U12345MH2020PTC123456',
    name: 'Example Private Limited',
    email: 'contact@example.com',
    companyType: CompanyType.PRIVATE,
    registeredAddress: '123 Main St, Mumbai',
    authorizedCapital: 10000000,
    paidUpCapital: 5000000,
    incorporationDate: '2020-01-15',
  });

  if (result.success) {
    console.log('Company created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};

// Get all companies
const fetchCompanies = async () => {
  const result = await getCompanies();
  if (result.success) {
    console.log('Companies:', result.data);
  }
};

// Get specific company
const fetchCompany = async (id: string) => {
  const result = await getCompanyById(id);
  if (result.success) {
    console.log('Company:', result.data);
  }
};
```

## 🗄️ Database Setup

Before testing the API, you need to set up PostgreSQL:

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
```

### 2. Create Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE mca_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mca_db TO your_user;
\q
```

### 3. Run Schema
```bash
psql -U your_user -d mca_db -f database/schema.sql
```

### 4. Update .env Files
Update `backend/.env`:
```env
DATABASE_URL=postgres://your_user:your_password@localhost:5432/mca_db
PORT=4000
NODE_ENV=development
```

## 🧪 Testing the API

### Using curl
```bash
# Create a company
curl -X POST http://localhost:4000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "cin": "U12345MH2020PTC123456",
    "name": "Test Company Ltd",
    "email": "test@company.com",
    "companyType": "PRIVATE"
  }'

# Get all companies
curl http://localhost:4000/api/companies

# Get specific company
curl http://localhost:4000/api/companies/{company-id}
```

### Using Postman/Insomnia
1. Import the endpoints above
2. Set base URL: `http://localhost:4000`
3. Add Content-Type header: `application/json`

## 🔐 Validation Rules

1. **CIN**: Must be exactly 21 characters
2. **Company Type**: Must be one of: OPC, PRIVATE, PUBLIC, LISTED, UNLISTED, LLP
3. **Required Fields**: cin, name, email, companyType
4. **Unique Constraint**: CIN must be unique (enforced by database)

## ⚠️ Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **404**: Not Found
- **409**: Conflict (duplicate CIN)
- **500**: Internal Server Error

## 🔄 Next Steps

1. **Set up PostgreSQL** and run the schema
2. **Update .env files** with your database credentials
3. **Restart the backend** server
4. **Test the API** using curl or Postman
5. **Integrate with frontend** using the provided API service

## 📝 Notes

- The backend server must be running on port 4000 (or your configured port)
- CORS is enabled for all origins (configure for production)
- Database connection pool is automatically managed
- SQL queries are logged to console for debugging
