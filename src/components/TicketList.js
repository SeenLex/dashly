import { useState } from "react";

export default function TicketList({ tickets, onDelete, onAdd, filters, setFilters, currentPage, ticketsPerPage }) {

  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [expandedStartId, setExpandedStartId] = useState(null);
  const [expandedModifiedId, setExpandedModifiedId] = useState(null);
  const [expandedClosedId, setExpandedClosedId] = useState(null);

  const formatTime = (datetime) => {
    if (!datetime) return "N/A";
    const dateObj = new Date(datetime);
    if (isNaN(dateObj)) return datetime;
    return dateObj.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const role = localStorage.getItem("role");

  const [newTicket, setNewTicket] = useState({
    incident_title: "",
    project: "",
    priority_id: "",
    assigned_person: ""
  });

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
      {/* Filtrare */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Filtrare Avansată
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="text" placeholder="Ticket ID" value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="p-2 border rounded w-full" />
          <select value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="p-2 border rounded w-full">
            <option value="">Toate Prioritățile</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="p-2 border rounded w-full">
            <option value="">Toate Statusurile</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
          <input type="text" placeholder="Proiect" value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Assigned Person" value={filters.assigned_person}
            onChange={(e) => setFilters({ ...filters, assigned_person: e.target.value })} className="p-2 border rounded w-full" />
          <input type="text" placeholder="Created By" value={filters.created_by}
            onChange={(e) => setFilters({ ...filters, created_by: e.target.value })} className="p-2 border rounded w-full" />
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Start Date</label>
            <input type="date" value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="p-2 border rounded w-full" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">End Date</label>
            <input type="date" value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="p-2 border rounded w-full" />
          </div>
        </div>
      </div>

      {/* Tabelul */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-left text-sm uppercase">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Ticket No</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Prioritate</th>
              <th className="px-4 py-2 border">SLA (h)</th>
              <th className="px-4 py-2 border">IN/OUT SLA</th>
              <th className="px-4 py-2 border">Proiect</th>
              <th className="px-4 py-2 border">Start Date</th>
              <th className="px-4 py-2 border">Last Modified</th>
              <th className="px-4 py-2 border">Closed Date</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Comment</th>
              <th className="px-4 py-2 border">Assigned</th>
              <th className="px-4 py-2 border">Team Assigned</th>
              <th className="px-4 py-2 border">Created By</th>
              <th className="px-4 py-2 border">Team Created By</th>
              <th className="px-4 py-2 border">Response Time</th>
              {role === "superuser" && onDelete && (
                <th className="px-4 py-2 border">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, index) => (
              <tr key={ticket.id} className="text-gray-700 dark:text-gray-200">
                <td className="px-4 py-2 border">
                  {(currentPage - 1) * ticketsPerPage + index + 1}
                </td>

                <td className="px-4 py-2 border">{ticket.ticket_id}</td>
                <td className="px-4 py-2 border">{ticket.status}</td>
                <td className={`px-4 py-2 border font-medium ${ticket.priority_name === "Critical" ? "bg-red-200 dark:bg-red-700" :
                    ticket.priority_name === "High" ? "bg-orange-200 dark:bg-orange-700" :
                      ticket.priority_name === "Medium" ? "bg-yellow-200 dark:bg-yellow-700" :
                        "bg-green-200 dark:bg-green-700"
                  }`}>
                  {ticket.priority_name}
                </td>
                <td className="px-4 py-2 border">{ticket.duration_hours || "-"}</td>
                <td className="px-4 py-2 border">{ticket.sla_status}</td>
                <td className="px-4 py-2 border">{ticket.project}</td>
                <td
                  className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setExpandedStartId(
                      expandedStartId === ticket.id ? null : ticket.id
                    )
                  }
                  title={ticket.start_date}
                >
                  {expandedStartId === ticket.id
                    ? ticket.start_date
                    : formatTime(ticket.start_date)}
                </td>
                {/* Last Modified Date */}
                <td
                  className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setExpandedModifiedId(expandedModifiedId === ticket.id ? null : ticket.id)
                  }
                  title={ticket.last_modified_date || "N/A"}
                >
                  {expandedModifiedId === ticket.id
                    ? ticket.last_modified_date || "N/A"
                    : formatTime(ticket.last_modified_date)}
                </td>
                {/* Closed Date */}
                <td
                  className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setExpandedClosedId(expandedClosedId === ticket.id ? null : ticket.id)
                  }
                  title={ticket.closed_date || "N/A"}
                >
                  {expandedClosedId === ticket.id
                    ? ticket.closed_date || "N/A"
                    : formatTime(ticket.closed_date)}
                </td>
                {/* DESCRIPTION */}
                <td
                  className={`px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 max-w-[200px] cursor-pointer ${expandedDescriptionId !== String(ticket.id) ? "truncate" : ""
                    }`}
                  title={ticket.description}
                  onClick={() =>
                    setExpandedDescriptionId(
                      expandedDescriptionId === String(ticket.id) ? null : String(ticket.id)
                    )
                  }
                >
                  {expandedDescriptionId === String(ticket.id)
                    ? ticket.description || "-"
                    : (ticket.description || "-").slice(0, 100) +
                    ((ticket.description?.length || 0) > 100 ? "..." : "")}
                </td>

                {/* COMMENT */}
                <td
                  className={`px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-800 max-w-[200px] cursor-pointer ${expandedCommentId !== String(ticket.id) ? "truncate" : ""
                    }`}
                  title={ticket.comment}
                  onClick={() =>
                    setExpandedCommentId(
                      expandedCommentId === String(ticket.id) ? null : String(ticket.id)
                    )
                  }
                >
                  {expandedCommentId === String(ticket.id)
                    ? ticket.comment || "-"
                    : (ticket.comment || "-").slice(0, 100) +
                    ((ticket.comment?.length || 0) > 100 ? "..." : "")}
                </td>
                <td className="px-4 py-2 border">{ticket.assigned_person || "-"}</td>
                <td className="px-4 py-2 border">{ticket.team_assigned_person || "-"}</td>
                <td className="px-4 py-2 border">{ticket.created_by || "-"}</td>
                <td className="px-4 py-2 border">{ticket.team_created_by || "-"}</td>
                <td className="px-4 py-2 border">{ticket.response_time || "-"}</td>
                {role === "superuser" && onDelete && (
                  <td className="px-4 py-2 border">
                    <button onClick={() => onDelete(ticket.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      Șterge
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
