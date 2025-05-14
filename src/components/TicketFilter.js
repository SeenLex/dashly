export default function TicketFilter({ filters, onFilterChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <input
        type="text"
        name="search"
        placeholder="Caută după titlu sau ID"
        value={filters.search}
        onChange={handleChange}
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
      />
      <select
        name="priority"
        value={filters.priority}
        onChange={handleChange}
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
      >
        <option value="">Toate Prioritățile</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
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
        name="project"
        placeholder="Caută după proiect"
        value={filters.project}
        onChange={handleChange}
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
}
