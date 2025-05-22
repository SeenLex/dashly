import React, { useState, useEffect } from "react";

const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost/get_requests.php", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Not authorized");
        }

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        // alert("You are not authorized. Please login.");
        window.location.href = "/";
      }
    };

    fetchRequests();
  }, [token]);

  const handleAction = async (id, action) => {
    const baseURL = "http://localhost";
    const endpoint =
      action === "accept"
        ? `${baseURL}/aprove_request.php`
        : `${baseURL}/refuse_request.php`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_cerere: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Action failed");
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, status: action === "accept" ? "accepted" : "refused" }
            : req
        )
      );
    } catch (error) {
      console.error("Action error:", error);
      alert(error.message || "Server error. Try again.");
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Registration Requests</h2>
      <div className="overflow-x-auto">
        <div className="overflow-x-auto">
          {/* Header Row */}
          <div className="flex bg-gray-200 text-gray-600 uppercase text-sm border border-gray-300 rounded-lg">
            <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
              Full Name
            </div>
            <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
              Email
            </div>
            <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
              Project Name
            </div>
            <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
              Status
            </div>
            <div
              className="py-2 px-4 border border-gray-300 text-center font-semibold"
              style={{ width: "150px" }}
            >
              Actions
            </div>
          </div>

          {/* Data Rows */}
          {requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex hover:bg-gray-50 border border-gray-300 rounded-lg"
              >
                <div className="flex-1 py-2 px-4 border border-gray-300">
                  {req.fullName}
                </div>
                <div className="flex-1 py-2 px-4 border border-gray-300">
                  {req.email}
                </div>
                <div className="flex-1 py-2 px-4 border border-gray-300">
                  {req.projectName}
                </div>
                <div className="flex-1 py-2 px-4 border border-gray-300 capitalize">
                  {req.status}
                </div>
                <div
                  className="py-2 px-4 border border-gray-300 flex justify-center space-x-2"
                  style={{ width: "150px" }}
                >
                  {req.status === "pending" ? (
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
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-4 border border-gray-300 rounded-lg text-gray-500">
              No registration requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsTable;
