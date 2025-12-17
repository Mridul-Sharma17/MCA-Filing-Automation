import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { createCompany, CreateCompanyData } from '../services/api';
import { CompanyType } from '../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateCompanyData>({
    cin: '',
    name: '',
    email: '',
    companyType: CompanyType.PRIVATE,
    registeredAddress: '',
    authorizedCapital: undefined,
    paidUpCapital: undefined,
    incorporationDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // CIN validation
    if (!formData.cin) {
      errors.cin = 'CIN is required';
    } else if (formData.cin.length !== 21) {
      errors.cin = 'CIN must be exactly 21 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.cin)) {
      errors.cin = 'CIN must contain only uppercase letters and numbers';
    }

    // Name validation
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Company name is required (minimum 3 characters)';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Company type validation
    if (!formData.companyType) {
      errors.companyType = 'Company type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCompany({
        ...formData,
        cin: formData.cin.toUpperCase(),
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to create company');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cin: '',
      name: '',
      email: '',
      companyType: CompanyType.PRIVATE,
      registeredAddress: '',
      authorizedCapital: undefined,
      paidUpCapital: undefined,
      incorporationDate: '',
    });
    setError(null);
    setSuccess(false);
    setValidationErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CreateCompanyData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Add New Company</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-800">Company Created Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* CIN */}
            <div>
              <label htmlFor="cin" className="block text-sm font-medium text-gray-700 mb-1">
                Corporate Identification Number (CIN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cin"
                maxLength={21}
                value={formData.cin}
                onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.cin ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="U12345MH2020PTC123456"
                disabled={isLoading || success}
              />
              {validationErrors.cin && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.cin}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                21 characters (uppercase letters and numbers only)
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Example Private Limited"
                disabled={isLoading || success}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="contact@example.com"
                disabled={isLoading || success}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Company Type */}
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-1">
                Company Type <span className="text-red-500">*</span>
              </label>
              <select
                id="companyType"
                value={formData.companyType}
                onChange={(e) => handleInputChange('companyType', e.target.value as CompanyType)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.companyType ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || success}
              >
                {Object.values(CompanyType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {validationErrors.companyType && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.companyType}</p>
              )}
            </div>

            {/* Registered Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Registered Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.registeredAddress}
                onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete registered address"
                disabled={isLoading || success}
              />
            </div>

            {/* Optional Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Authorized Capital */}
              <div>
                <label htmlFor="authorizedCapital" className="block text-sm font-medium text-gray-700 mb-1">
                  Authorized Capital (₹)
                </label>
                <input
                  type="number"
                  id="authorizedCapital"
                  value={formData.authorizedCapital || ''}
                  onChange={(e) => handleInputChange('authorizedCapital', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000000"
                  disabled={isLoading || success}
                />
              </div>

              {/* Paid-up Capital */}
              <div>
                <label htmlFor="paidUpCapital" className="block text-sm font-medium text-gray-700 mb-1">
                  Paid-up Capital (₹)
                </label>
                <input
                  type="number"
                  id="paidUpCapital"
                  value={formData.paidUpCapital || ''}
                  onChange={(e) => handleInputChange('paidUpCapital', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000000"
                  disabled={isLoading || success}
                />
              </div>
            </div>

            {/* Incorporation Date */}
            <div>
              <label htmlFor="incorporationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Incorporation Date
              </label>
              <input
                type="date"
                id="incorporationDate"
                value={formData.incorporationDate}
                onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || success}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading || success}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyModal;
