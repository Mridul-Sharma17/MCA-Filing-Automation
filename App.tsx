import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-mca-blue text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-mca-blue font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MCA Filing Automator</h1>
              <p className="text-xs text-blue-200">AOC-4 & MGT-7 Compliance Tool</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-mca-orange transition-colors ${activeTab === 'dashboard' ? 'text-mca-orange border-b-2 border-mca-orange' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('companies')}
              className={`hover:text-mca-orange transition-colors ${activeTab === 'companies' ? 'text-mca-orange border-b-2 border-mca-orange' : ''}`}
            >
              Companies
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`hover:text-mca-orange transition-colors ${activeTab === 'settings' ? 'text-mca-orange border-b-2 border-mca-orange' : ''}`}
            >
              Settings
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-right hidden sm:block">
              <p>Welcome, User</p>
              <p className="text-green-400">● System Operational</p>
            </div>
            <button className="bg-mca-orange px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'companies' && (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500">
            <h2 className="text-2xl font-bold mb-4">Master Data Management</h2>
            <p>Manage CIN, Directors, and DSC mapping here.</p>
          </div>
        )}
        {activeTab === 'settings' && (
           <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center text-gray-500">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p>Configure MCA Credentials, Captcha Solvers, and Cloud Storage.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} MCA Compliance Tech. All rights reserved.</p>
        <p className="mt-2 text-xs">Based on Indian Companies Act, 2013 standards.</p>
      </footer>
    </div>
  );
};

export default App;