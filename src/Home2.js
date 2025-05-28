import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Statistics from './components/statistics/Statistics';
import AdminPanel from './components/AdminPanel';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';

export default function Home2() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    setAuthenticated(!!token);
    setRole(userRole || '');
  }, []);

  const handleLoginSuccess = (userRole) => {
    setAuthenticated(true);
    setRole(userRole);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      await fetch('http://localhost/logout.php', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout API call failed:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthenticated(false);
    setRole('');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Bara sus de tab-uri */}
      <div className="relative flex justify-center gap-4 py-6 bg-white dark:bg-gray-800 shadow">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2 rounded ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-6 py-2 rounded ${
            activeTab === 'statistics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Statistics
        </button>

        {/* Dacă este admin sau superuser, afișează Admin Panel */}
        {(role === 'admin' || role === 'super_admin') && (
          <button
            onClick={() => setActiveTab('adminpanel')}
            className={`px-6 py-2 rounded ${
              activeTab === 'adminpanel'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Admin Panel
          </button>
        )}

        {/* Buton logout și theme toggle */}
        <div className="absolute top-4 right-4 flex gap-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Afișează tab-ul activ */}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'statistics' && <Statistics />}
      {activeTab === 'adminpanel' && <AdminPanel />}
    </div>
  );
}
