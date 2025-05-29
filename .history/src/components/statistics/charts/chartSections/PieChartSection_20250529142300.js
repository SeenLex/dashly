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
  const containerRef = useRef(null);
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
    if (!Array.isArray(tickets)) return;
    setStatusData(toArray(countBy(tickets, "status"), "status", "count"));
    setPriorityData(toArray(countBy(tickets, "priority"), "priority", "count"));
    setTeamAssignedData(toArray(countBy(tickets, "team_assigned_person"), "team", "count"));
  }, [tickets]);
// Handler care primește valoarea și eventul complet
  const handleSliceClick = (value, event) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;

    setSelectedCategory(value);
    setSelectedField("status"); // sau după cum vrei tu să setezi câmpul
    setPopupPosition({ x, y });
  };

  const filteredTickets = tickets.filter(ticket => ticket[selectedField] === selectedCategory);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-xl font-bold text-white mb-4">Pie Charts</h1>
      </div>
<div style={{ position: "relative" }}>
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
      /></div>

      {/* Floating Popup near cursor click */}
      {selectedCategory && (
        <div
          style={{
            position: "absolute",
            top: popupPosition.y + 10,
            left: popupPosition.x + 10,
            backgroundColor: "#222",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
            zIndex: 100,
            maxWidth: "280px",
          }}
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


export default PieChartSection;
