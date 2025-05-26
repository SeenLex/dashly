import React, { useState, useRef, useEffect } from "react";
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

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    projectId: "",
    isAdmin: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [projectOptions, setProjectOptions] = useState([]);

  useEffect(() => {
    // close dropdown on outside click
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // fetch projects
    (async () => {
      try {
        const res = await fetch("http://localhost/get_projects.php");
        const data = await res.json();
        setProjectOptions(
          data.map((proj) => ({
            id: proj.id_project,
            name: proj.provider,
          }))
        );
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    })();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProjectSelect = (project) => {
    setForm((f) => ({ ...f, projectId: project.id.toString() }));
    setIsDropdownOpen(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      mail: form.email,
      parola: form.password,
      nume: form.fullName,
      id_project: parseInt(form.projectId, 10),
      is_admin: form.isAdmin ? 1 : 0,
    };

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
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* ← left panel unchanged → */}

      <div className="lg:w-2/3 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Request Access
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Fill in your details to create a new account
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1">
                <User size={16} className="text-gray-400 mr-2" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="bg-transparent outline-none flex-1 text-gray-800 text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1">
                <Mail size={16} className="text-gray-400 mr-2" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="bg-transparent outline-none flex-1 text-gray-800 text-base"
                />
              </div>
            </div>

            {/* Register as Admin */}
            <div className="flex items-center">
              <input
                id="isAdmin"
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) =>
                  setForm({ ...form, isAdmin: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="isAdmin"
                className="ml-2 block text-sm text-gray-700"
              >
                Register as Project Admin
              </label>
            </div>

            {/* Project selector (always shown) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FolderCog size={16} className="text-gray-400 mr-2" />
                  <span>
                    {form.projectId
                      ? projectOptions.find(
                          (p) => p.id.toString() === form.projectId
                        )?.name
                      : "Select your project"}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto shadow-lg"
                >
                  {projectOptions.map((project) => (
                    <button
                      key={project.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleProjectSelect(project)}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="bg-transparent outline-none flex-1 text-gray-800 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className="bg-transparent outline-none flex-1 text-gray-800 text-base"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
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

export default Register;
