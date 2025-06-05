import Filter from "./Filter";

function Filters({ filters, setFilters, allValues, isLineChart = false }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Filter
          labelTitle="Echipă creată de:"
          value={filters.team_created_by_name}
          onChangeCallback={(e) =>
            setFilters({ ...filters, team_created_by_name: e.target.value })
          }
          allValues={allValues.team_created_by_name || []}
        />

        {!isLineChart && <Filter
          labelTitle="Echipă atribuită:"
          value={filters.team_assigned_person_name}
          onChangeCallback={(e) =>
            setFilters({ ...filters, team_assigned_person_name: e.target.value })
          }
          allValues={allValues.team_assigned_person_name || []}
        />}


        <Filter
          labelTitle="Prioritate:"
          value={filters.priority}
          onChangeCallback={(e) =>
            setFilters({ ...filters, priority: e.target.value })
          }
          allValues={allValues.priority || ["Low", "High", "Medium", "Critical"]}
        />

        {!isLineChart && <Filter
          labelTitle="Proiect:"
          value={filters.project}
          onChangeCallback={(e) =>
            setFilters({ ...filters, project: e.target.value })
          }
          allValues={allValues.project || []}
        />}

        <Filter
          labelTitle="Status:"
          value={filters.status}
          onChangeCallback={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          allValues={allValues.status || []}
        />

        <Filter
          labelTitle="Status SLA:"
          value={filters.slaStatus}
          onChangeCallback={(e) =>
            setFilters({ ...filters, slaStatus: e.target.value })
          }
          allValues={["Met", "Exceeded", "In progress"]}
        />

        <Filter
          labelTitle="Tip SLA:"
          value={filters.sla}
          onChangeCallback={(e) =>
            setFilters({ ...filters, sla: e.target.value })
          }
          allValues={["2h", "4h", "8h", "24h"]}
        />
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Filter
          labelTitle="Alocat începând cu data:"
          type="date"
          value={filters.startDate}
          onChangeCallback={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />

        <Filter
          labelTitle="Alocat până la data:"
          type="date"
          value={filters.endDate}
          onChangeCallback={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
        />
      </div>

      {/* Search and Clear Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => {
            setFilters({
              team_assigned_person: "",
              team_created_by: "",
              priority: "",
              project: "",
              status: "",
              slaStatus: "",
              sla: "",
              startDate: formatDate(oneYearAgo),
              endDate: formatDate(today),
            });
          }}
          className="custom-button custom-button-inactive"
        >
          Șterge filtrele
        </button>
      </div>
    </div>
  );
}

export default Filters;