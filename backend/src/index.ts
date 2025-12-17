import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import companyRoutes from './routes/companies.js';
import filingRoutes from './routes/filings.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/companies', companyRoutes);
app.use('/api/filings', filingRoutes);

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
