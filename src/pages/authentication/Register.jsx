import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  Archive,
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
    projectId: '',
  });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    const payload = {
      mail: form.email,
      parola: form.password,
      nume: form.fullName,
      isAdmin: form.isAdmin,
    };

    if (form.isAdmin) {
      const id = parseInt(form.projectId);
      if (!id || isNaN(id)) {
        setError('ID Proiect invalid');
        return;
      }
      payload.id_project = id;
    }

    try {
      const res = await fetch('http://localhost/request_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Cererea a fost trimisă. Așteaptă aprobarea adminului.');
        navigate('/');
      } else {
        setError(data.error || 'Eroare la înregistrare');
      }
    } catch (err) {
      setError('Eroare de rețea sau server indisponibil.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
      <div className="w-full max-w-md p-6">
        <div className="flex justify-center mb-6">
          <img
            src="/NOKILABS.png"
            alt="Dashly Logo"
            className="h-20 object-contain rounded-xl shadow"
          />
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xl p-7">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Cerere de Înregistrare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Completează formularul pentru a solicita accesul. Cererea va fi
            revizuită de un administrator.
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Nume Complet
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5">
                <User size={16} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Numele tău complet"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5">
                <Mail size={16} className="text-slate-400 mr-2" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Parolă
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5">
                <Lock size={16} className="text-slate-400 mr-2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Creează o parolă"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 ml-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Confirmă Parola
              </label>
              <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5">
                <Lock size={16} className="text-slate-400 mr-2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Reintrodu parola"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 ml-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isAdmin"
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) =>
                  setForm({ ...form, isAdmin: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 border-gray-300 rounded"
              />
              <label
                htmlFor="isAdmin"
                className="ml-2 text-sm text-slate-600 dark:text-slate-300"
              >
                Înregistrează-te ca administrator
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
            >
              Trimite Cererea <ArrowRight size={16} className="inline ml-1" />
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Ai deja un cont?{' '}
              <Link to="/" className="text-purple-600 hover:underline">
                Autentifică-te
              </Link>
            </p>
          </div>
        </div>

        <footer className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Dashly Corporation. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Register;
