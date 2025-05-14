import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    incident_title: "",
    project: "",
    priority_id: "",
    assigned_person: ""
  });


  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
    project: "",
    assigned_person: ""
  });
  const filteredTickets = tickets.filter((t) => {
    const term = filters.search.toLowerCase();
    return (
      (filters.search === "" ||
        t.incident_title?.toLowerCase().includes(term) ||
        t.id?.toString().includes(term)) &&
      (filters.priority === "" || t.priority_name === filters.priority) &&
      (filters.status === "" || t.status === filters.status) &&
      (filters.project === "" || t.project?.toLowerCase().includes(filters.project.toLowerCase())) &&
      (filters.assigned_person === "" || t.assigned_person?.toLowerCase().includes(filters.assigned_person.toLowerCase()))
    );
  });


  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);





  const [visibleCount, setVisibleCount] = useState(20);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    fetch("http://localhost/tickets-api/tickets.php")
      .then((res) => res.json())
      .then((data) => setTickets(data || []))
      .catch((err) => console.error("Eroare la fetch tickete:", err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = (ticketId) => {
    if (!newStatus) return;

    fetch("http://localhost/tickets-api/update_ticket.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Status actualizat!");
          fetchTickets();
          setSelectedTicket(null);
          setNewStatus("");
        } else {
          alert("Eroare la actualizare status.");
        }
      })
      .catch((err) => {
        console.error("Eroare update:", err);
        alert("Eroare server!");
      });
  };

  const handleDeleteTicket = (ticketId) => {
    if (!window.confirm("Sigur dorești să ștergi acest ticket?")) return;

    fetch(`http://localhost/tickets-api/delete_ticket.php?id=${ticketId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Ticket șters!");
          fetchTickets();
        } else {
          alert("Eroare la ștergere.");
        }
      })
      .catch((err) => {
        console.error("Eroare ștergere:", err);
        alert("Eroare server!");
      });
  };

  const handleAddTicket = (e) => {
    e.preventDefault();

    fetch("http://localhost/tickets-api/add_ticket.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Ticket adăugat!");
          fetchTickets();
          setShowAddForm(false);
          setNewTicket({
            incident_title: "",
            project: "",
            priority_id: "",
            assigned_person: "",
          });
        } else {
          alert("Eroare la adăugare ticket.");
        }
      })
      .catch((err) => {
        console.error("Eroare adăugare:", err);
        alert("Eroare server!");
      });
  };



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Admin Panel - Management Tickete
      </h1>

      {role === "superuser" && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Adaugă Ticket Nou
          </button>
        </div>
      )}

      {/* Filtrare Avansată */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Filtrare Tickete
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Căutare ID / Titlu"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Proiect"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Prioritate</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-left text-sm uppercase">
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">ID</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Incident</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Status</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Prioritate</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">SLA</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Proiect</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Start Date</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Last Modified</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Closed Date</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Description</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Comment</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Assigned</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Team Assigned</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Created By</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Team Created By</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Response Time</th>
              {role === "superuser" && (
                <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket) => (
              <tr key={ticket.id} className="text-gray-700 dark:text-gray-200">
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 font-semibold">#{ticket.id}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.incident_title}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.status}</td>
                <td className={`px-4 py-2 border dark:border-gray-600 font-medium ${ticket.priority_name === "Critical"
                  ? "bg-red-200 dark:bg-red-700"
                  : ticket.priority_name === "High"
                    ? "bg-orange-200 dark:bg-orange-700"
                    : ticket.priority_name === "Medium"
                      ? "bg-yellow-200 dark:bg-yellow-700"
                      : "bg-green-200 dark:bg-green-700"
                  }`}>
                  {ticket.priority_name}
                </td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.duration_hours}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.project}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.start_date}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.last_modified_date || "N/A"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.closed_date || "N/A"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.description || "-"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.comment || "-"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.assigned_person || "Neasignat"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.team_assigned_person || "-"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.created_by || "-"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.team_created_by || "-"}</td>
                <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">{ticket.response_time || "-"}</td>
                {role === "superuser" && (
                  <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          {Array.from({ length: Math.ceil(filteredTickets.length / ticketsPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>



      {/* Modal Modificare Status */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
              Modifică Status pentru #{selectedTicket.id}
            </h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selectează un status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Anulează
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedTicket.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adaugă Ticket */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200">
              Adaugă Ticket Nou
            </h2>
            <form onSubmit={handleAddTicket} className="space-y-4">
              <input
                type="text"
                placeholder="Titlu Incident"
                value={newTicket.incident_title}
                onChange={(e) => setNewTicket({ ...newTicket, incident_title: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Proiect"
                value={newTicket.project}
                onChange={(e) => setNewTicket({ ...newTicket, project: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newTicket.priority_id}
                onChange={(e) => setNewTicket({ ...newTicket, priority_id: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selectează Prioritate</option>
                <option value="1">Critical</option>
                <option value="2">High</option>
                <option value="3">Medium</option>
                <option value="4">Low</option>
              </select>
              <input
                type="text"
                placeholder="Assigned Person"
                value={newTicket.assigned_person}
                onChange={(e) => setNewTicket({ ...newTicket, assigned_person: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Adaugă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
