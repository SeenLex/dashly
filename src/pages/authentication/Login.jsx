import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mail, setMail] = useState('');
  const [parola, setParola] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, parola }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        navigate('/home');
      } else {
        const errorMsg = data.error || 'Login failed';
        alert(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'Network error or server is unreachable.';
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/NOKILABS.png"
            alt="Dashly Logo"
            className="h-20 object-contain rounded-xl shadow-md"
          />
        </div>

        <div className="bg-white dark:bg-gray-900/80 rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
            Autentifică-te în cont
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">
            Bine ai venit! Te rugăm să te autentifici pentru a accesa platforma.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email
              </label>
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2">
                <User size={16} className="text-slate-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Parolă
              </label>
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2">
                <Lock size={16} className="text-slate-400 mr-2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  required
                  placeholder="Parola"
                  className="w-full bg-transparent outline-none text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-slate-400 hover:text-purple-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Autentificare
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai cont?{' '}
              <Link to="/register" className="text-purple-600 hover:underline">
                Înregistrează-te
              </Link>
            </p>
          </div>
        </div>

        <footer className="text-center mt-4 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Dashly Corporation. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Login;
