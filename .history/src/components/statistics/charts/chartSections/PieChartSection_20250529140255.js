import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets }) {
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  // adaugă altele după nevoie

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

import { Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function CustomPieChart({ title, data, nameKey, onSliceClick }) {
  const RADIAN = Math.PI / 180;
  const COLORS = [
    "#4299e1", // Blue
    "#48bb78", // Green
    "#ed8936", // Orange
    "#f56565", // Red
    "#667eea", // Indigo
    "#ECC94B", // Yellow
    "#9F7AEA", // Purple
    "#4FD1C5", // Teal
  ];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  payload,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {payload.count} {/* aici afișezi numărul */}
    </text>
  );
};

useEffect(() => {
  console.log("TICKETS received in PieChartSection:", tickets);

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
    <div>
      <p className="text-lg font-semibold text-white mb-4 text-center">{title}</p>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: 'var(--text-color-primary)' }} />
          <Pie
  data={data}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={renderCustomizedLabel}
  outerRadius={130}
  dataKey="count"
  nameKey={nameKey}
  onClick={(entry, index) => {
    if (onSliceClick) onSliceClick(entry, index);
  }}
>
onClick={onSliceClick}
          </Pie>
          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CustomPieChart;

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
