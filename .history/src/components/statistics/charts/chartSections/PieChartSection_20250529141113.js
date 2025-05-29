import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets }) {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState(null); // ex: "status", "priority", etc.

  const countBy = (arr, key) => {
    if (!Array.isArray(arr)) return {};
    return arr.reduce((acc, item) => {
      const k = item[key] || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  };

  const toArray = (obj, nameKey = "name", valueKey = "count") =>
    Object.entries(obj).map(([key, count]) => ({
      [nameKey]: key,
      [valueKey]: count,
    }));

  useEffect(() => {
    if (!Array.isArray(tickets)) return;

    setStatusData(toArray(countBy(tickets, "status"), "status", "count"));
    setPriorityData(toArray(countBy(tickets, "priority"), "priority", "count"));
    setTeamAssignedData(toArray(countBy(tickets, "team_assigned_person"), "team", "count"));
  }, [tickets]);

  const handleSliceClick = (value, fieldName) => {
    setSelectedCategory(value);     // ex: "Closed"
    setSelectedField(fieldName);    // ex: "status"
  };

  const filteredDetails = selectedField && selectedCategory
    ? tickets.filter((t) => (t[selectedField] || "Unknown") === selectedCategory)
    : [];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-white text-2xl mb-4">Pie Charts</h1>
      </div>

      <CustomHorizontalContainer
        components={[
          <CustomPieChart
            key="statusChart"
            title={"Tickets by Status"}
            data={statusData}
            dataKey={"count"}
            nameKey={"status"}
            onSliceClick={(val) => handleSliceClick(val, "status")}
          />,
          <CustomPieChart
            key="priorityChart"
            title={"Tickets by Priority"}
            data={priorityData}
            dataKey={"count"}
            nameKey={"priority"}
            onSliceClick={(val) => handleSliceClick(val, "priority")}
          />,
          <CustomPieChart
            key="teamAssignedChart"
            title={"Tickets by Team Assigned"}
            data={teamAssignedData}
            dataKey={"count"}
            nameKey={"team"}
            onSliceClick={(val) => handleSliceClick(val, "team_assigned_person")}
          />,
        ]}
      />

      {/* Ticket List on Slice Click */}
      {filteredDetails.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-3">
            Tickets for {selectedField}: <span className="text-yellow-400">{selectedCategory}</span>
          </h2>
          <div className="grid gap-4">
            {filteredDetails.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gray-700 p-4 rounded shadow text-white border border-gray-600"
              >
                <p><strong>ID:</strong> {ticket.ticket_id}</p>
                <p><strong>Title:</strong> {ticket.incident_title}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Assigned To:</strong> {ticket.assigned_person}</p>
                <p><strong>Project:</strong> {ticket.project}</p>
                <p><strong>Description:</strong> {ticket.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default PieChartSection;
