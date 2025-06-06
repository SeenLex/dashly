import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
  Archive, // Added for Project ID
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAdmin: false,
    projectId: "", // Added for admin registration
  });
  const [error, setError] = useState(""); // For displaying errors

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      setError("Passwords do not match");
      return;
    }

    const payload = {
      mail: form.email,
      parola: form.password,
      nume: form.fullName,
      isAdmin: form.isAdmin,
    };

    if (form.isAdmin) {
      if (!form.projectId.trim()) {
        const msg = "Project ID is required for admin registration.";
        alert(msg);
        setError(msg);
        return;
      }
      const projectIdParsed = parseInt(form.projectId);
      if (isNaN(projectIdParsed)) {
        const msg = "Project ID must be a valid number.";
        alert(msg);
        setError(msg);
        return;
      }
      payload.id_project = projectIdParsed;
    }

    try {
      const res = await fetch("http://localhost/request_register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration request submitted. Await admin approval.");
        navigate("/");
      } else {
        const errorMsg = data.error || "Registration failed";
        alert(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = "An error occurred. Please try again later.";
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700 relative overflow-hidden">
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

        <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-xl p-7 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-left">
            Cerere de Înregistrare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-left">
            Completează formularul pentru a solicita accesul la portal. Cererea
            ta va fi revizuită de un administrator.
          </p>

          {error && (
            <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-lg mb-4 text-xs">
              {error}
            </div>
          )}

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
                  placeholder="Numele tău complet"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
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
                  required
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Creează o parolă puternică"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 ml-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Reintrodu parola"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                  className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 ml-2"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
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

            <div className="flex items-center pt-1">
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

            {form.isAdmin && (
              <div>
                <label
                  htmlFor="projectId"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
                >
                  ID Proiect (pentru admin)
                </label>
                <div className="flex items-center bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-purple-500">
                  <Archive // Using Archive icon for Project ID
                    size={16}
                    className="text-slate-400 dark:text-slate-500 mr-2"
                  />
                  <input
                    id="projectId"
                    type="number" // Changed to number for easier parsing, can be text if IDs are alphanumeric
                    placeholder="Introdu ID-ul proiectului"
                    value={form.projectId}
                    onChange={(e) =>
                      setForm({ ...form, projectId: e.target.value })
                    }
                    required={form.isAdmin} // Required only if isAdmin is checked
                    className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full group flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm transition-all duration-150"
            >
              Trimite Cererea
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
                className="text-purple-600 dark:text-purple-400 font-medium ml-1 hover:text-purple-700 dark:hover:text-purple-500"
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