import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ArrowRight, Building } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mail, setMail] = useState("");
  const [parola, setParola] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail, parola }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        navigate("/home");
      } else {
        const errorMsg = data.error || "Login failed";
        alert(errorMsg); // Keep alert for immediate user feedback
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err); // Log the actual error
      const errorMsg = "Network error or server is unreachable.";
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-700 relative overflow-hidden">
      {/* Decorative elements are already responsive with sm: prefixes */}
      <div className="absolute -top-40 -right-40 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 dark:from-blue-400/15 dark:to-purple-600/15 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -left-40 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-indigo-400/10 to-pink-600/10 dark:from-indigo-400/15 dark:to-pink-600/15 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse-slow-delay"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
            Dash<span className="text-blue-500 dark:text-blue-400">ly</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-center px-2">
            Acces securizat la platforma Dashly
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-indigo-900/30 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
            Autentifică-te în cont
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center">
            Bine ai venit! Te rugăm să te autentifici pentru a accesa platforma
            Dashly.
          </p>

          {error && (
            <div className="bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm border border-red-500/30 dark:border-red-500/40 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-1.5"
              >
                Adresă de email
              </label>
              <div className="flex items-center bg-white/80 dark:bg-slate-800/60 border border-slate-300/70 dark:border-slate-700/50 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-purple-500">
                <User
                  size={18}
                  className="text-slate-400 dark:text-slate-500 mr-3"
                />
                <input
                  id="email"
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-1.5"
              >
                Parolă
              </label>
              <div className="flex items-center bg-white/80 dark:bg-slate-800/60 border border-slate-300/70 dark:border-slate-700/50 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-purple-500">
                <Lock
                  size={18}
                  className="text-slate-400 dark:text-slate-500 mr-3"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  placeholder="Introdu parola"
                  required
                  className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ml-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full group relative overflow-hidden px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/50 flex items-center justify-center text-sm"
            >
              <span className="relative z-10">Autentificare</span>
              <ArrowRight
                size={18}
                className="ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-50 group-hover:opacity-100"></div>
            </button>
          </form>

          <div className="text-center mt-8 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Nu ai un cont?{" "}
              <Link
                to="/register"
                className="text-purple-600 dark:text-purple-400 font-medium ml-1 hover:text-purple-700 dark:hover:text-purple-500"
              >
                Înregistrează-te
              </Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="absolute bottom-6 text-center w-full text-xs text-slate-500 dark:text-slate-400 z-0">
        © {new Date().getFullYear()} Dashly Corporation. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;