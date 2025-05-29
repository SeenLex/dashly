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
    if (!Array.isArray(tickets)) return;
    setStatusData(toArray(countBy(tickets, "status"), "status", "count"));
    setPriorityData(toArray(countBy(tickets, "priority"), "priority", "count"));
    setTeamAssignedData(toArray(countBy(tickets, "team_assigned_person"), "team", "count"));
  }, [tickets]);

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
          {/* Conținut popup */}
          <p>{selectedCategory}</p>
          <button onClick={() => setSelectedCategory(null)}>Close</button>
        </div>
      )}
    </>
  );
}


export default PieChartSection;
