import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    //login logic to be added when backend is ready

    //login mockup
    localStorage.setItem("isLoggedIn", "true");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <div className="bg-blue-800 lg:w-1/3 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-6 sm:mb-12">
            <span className="text-white text-4xl sm:text-6xl font-bold">
              Dash
            </span>
            <span className="text-red-400 text-3xl sm:text-5xl font-bold">
              ly
            </span>
          </div>

          <div className="hidden sm:block">
            <h1 className="text-2xl sm:text-2 xl font-bold text-white mb-3 sm:mb-4">
              Welcome to Dashly's Portal
            </h1>
            <p className="text-blue-100 mb-6 sm:mb-8">
              Secure your company's tasks — all in one unified view!{" "}
            </p>
          </div>
        </div>

        <div className="text-blue-200 text-xs sm:text-sm pt-2">
          <p>Join us in revolutionizing ticket management.</p>
          <p>© 2025 AfriValley Corporation. All rights reserved.</p>
        </div>
      </div>

      <div className="lg:w-2/3 flex items-center justify-center p-4 sm:p-24 lg:p-8">
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md ">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">
            Sign In
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
            Please enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  className="bg-transparent outline-none flex-1 text-gray-800 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="bg-transparent outline-none flex-1 text-gray-800 text-sm sm:text-base"
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs sm:text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
            >
              <span className="text-sm sm:text-base">Sign In</span>
              <ArrowRight size={16} className="ml-2" />
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-600 text-xs sm:text-sm">
              Don't have an account?
              <Link
                to="/register"
                className="text-blue-700 font-medium ml-1 hover:text-blue-800"
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
