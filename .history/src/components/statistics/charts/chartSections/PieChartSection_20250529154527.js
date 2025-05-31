import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import Filters from "../../filters/"

function PieChartSection() {
  // Filtrele modificate în UI (click pe chart, inputuri)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    team_assigned_person: "",
    // ... inițializează toate filtrele relevante
  });

  // Filtrele efectiv aplicate în fetch-uri
  const [appliedFilters, setAppliedFilters] = useState({});

  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);

  const [tickets, setTickets] = useState([]);

  // Helper pentru query string
  const toQueryString = (filtersObj) => {
    const params = new URLSearchParams();
    Object.entries(filtersObj).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  };

  // Fetch când se schimbă appliedFilters
  useEffect(() => {
    // Nu face fetch dacă appliedFilters e gol
    if (Object.keys(appliedFilters).length === 0) return;

    const qsStatus = toQueryString({ ...appliedFilters, type: "status" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsStatus}`)
      .then((res) => res.json())
      .then(setStatusData);

    const qsPriority = toQueryString({ ...appliedFilters, type: "priority" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsPriority}`)
      .then((res) => res.json())
      .then(setPriorityData);

    const qsTeam = toQueryString({ ...appliedFilters, type: "team_assigned_person" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsTeam}`)
      .then((res) => res.json())
      .then(setTeamAssignedData);

    const qsTickets = toQueryString(appliedFilters);
    fetch(`http://localhost/api/tickets_filtered.php?${qsTickets}`)
      .then((res) => res.json())
      .then(setTickets);
  }, [appliedFilters]);

  // La click pe o felie din piechart, actualizezi doar filters (nu aplici)
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleSliceClick = (value, field, pos) => {
    setSelectedCategory(value);
    setSelectedField(field);
    setPopupPosition(pos);

    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Nu modificăm appliedFilters aici
  };

  // Funcție care se apelează când apeși Search în Filters
  const applyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  // Pentru popularea filtrelor dropdown (opțional)
  const allValues = {
    // Exemple:
    team_assigned_person: [...new Set(tickets.map((t) => t.team_assigned_person))],
    team_created_by: [...new Set(tickets.map((t) => t.team_created_by))],
    priority: ["Low", "Medium", "High", "Critical"],
    project: [...new Set(tickets.map((t) => t.project))],
    status: [...new Set(tickets.map((t) => t.status))],
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-xl font-bold text-white mb-4">Pie Charts</h1>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        allValues={allValues}
        onApplyFilters={applyFilters}
      />

      <CustomHorizontalContainer
        components={[
          <CustomPieChart
            key="status"
            title="By Status"
            data={statusData}
            nameKey="label"
            onSliceClick={(val, pos) => handleSliceClick(val, "status", pos)}
          />,
          <CustomPieChart
            key="priority"
            title="By Priority"
            data={priorityData}
            nameKey="label"
            onSliceClick={(val, pos) => handleSliceClick(val, "priority", pos)}
          />,
          <CustomPieChart
            key="team"
            title="By Team Assigned"
            data={teamAssignedData}
            nameKey="label"
            onSliceClick={(val, pos) =>
              handleSliceClick(val, "team_assigned_person", pos)
            }
          />,
        ]}
      />

      {/* Popup cu lista ticket-uri filtrate */}
      {selectedCategory && (
        <div
          className="absolute bg-gray-900 text-white p-4 rounded-md shadow-lg z-50 w-80"
          style={{ top: popupPosition.y + 10, left: popupPosition.x + 10 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-semibold">
              {selectedField}: {selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-red-400"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {tickets.length === 0 && <p>No tickets found.</p>}
            {tickets
              .filter((t) => t[selectedField] === selectedCategory)
              .map((t) => (
                <div key={t.id} className="border-b border-gray-700 pb-1">
                  <p>
                    <strong>ID:</strong> {t.ticket_id}
                  </p>
                  <p>
                    <strong>Title:</strong> {t.incident_title}
                  </p>
                  <p>
                    <strong>Status:</strong> {t.status}
                  </p>
                  <p>
                    <strong>Priority:</strong> {t.priority}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

export default PieChartSection;
