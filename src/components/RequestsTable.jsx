import React, { useState, useEffect } from "react";

const RequestsTable = () => {
  const initialRequests = [
    {
      id: 1,
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      projectName: "Project Alpha",
      status: "Pending",
    },
    {
      id: 2,
      fullName: "John Smith",
      email: "john.smith@example.com",
      projectName: "Project Beta",
      status: "Pending",
    },
    {
      id: 3,
      fullName: "Alice Johnson",
      email: "alice.johnson@example.com",
      projectName: "Project Gamma",
      status: "Pending",
    },
  ];

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(initialRequests);
  }, []);

  const handleAction = (id, action) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id
          ? { ...req, status: action === "accept" ? "Accepted" : "Declined" }
          : req
      )
    );
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Registration Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
              <th className="py-2 px-4 border border-gray-300">Full Name</th>
              <th className="py-2 px-4 border border-gray-300">Email</th>
              <th className="py-2 px-4 border border-gray-300">Project Name</th>
              <th className="py-2 px-4 border border-gray-300">Status</th>
              <th className="py-2 px-4 border border-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border border-gray-300">{req.fullName}</td>
                  <td className="py-2 px-4 border border-gray-300">{req.email}</td>
                  <td className="py-2 px-4 border border-gray-300">{req.projectName}</td>
                  <td className="py-2 px-4 border border-gray-300">{req.status}</td>
                  <td className="py-2 px-4 border border-gray-300 flex justify-center space-x-2">
                    {req.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleAction(req.id, "accept")}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "decline")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {req.status !== "Pending" && (
                      <span className="text-sm font-semibold text-gray-700">{req.status}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No registration requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
