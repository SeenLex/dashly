import React, { useState } from "react";

function Filters({ allValues }) {
  const [filters, setFilters] = useState({
    team_assigned_person: "",
    team_created_by: "",
    priority: "",
    project: "",
    status: "",
    slaStatus: "",
    sla: "",
    dateFrom: "",
    dateTo: "",
  });

  const [tickets, setTickets] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        queryParams.append(key, value);
      }
    });

    fetch(`http://localhost/backend/filters.php?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
      })
      .catch((err) => console.error("Eroare la fetch:", err));
  };

  const handleClear = () => {
    setFilters({
      team_assigned_person: "",
      team_created_by: "",
      priority: "",
      project: "",
      status: "",
      slaStatus: "",
      sla: "",
      dateFrom: "",
      dateTo: "",
    });
    setTickets([]);
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <select name="team_assigned_person" value={filters.team_assigned_person} onChange={handleChange}>
          <option value="">Team Assigned Person</option>
          {allValues.teamAssignedPersons?.map((value) => (
            <option key={value.id_team} value={value.id_team}>
              {value.name}
            </option>
          ))}
        </select>

        <select name="team_created_by" value={filters.team_created_by} onChange={handleChange}>
          <option value="">Team Created By</option>
          {allValues.teamCreatedBys?.map((value) => (
            <option key={value.id_team} value={value.id_team}>
              {value.name}
            </option>
          ))}
        </select>

        <select name="priority" value={filters.priority} onChange={handleChange}>
          <option value="">Priority</option>
          {allValues.priorities?.map((value) => (
            <option key={value.id} value={value.priority}>
              {value.priority}
            </option>
          ))}
        </select>

        <select name="project" value={filters.project} onChange={handleChange}>
          <option value="">Project</option>
          {allValues.projects?.map((value) => (
            <option key={value.id_project} value={value.id_project}>
              {value.provider}
            </option>
          ))}
        </select>

        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">Status</option>
          {allValues.statuses?.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select name="slaStatus" value={filters.slaStatus} onChange={handleChange}>
          <option value="">SLA Status</option>
          <option value="Met">Met</option>
          <option value="Exceeded">Exceeded</option>
        </select>

        <select name="sla" value={filters.sla} onChange={handleChange}>
          <option value="">SLA Duration</option>
          {allValues.slas?.map((value) => (
            <option key={value.id_sla} value={value.duration_hours}>
              {value.duration_hours} h
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleChange}
          placeholder="End Date"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
        <button onClick={handleClear} className="px-4 py-2 bg-gray-400 text-white rounded">
          Clear Filters
        </button>
      </div>

      {/* Rezultate */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Rezultate:</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">Nu există rezultate.</p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.ticket_id} className="border p-2 rounded shadow-sm">
                <p><strong>{ticket.incident_title}</strong></p>
                <p>Status: {ticket.status}</p>
                <p>Start: {ticket.start_date}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Filters;
