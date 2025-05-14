import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  FolderCog,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    // Registration logic here
    navigate("/login");
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
            <h1 className="text-2xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Create your Account
            </h1>
            <p className="text-blue-100 mb-6 sm:mb-8">
              Join our platform — where your tickets come together in one
              seamless view!
            </p>
          </div>
        </div>

        <div className="text-blue-200 text-xs sm:text-sm pt-2">
          <p>Join us in revolutionizing ticket management.</p>
          <p>© 2025 AfriValley Corporation. All rights reserved.</p>
        </div>
      </div>

      <div className="lg:w-2/3 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">
            Request Access
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8">
            Fill in your details to create a new account
          </p>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="fullName"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="bg-transparent outline-none flex-1 text-gray-800 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Mail size={16} className="text-gray-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-transparent outline-none flex-1 text-gray-800 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="projectName"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Project Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <FolderCog size={16} className="text-gray-400 mr-2" />
                <input
                  id="projectName"
                  type="text"
                  placeholder="Enter your project name"
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
                  placeholder="Create a password"
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

            <div className="space-y-1 sm:space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-xs sm:text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="bg-transparent outline-none flex-1 text-gray-800 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-2 text-xs sm:text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-blue-700 hover:text-blue-800">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-700 hover:text-blue-800">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center mt-4"
            >
              <span className="text-sm sm:text-base">Create Account</span>
              <ArrowRight size={16} className="ml-2" />
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?
              <Link
                to="/"
                className="text-blue-700 font-medium ml-1 hover:text-blue-800"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
