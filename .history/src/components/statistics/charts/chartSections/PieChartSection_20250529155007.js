import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection() {
  const [filters, setFilters] = useState({});  // aici păstrăm filtrele active

  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);

  const [tickets, setTickets] = useState([]);

  // Funcție pentru a crea query string din filtre
  const toQueryString = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  };

  // Fetch pie chart data când filtrele se schimbă
  useEffect(() => {
    const qsStatus = toQueryString({ ...filters, type: "status" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsStatus}`)
      .then((res) => res.json())
      .then((data) => setStatusData(data));

    const qsPriority = toQueryString({ ...filters, type: "priority" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsPriority}`)
      .then((res) => res.json())
      .then((data) => setPriorityData(data));

    const qsTeam = toQueryString({ ...filters, type: "team_assigned_person" });
    fetch(`http://localhost/api/tickets_piechart.php?${qsTeam}`)
      .then((res) => res.json())
      .then((data) => setTeamAssignedData(data));

    // Fetch lista completă de tickets filtrate
    const qsTickets = toQueryString(filters);
    fetch(`http://localhost/api/tickets_filtered.php?${qsTickets}`)
      .then((res) => res.json())
      .then((data) => setTickets(data));

  }, [filters]);

  // Handler click slice
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleSliceClick = (value, field, pos) => {
    setSelectedCategory(value);
    setSelectedField(field);
    setPopupPosition(pos);

   
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-xl font-bold text-white mb-4">Pie Charts</h1>
      </div>

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
            onSliceClick={(val, pos) => handleSliceClick(val, "team_assigned_person", pos)}
          />,
        ]}
      />

      {/* Floating Popup near cursor click */}
      {selectedCategory && (
        <div
          className="absolute bg-gray-900 text-white p-4 rounded-md shadow-lg z-50 w-80"
          style={{ top: popupPosition.y + 10, left: popupPosition.x + 10 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-semibold">
              {selectedField}: {selectedCategory}
            </h2>
            <button onClick={() => setSelectedCategory(null)} className="text-sm text-red-400">
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
