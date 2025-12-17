import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CompanyDetails from './src/pages/CompanyDetails';

const Header: React.FC = () => {
  const location = useLocation();

  return (
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
          <Link
            to="/"
            className={`hover:text-mca-orange transition-colors ${location.pathname === '/' ? 'text-mca-orange border-b-2 border-mca-orange' : ''}`}
          >
            Dashboard
          </Link>
          <button
            className="hover:text-mca-orange transition-colors"
          >
            Companies
          </button>
          <button
            className="hover:text-mca-orange transition-colors"
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
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/company/:id" element={<CompanyDetails />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MCA Compliance Tech. All rights reserved.</p>
          <p className="mt-2 text-xs">Based on Indian Companies Act, 2013 standards.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;