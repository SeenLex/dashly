import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets }) {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  // adaugă altele după nevoie

  const countBy = (arr, key) => {
    return arr.reduce((acc, item) => {
      const k = item[key] || "Unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  };

  const toArray = (obj, nameKey = "name", valueKey = "count") =>
    Object.entries(obj).map(([key, count]) => ({ [nameKey]: key, [valueKey]: count }));

  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setStatusData([]);
      setPriorityData([]);
      setTeamAssignedData([]);
      return;
    }

    const countedStatus = toArray(countBy(tickets, "status"), "status", "count");
    const countedPriority = toArray(countBy(tickets, "priority"), "priority", "count");
    const countedTeamAssigned = toArray(countBy(tickets, "team_assigned_person"), "team", "count");

    setStatusData(countedStatus);
    setPriorityData(countedPriority);
    setTeamAssignedData(countedTeamAssigned);

  }, [tickets]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Pie charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomPieChart
            key="statusChart"
            title={"Tickets by Status"}
            data={statusData}
            dataKey={"count"}
            nameKey={"status"}
          />,
          <CustomPieChart
            key="priorityChart"
            title={"Tickets by Priority"}
            data={priorityData}
            dataKey={"count"}
            nameKey={"priority"}
          />,
          <CustomPieChart
            key="teamAssignedChart"
            title={"Tickets by Team Assigned"}
            data={teamAssignedData}
            dataKey={"count"}
            nameKey={"team"}
          />,
        ]}
      />
    </>
  );
}

export default PieChartSection;
