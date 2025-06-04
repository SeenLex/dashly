import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Statistics from './components/statistics/Statistics';
import AdminPanel from './components/AdminPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';
import AuditPage from './pages/audit/AuditPage';
import RequestsTable from './components/RequestsTable';

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

  if (!authenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700">
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-50 shadow-xl shadow-blue-500/5 dark:shadow-indigo-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center transform hover:scale-105 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <nav className="flex items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-1.5 shadow-lg shadow-gray-900/5 dark:shadow-black/20 border border-white/20 dark:border-gray-700/30">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                    />
                  </svg>
                  <span>Dashboard</span>
                </span>
                {activeTab === 'dashboard' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl opacity-20 blur-lg"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('statistics')}
                className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                  activeTab === 'statistics'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Statistics</span>
                </span>
                {activeTab === 'statistics' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-xl opacity-20 blur-lg"></div>
                )}
              </button>

              {role === 'admin' && (
                <button
                  onClick={() => setActiveTab('adminpanel')}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                    activeTab === 'adminpanel'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Admin Panel</span>
                  </span>
                  {activeTab === 'adminpanel' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl opacity-20 blur-lg"></div>
                  )}
                </button>
              )}

              {role === 'super_admin' && (
                <button
                  onClick={() => setActiveTab('superadminpanel')}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                    activeTab === 'superadminpanel'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Super Admin</span>
                  </span>
                  {activeTab === 'superadminpanel' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-xl opacity-20 blur-lg"></div>
                  )}
                </button>
              )}

              {(role === 'admin' || role === 'super_admin') && (
                <button
                  onClick={() => setActiveTab('auditpage')}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                    activeTab === 'auditpage'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Audit</span>
                  </span>
                  {activeTab === 'auditpage' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-xl opacity-20 blur-lg"></div>
                  )}
                </button>
              )}
              {(role === 'admin' || role === 'super_admin') && (
                <button
                  onClick={() => setActiveTab('requestpage')}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                    activeTab === 'requestpage'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Requests</span>
                  </span>
                  {activeTab === 'requestpage' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-xl opacity-20 blur-lg"></div>
                  )}
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div
                  className={`relative overflow-hidden px-4 py-2 rounded-full text-xs font-bold shadow-lg border ${
                    role === 'super_admin'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/25 border-purple-400/20'
                      : role === 'admin'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/25 border-orange-400/20'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25 border-gray-400/20'
                  }`}
                >
                  <div className="relative z-10 flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>
                      {role === 'super_admin'
                        ? 'SUPER ADMIN'
                        : role === 'admin'
                        ? 'ADMIN'
                        : 'USER'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                </div>
              </div>

              <div className="p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-full shadow-lg border border-white/20 dark:border-gray-700/30">
                <ThemeToggle />
              </div>

              <button
                onClick={handleLogout}
                className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/25"
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="font-semibold">Logout</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </header>

      <main className="relative flex-1 p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'adminpanel' && <AdminPanel />}
          {activeTab === 'superadminpanel' && <SuperAdminPanel />}
          {activeTab === 'auditpage' && <AuditPage />}
          {activeTab === 'requestpage' && <RequestsTable />}
        </div>
      </main>
    </div>
  );
}
