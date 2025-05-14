import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>
      <div>
        <button className="text-black bg-white px-3 py-1 rounded hover:bg-red-200 hover:text-red-500 transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
