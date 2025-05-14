import React from "react";
import Navbar from "../../components/Navbar";
import RequestsTable from "../../components/RequestsTable";

const AdminPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 p-4">
        <RequestsTable />
      </div>
    </div>
  );
};

export default AdminPage;
