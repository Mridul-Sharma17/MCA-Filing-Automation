import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface AOC4FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

interface FormData {
  financialYear: string;
  filingType: 'STANDALONE' | 'CONSOLIDATED';
  agmDate: string;
  turnover: string;
  netProfit: string;
  assets: string;
  liabilities: string;
}

interface FormErrors {
  [key: string]: string;
}

const AOC4FormModal: React.FC<AOC4FormModalProps> = ({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    financialYear: '',
    filingType: 'STANDALONE',
    agmDate: '',
    turnover: '',
    netProfit: '',
    assets: '',
    liabilities: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balanceSheetMismatch, setBalanceSheetMismatch] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Generate financial years (last 5 years)
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  };

  const financialYears = generateFinancialYears();

  // Balance sheet validation effect
  useEffect(() => {
    const assetsValue = parseFloat(formData.assets);
    const liabilitiesValue = parseFloat(formData.liabilities);

    if (formData.assets && formData.liabilities) {
      if (!isNaN(assetsValue) && !isNaN(liabilitiesValue)) {
        setBalanceSheetMismatch(assetsValue !== liabilitiesValue);
      }
    } else {
      setBalanceSheetMismatch(false);
    }
  }, [formData.assets, formData.liabilities]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.financialYear) {
      newErrors.financialYear = 'Financial year is required';
    }

    if (!formData.agmDate) {
      newErrors.agmDate = 'AGM date is required';
    }

    if (!formData.turnover) {
      newErrors.turnover = 'Turnover is required';
    } else if (parseFloat(formData.turnover) < 0) {
      newErrors.turnover = 'Turnover cannot be negative';
    }

    if (!formData.netProfit) {
      newErrors.netProfit = 'Net profit is required';
    }

    if (!formData.assets) {
      newErrors.assets = 'Total assets is required';
    } else if (parseFloat(formData.assets) < 0) {
      newErrors.assets = 'Total assets cannot be negative';
    }

    if (!formData.liabilities) {
      newErrors.liabilities = 'Total liabilities is required';
    } else if (parseFloat(formData.liabilities) < 0) {
      newErrors.liabilities = 'Total liabilities cannot be negative';
    }

    // Balance sheet validation
    if (formData.assets && formData.liabilities && balanceSheetMismatch) {
      newErrors.balanceSheet = 'Assets must equal Liabilities (including Equity)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/filings/aoc4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          financialYear: formData.financialYear,
          filingType: formData.filingType,
          agmDate: formData.agmDate,
          turnover: parseFloat(formData.turnover),
          netProfit: parseFloat(formData.netProfit),
          assets: parseFloat(formData.assets),
          liabilities: parseFloat(formData.liabilities),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('AOC-4 filing created successfully!');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setErrors({ submit: result.error || 'Failed to create filing' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      financialYear: '',
      filingType: 'STANDALONE',
      agmDate: '',
      turnover: '',
      netProfit: '',
      assets: '',
      liabilities: '',
    });
    setErrors({});
    setSuccessMessage('');
    setBalanceSheetMismatch(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">New AOC-4 Filing</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Balance Sheet Mismatch Warning */}
          {balanceSheetMismatch && (
            <div className="flex items-start bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">⚠️ Balance Sheet Mismatch</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Total Assets must equal Total Liabilities (including Equity). Please verify your entries.
                </p>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Financial Year */}
          <div>
            <label htmlFor="financialYear" className="block text-sm font-medium text-gray-700 mb-2">
              Financial Year *
            </label>
            <select
              id="financialYear"
              name="financialYear"
              value={formData.financialYear}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select Financial Year</option>
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors.financialYear && (
              <p className="mt-1 text-sm text-red-600">{errors.financialYear}</p>
            )}
          </div>

          {/* Filing Type */}
          <div>
            <label htmlFor="filingType" className="block text-sm font-medium text-gray-700 mb-2">
              Filing Type *
            </label>
            <select
              id="filingType"
              name="filingType"
              value={formData.filingType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="STANDALONE">Standalone</option>
              <option value="CONSOLIDATED">Consolidated</option>
            </select>
          </div>

          {/* AGM Date */}
          <div>
            <label htmlFor="agmDate" className="block text-sm font-medium text-gray-700 mb-2">
              AGM Date *
            </label>
            <input
              type="date"
              id="agmDate"
              name="agmDate"
              value={formData.agmDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
            {errors.agmDate && <p className="mt-1 text-sm text-red-600">{errors.agmDate}</p>}
          </div>

          {/* Turnover */}
          <div>
            <label htmlFor="turnover" className="block text-sm font-medium text-gray-700 mb-2">
              Turnover (₹) *
            </label>
            <input
              type="number"
              id="turnover"
              name="turnover"
              value={formData.turnover}
              onChange={handleChange}
              placeholder="Enter turnover amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              step="0.01"
            />
            {errors.turnover && <p className="mt-1 text-sm text-red-600">{errors.turnover}</p>}
          </div>

          {/* Net Profit */}
          <div>
            <label htmlFor="netProfit" className="block text-sm font-medium text-gray-700 mb-2">
              Net Profit (₹) *
            </label>
            <input
              type="number"
              id="netProfit"
              name="netProfit"
              value={formData.netProfit}
              onChange={handleChange}
              placeholder="Enter net profit (can be negative)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              step="0.01"
            />
            {errors.netProfit && <p className="mt-1 text-sm text-red-600">{errors.netProfit}</p>}
          </div>

          {/* Total Assets */}
          <div>
            <label htmlFor="assets" className="block text-sm font-medium text-gray-700 mb-2">
              Total Assets (₹) *
            </label>
            <input
              type="number"
              id="assets"
              name="assets"
              value={formData.assets}
              onChange={handleChange}
              placeholder="Enter total assets"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              step="0.01"
            />
            {errors.assets && <p className="mt-1 text-sm text-red-600">{errors.assets}</p>}
          </div>

          {/* Total Liabilities */}
          <div>
            <label htmlFor="liabilities" className="block text-sm font-medium text-gray-700 mb-2">
              Total Liabilities (₹) *
              <span className="text-xs text-gray-500 ml-2 font-normal">
                (Including Equity)
              </span>
            </label>
            <input
              type="number"
              id="liabilities"
              name="liabilities"
              value={formData.liabilities}
              onChange={handleChange}
              placeholder="Enter total liabilities including equity"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              step="0.01"
            />
            {errors.liabilities && (
              <p className="mt-1 text-sm text-red-600">{errors.liabilities}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Note: As per Indian balance sheet format, this should equal Total Assets
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || balanceSheetMismatch}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubmitting || balanceSheetMismatch
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-mca-blue text-white hover:bg-blue-800'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AOC4FormModal;
