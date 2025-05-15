import React, { useState, useEffect } from 'react';

const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost/get_requests.php', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Not authorized');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      alert('You are not authorized. Please login.');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    const baseURL = 'http://localhost';
    const endpoint =
      action === 'accept'
        ? `${baseURL}/aprove_request.php`
        : `${baseURL}/refuse_request.php`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_cerere: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: action === 'accept' ? 'accepted' : 'refused' }
            : req
        )
      );
    } catch (error) {
      console.error('Action error:', error);
      alert(error.message || 'Server error. Try again.');
    }
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
              <th className="py-2 px-4 border border-gray-300 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border border-gray-300">
                    {req.fullName}
                  </td>
                  <td className="py-2 px-4 border border-gray-300">
                    {req.email}
                  </td>
                  <td className="py-2 px-4 border border-gray-300">
                    {req.projectName}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 capitalize">
                    {req.status}
                  </td>
                  <td className="py-2 px-4 border border-gray-300 flex justify-center space-x-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'accept')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'decline')}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">
                        {req.status}
                      </span>
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
