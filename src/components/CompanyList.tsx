import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { getCompanies } from '../services/api';
import { Company, FilingStatus } from '../types';

const StatusBadge: React.FC<{ status: FilingStatus }> = ({ status }) => {
  const styles = {
    [FilingStatus.PENDING]: 'bg-gray-100 text-gray-600',
    [FilingStatus.DATA_GATHERING]: 'bg-blue-100 text-blue-600',
    [FilingStatus.PRE_SCRUTINY_PENDING]: 'bg-yellow-100 text-yellow-600',
    [FilingStatus.READY_FOR_SIGNATURE]: 'bg-purple-100 text-purple-600',
    [FilingStatus.SIGNED]: 'bg-indigo-100 text-indigo-600',
    [FilingStatus.UPLOADED]: 'bg-green-100 text-green-600',
    [FilingStatus.APPROVED]: 'bg-green-200 text-green-800',
    [FilingStatus.REJECTED]: 'bg-red-100 text-red-600',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

interface CompanyListProps {
  refreshTrigger?: number;
}

const CompanyList: React.FC<CompanyListProps> = ({ refreshTrigger = 0 }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Partial<Company>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCompanies();

      if (result.success && result.data) {
        setCompanies(result.data);
      } else {
        setError(result.error || 'Failed to fetch companies');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading companies...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">Error Loading Companies</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchCompanies}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 rounded-full p-6 mb-4">
            <Building2 className="w-16 h-16 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Companies Yet</h3>
          <p className="text-gray-600 max-w-md mb-6">
            Get started by adding your first company. You'll be able to manage filings, track deadlines,
            and automate submissions all in one place.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> Click the "+ New Filing" button above to add your first company.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Table with Data
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
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
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">
                        {company.incorporationDate
                          ? `Incorporated: ${new Date(company.incorporationDate).toLocaleDateString()}`
                          : 'Date not available'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{company.cin}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                    {company.companyType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{company.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={FilingStatus.PENDING} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/company/${company.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4 font-medium"
                  >
                    Manage
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{companies.length}</span> compan{companies.length === 1 ? 'y' : 'ies'}
          </p>
          <button
            onClick={fetchCompanies}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;
