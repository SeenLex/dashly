import React from "react";
import Filter from "./Filter";

function Filters({ filters, setFilters, allValues, onData }) {
  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (filters.team_assigned_person)
      queryParams.append("assigned_person", filters.team_assigned_person);
    if (filters.team_created_by)
      queryParams.append("created_by", filters.team_created_by);
    if (filters.priority) queryParams.append("priority", filters.priority);
    if (filters.project) queryParams.append("project", filters.project);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.startDate) queryParams.append("dateFrom", filters.startDate);
    if (filters.endDate) queryParams.append("dateTo", filters.endDate);
    if (filters.search) queryParams.append("search", filters.search);

    queryParams.append("limit", 10);
    queryParams.append("offset", 0);

    fetch(`http://localhost/tickets-api/tickets.php?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (onData) onData(data);
      })
      .catch((err) => console.error("Error fetching filtered data:", err));
  };

  const clearFilters = () => {
    setFilters({
      team_assigned_person: "",
      team_created_by: "",
      priority: "",
      project: "",
      status: "",
      slaStatus: "",
      sla: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Filter
          labelTitle="Team created by:"
          value={filters.team_created_by}
          onChangeCallback={(e) =>
            setFilters({ ...filters, team_created_by: e.target.value })
          }
          allValues={allValues.team_created_by || []}
        />
        <Filter
          labelTitle="Team assigned to:"
          value={filters.team_assigned_person}
          onChangeCallback={(e) =>
            setFilters({ ...filters, team_assigned_person: e.target.value })
          }
          allValues={allValues.team_assigned_person || []}
        />
        <Filter
          labelTitle="Priority:"
          value={filters.priority}
          onChangeCallback={(e) =>
            setFilters({ ...filters, priority: e.target.value })
          }
          allValues={
            allValues.priority || ["Low", "High", "Medium", "Critical"]
          }
        />

        <Filter
          labelTitle="Project:"
          value={filters.project}
          onChangeCallback={(e) =>
            setFilters({ ...filters, project: e.target.value })
          }
          allValues={allValues.project || []}
        />

        <Filter
          labelTitle="Status:"
          value={filters.status}
          onChangeCallback={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          allValues={allValues.status || []}
        />
        <Filter
          labelTitle="SLA Status:"
          value={filters.slaStatus}
          onChangeCallback={(e) =>
            setFilters({ ...filters, slaStatus: e.target.value })
          }
          allValues={["Met", "Exceeded", "In progress"]}
        />
        <Filter
          labelTitle="SLA Type:"
          value={filters.sla}
          onChangeCallback={(e) =>
            setFilters({ ...filters, sla: e.target.value })
          }
          allValues={["4h", "8h", "40h", "132h"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Filter
          labelTitle="Start Date:"
          type="date"
          value={filters.startDate}
          onChangeCallback={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <Filter
          labelTitle="End Date:"
          type="date"
          value={filters.endDate}
          onChangeCallback={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={handleSearch}
          className="custom-button custom-button-active"
        >
          Search
        </button>
        <button
          onClick={() => {
            clearFilters();
            if (onData) onData([]); // Clear data on clear filters if needed
          }}
          className="custom-button custom-button-inactive"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default Filters;
