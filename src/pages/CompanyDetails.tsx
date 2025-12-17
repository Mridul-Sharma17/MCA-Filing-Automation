import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Company, FilingStatus } from '../../types';
import AOC4FormModal from '../components/AOC4FormModal';

interface Filing {
  id: string;
  financialYear: string;
  filingType: string;
  agmDate: string;
  status: string;
  turnover?: number;
  netProfit?: number;
  assets?: number;
  liabilities?: number;
}

const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Partial<Company> | null>(null);
  const [filings, setFilings] = useState<Filing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
    fetchFilings();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/companies/${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setCompany(result.data);
      } else {
        setError(result.error || 'Failed to fetch company details');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilings = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/filings/${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setFilings(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching filings:', err);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Error Loading Company</h3>
            <p className="text-sm text-red-700 mt-1">{error || 'Company not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-3">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-500 font-mono">{company.cin}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-mca-blue text-white px-4 py-2 rounded-lg hover:bg-blue-800 shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New AOC-4 Filing
        </button>
      </div>

      {/* Company Profile */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Company Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Company Type</p>
            <p className="text-base font-semibold text-gray-900">{company.companyType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Incorporation Date</p>
            <p className="text-base font-semibold text-gray-900">
              {company.incorporationDate
                ? new Date(company.incorporationDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-semibold text-gray-900">{company.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Authorized Capital</p>
            <p className="text-base font-semibold text-gray-900">
              {formatCurrency(company.authorizedCapital)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid-Up Capital</p>
            <p className="text-base font-semibold text-gray-900">
              {formatCurrency(company.paidUpCapital)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered Address</p>
            <p className="text-base font-semibold text-gray-900">
              {company.registeredAddress || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Filings History */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">AOC-4 Filings History</h2>
        </div>
        <div className="overflow-x-auto">
          {filings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No filings yet. Create your first AOC-4 filing to get started.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financial Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filing Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AGM Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turnover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {filing.financialYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {filing.filingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {filing.agmDate ? new Date(filing.agmDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(filing.turnover)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {filing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-gray-500 hover:text-gray-700">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* AOC-4 Form Modal */}
      <AOC4FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={id!}
        onSuccess={() => {
          fetchFilings(); // Refresh filings list
        }}
      />
    </div>
  );
};

export default CompanyDetails;
