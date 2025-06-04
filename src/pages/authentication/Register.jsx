import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      mail: form.email,
      parola: form.password,
      nume: form.fullName,
      id_project: parseInt(form.projectId),
      isAdmin: form.isAdmin,
    };

    try {
      const res = await fetch('http://localhost/request_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration request submitted. Await admin approval.');
        navigate('/');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 mb-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Dashly
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Crează-ți un cont nou
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-lg p-7 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-left">
            Cerere de Înregistrare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-left">
            Completează formularul pentru a solicita accesul la portal. Cererea ta va fi revizuită de un administrator.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Nume Complet
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-purple-500 ">
                <User
                  size={16}
                  className="text-slate-400 dark:text-slate-500 mr-2"
                />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Adresă de Email
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-purple-500">
                <Mail
                  size={16}
                  className="text-slate-400 dark:text-slate-500 mr-2"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Parolă
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-purple-500">
                <Lock
                  size={16}
                  className="text-slate-400 dark:text-slate-500 mr-2"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 ml-2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Confirmă Parola
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-purple-500">
                <Lock
                  size={16}
                  className="text-slate-400 dark:text-slate-500 mr-2"
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 ml-2"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center pt-2">
              <input
                id="isAdmin"
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) =>
                  setForm({ ...form, isAdmin: e.target.checked })
                }
                className="h-3.5 w-3.5 text-purple-600 bg-slate-100 border-slate-300 dark:border-slate-500 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-slate-800 focus:ring-1 dark:bg-slate-700 cursor-pointer"
              />
              <label
                htmlFor="isAdmin"
                className="ml-2 block text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Înregistrează-te ca administrator
              </label>
            </div>

            <button
              type="submit"
              className="w-full group flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm"
            >
              Crează Cont
              <ArrowRight
                size={16}
                className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ai deja un cont?
              <Link
                to="/"
                className="text-purple-600 dark:text-purple-400 font-medium ml-1 hover:text-purple-800"
              >
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="absolute bottom-6 text-center w-full text-xs text-slate-400 dark:text-slate-500 z-0">
        © {new Date().getFullYear()} Dashly Corporation. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;