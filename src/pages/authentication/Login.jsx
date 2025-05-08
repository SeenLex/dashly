import React, { useState } from 'react';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mail, parola }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="bg-blue-800 lg:w-1/3 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-12">
            <span className="text-white text-6xl font-bold">Dash</span>
            <span className="text-red-400 text-5xl font-bold">ly</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-white mb-4">
              Welcome to Dashly's Portal
            </h1>
            <p className="text-blue-100 mb-8">
              Secure your company's tasks — all in one unified view!
            </p>
          </div>
        </div>
        <div className="text-blue-200 text-sm pt-2">
          <p>Join us in revolutionizing ticket management.</p>
          <p>© 2025 AfriValley Corporation.</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="lg:w-2/3 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">
            Please enter your credentials to access your account
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm text-gray-700 block mb-1"
              >
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-transparent outline-none text-gray-800"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm text-gray-700 block mb-1"
              >
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={parola}
                  onChange={(e) => setParola(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="flex-1 bg-transparent outline-none text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 flex items-center justify-center"
            >
              <span>Sign In</span>
              <ArrowRight size={16} className="ml-2" />
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <p className="text-gray-600">
              Don’t have an account?
              <Link
                to="/register"
                className="text-blue-700 font-medium ml-1 hover:underline"
              >
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
