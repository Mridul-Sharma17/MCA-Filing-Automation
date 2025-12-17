import React from 'react';
import { CompanyType, FilingStatus } from '../types';

// Mock Data to visualize the layout
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'TechFlow Solutions Pvt Ltd',
    cin: 'U72900KA2020PTC123456',
    type: CompanyType.PRIVATE,
    fy: '2023-2024',
    aoc4_status: FilingStatus.DATA_GATHERING,
    mgt7_status: FilingStatus.PENDING,
    next_deadline: '2024-09-30'
  },
  {
    id: '2',
    name: 'GreenField Agro LLP',
    cin: 'AAA-1234',
    type: CompanyType.LLP,
    fy: '2023-2024',
    aoc4_status: FilingStatus.READY_FOR_SIGNATURE,
    mgt7_status: FilingStatus.DATA_GATHERING,
    next_deadline: '2024-10-30'
  },
  {
    id: '3',
    name: 'OmniVentures Ltd',
    cin: 'L12345MH1990PLC098765',
    type: CompanyType.LISTED,
    fy: '2023-2024',
    aoc4_status: FilingStatus.UPLOADED,
    mgt7_status: FilingStatus.PRE_SCRUTINY_PENDING,
    next_deadline: '2024-08-15'
  }
];

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

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Total Companies</h3>
          <p className="text-3xl font-bold text-mca-blue mt-2">124</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Filings</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">42</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Signatures</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Completed</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">15</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Filing Status Tracker (FY 2023-24)</h2>
        <div className="space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
            Import from Excel
          </button>
          <button className="bg-mca-blue text-white px-4 py-2 rounded hover:bg-blue-800 shadow-sm">
            + New Filing
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AOC-4 Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MGT-7 Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Deadline</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_COMPANIES.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{company.name}</span>
                    <span className="text-xs text-gray-500">{company.cin}</span>
                    <span className="text-xs text-gray-400 mt-1">{company.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={company.aoc4_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={company.mgt7_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className="text-sm text-red-600 font-medium">
                    {company.next_deadline}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-mca-blue hover:text-blue-900 mr-4">Manage</button>
                  <button className="text-gray-500 hover:text-gray-700">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-bold">System Alert:</span> MCA Portal reported slow response times (Last checked: 5 mins ago). Automation scripts may require increased timeout thresholds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;