import { useState } from "react";

export default function TicketList({ tickets, onDelete, onAdd }) {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
    project: "",
  });
  const [newTicket, setNewTicket] = useState({
    incident_title: "",
    project: "",
    priority_id: "",
    assigned_person: ""
  });

  const filteredTickets = tickets.filter((t) => {
    const searchMatch =
      filters.search === "" ||
      t.incident_title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      t.id?.toString().includes(filters.search);
    const priorityMatch = filters.priority === "" || t.priority_name === filters.priority;
    const statusMatch = filters.status === "" || t.status === filters.status;
    const projectMatch = filters.project === "" || (t.project && t.project.toLowerCase().includes(filters.project.toLowerCase()));
    return searchMatch && priorityMatch && statusMatch && projectMatch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const role = localStorage.getItem("role");

  const toggleExpand = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };



  const handleAddTicket = (e) => {
    e.preventDefault();
    if (!newTicket.incident_title || !newTicket.project || !newTicket.priority_id) {
      alert("Completează toate câmpurile!");
      return;
    }
    onAdd(newTicket);
    setNewTicket({
      incident_title: "",
      project: "",
      priority_id: "",
      assigned_person: ""
    });
  };

  return (
    <div className="space-y-8">

      {/* Filtrare Avansată */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Filtrare Avansată
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Căutare ID / Titlu"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Toate Prioritățile</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Toate Statusurile</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Proiect"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Assigned Person"
            value={filters.assigned_person}
            onChange={(e) => setFilters({ ...filters, assigned_person: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Last Modified Date"
            value={filters.last_modified}
            onChange={(e) => setFilters({ ...filters, last_modified: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Form Adăugare Ticket (doar superuser) */}
      {role === "superuser" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Adaugă Ticket Nou</h2>
          <form onSubmit={handleAddTicket} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titlu Incident"
              value={newTicket.incident_title}
              onChange={(e) => setNewTicket({ ...newTicket, incident_title: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Proiect"
              value={newTicket.project}
              onChange={(e) => setNewTicket({ ...newTicket, project: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <select
              value={newTicket.priority_id}
              onChange={(e) => setNewTicket({ ...newTicket, priority_id: e.target.value })}
              className="p-2 border rounded"
              required
            >
              <option value="">Prioritate</option>
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
              className="p-2 border rounded"
            />
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Adaugă Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-left text-sm uppercase">
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">ID</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Incident</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Status</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Prioritate</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Proiect</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Start Date</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Assigned</th>
              <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Last Modified</th>
              {role === "superuser" && onDelete && (
                <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket) => (
              <tr key={ticket.id} className="text-gray-700 dark:text-gray-200">
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-semibold">
                  #{ticket.id}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.incident_title}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.status}
                </td>
                <td
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 font-medium ${ticket.priority_name === "Critical"
                    ? "bg-red-200 dark:bg-red-700"
                    : ticket.priority_name === "High"
                      ? "bg-orange-200 dark:bg-orange-700"
                      : ticket.priority_name === "Medium"
                        ? "bg-yellow-200 dark:bg-yellow-700"
                        : "bg-green-200 dark:bg-green-700"
                    }`}
                >
                  {ticket.priority_name}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.project}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.start_date}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.assigned_person || "Neasignat"}
                </td>
                <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                  {ticket.last_modified_date || "N/A"}
                </td>
                {role === "superuser" && onDelete && (
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <button
                      onClick={() => onDelete(ticket.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Șterge
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

      
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div> */}


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
              {role === "superuser" && onDelete && (
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
                  }`}>{ticket.priority_name}</td>
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
                {role === "superuser" && onDelete && (
                  <td className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800">
                    <button
                      onClick={() => onDelete(ticket.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Șterge
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination buttons */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>





    </div>
  );
}
