import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Mail,
  ArrowRight,
  FolderCog,
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
    projectId: '',
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
        navigate('/login');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again later.');
    }
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
            <h1 className="text-2xl font-bold text-white mb-3">
              Create your Account
            </h1>
            <p className="text-blue-100 mb-6">
              Join our platform — all in one seamless view!
            </p>
          </div>
        </div>
        <div className="text-blue-200 text-xs sm:text-sm pt-2">
          <p>© 2025 AfriValley Corporation. All rights reserved.</p>
        </div>
      </div>

      <div className="lg:w-2/3 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Request Access
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Fill in your details to create a new account
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <InputField
              label="Full Name"
              id="fullName"
              icon={<User size={16} className="text-gray-400 mr-2" />}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              type="text"
              placeholder="Enter your full name"
            />

            <InputField
              label="Email Address"
              id="email"
              icon={<Mail size={16} className="text-gray-400 mr-2" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              placeholder="Enter your email address"
            />

            <InputField
              label="Project ID"
              id="projectId"
              icon={<FolderCog size={16} className="text-gray-400 mr-2" />}
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              type="number"
              placeholder="Enter your project ID"
            />

            <PasswordField
              label="Password"
              id="password"
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a password"
            />

            <PasswordField
              label="Confirm Password"
              id="confirmPassword"
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
            />

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 flex items-center justify-center mt-4"
            >
              <span className="text-base">Create Account</span>
              <ArrowRight size={16} className="ml-2" />
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
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

const InputField = ({
  label,
  id,
  icon,
  type,
  placeholder,
  value,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {icon}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none flex-1 text-gray-800 text-base"
      />
    </div>
  </div>
);

const PasswordField = ({
  label,
  id,
  show,
  toggle,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      <Lock size={16} className="text-gray-400 mr-2" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none flex-1 text-gray-800 text-base"
      />
      <button
        type="button"
        onClick={toggle}
        className="text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default Register;
