export default function TicketFilter({ filters, onFilterChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <input
        type="text"
        placeholder="Caută ID / Nume"
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <select
        value={filters.priority}
        onChange={(e) => onFilterChange("priority", e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Toate Prioritățile</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <select
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Toate Statusurile</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Pending">Pending</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>
      <input
        type="text"
        placeholder="Caută Proiect"
        value={filters.project}
        onChange={(e) => onFilterChange("project", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onFilterChange("dateFrom", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => onFilterChange("dateTo", e.target.value)}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}
