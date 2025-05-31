import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets }) {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const countBy = (arr, key) => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, item) => {
      const k = item[key] || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  };

  const toArray = (obj, nameKey = "name", valueKey = "count") =>
    Object.entries(obj).map(([key, count]) => ({ [nameKey]: key, [valueKey]: count }));

useEffect(() => {
  fetch("http://localhost/api/tickets_piechart.php?type=status")
    .then((res) => res.json())
    .then((data) => setStatusData(data));
}, []);


  const handleSliceClick = (value, field, pos) => {
    setSelectedCategory(value);
    setSelectedField(field);
    setPopupPosition(pos);
  };

  const filteredTickets = tickets.filter(ticket => ticket[selectedField] === selectedCategory);

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
            nameKey="status"
            onSliceClick={(val, pos) => handleSliceClick(val, "status", pos)}
          />,
          <CustomPieChart
            key="priority"
            title="By Priority"
            data={priorityData}
            nameKey="priority"
            onSliceClick={(val, pos) => handleSliceClick(val, "priority", pos)}
          />,
          <CustomPieChart
            key="team"
            title="By Team Assigned"
            data={teamAssignedData}
            nameKey="team"
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
            <button onClick={() => setSelectedCategory(null)} className="text-sm text-red-400">×</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {filteredTickets.length === 0 && <p>No tickets found.</p>}
            {filteredTickets.map((t) => (
              <div key={t.id} className="border-b border-gray-700 pb-1">
                <p><strong>ID:</strong> {t.ticket_id}</p>
                <p><strong>Title:</strong> {t.incident_title}</p>
                <p><strong>Status:</strong> {t.status}</p>
                <p><strong>Priority:</strong> {t.priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// la finalul fișierului PieChartSection.js
export default PieChartSection;
