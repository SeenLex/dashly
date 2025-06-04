import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ filters }) {
  const [statusData, setStatusData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [pData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  const [ticketsSLA, setTicketsSLA] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(filters).toString();
    fetch(`http://localhost/api/piecharts/get_tickets_by_status.php?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setStatusData(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/piecharts/get_tickets_by_sla_status.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlaData(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/piecharts/get_tickets_by_priority.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPriorityData(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/piecharts/get_tickets_by_team_assigned.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTeamAssignedData(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/piecharts/get_tickets_by_sla.php?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setTicketsSLA(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
  }, [filters]);

  return (
    <div className="pie-chart-section">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Pie Charts Analysis
        </h1>
      </div>

      <CustomHorizontalContainer
        components={[
          <CustomPieChart
            key="statusChart"
            title="Tichete după Status"
            data={statusData}
            dataKey="count"
            nameKey="status"
            colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]}
          />,
          <CustomPieChart
            key="slaChart"
            title="Tichete după SLA"
            data={slaData}
            dataKey="value"
            nameKey="status"
            colors={["#FF6B6B", "#4ECDC4", "#FFE66D"]}
          />,
          <CustomPieChart
            key="priorityChart"
            title="Tichete după Prioritate"
            data={pData}
            dataKey="count"
            nameKey="priority"
            colors={["#FF0000", "#FFA500", "#FFFF00", "#008000"]}
          />,
          <CustomPieChart
            key="teamAssignedChart"
            title="Tichete după Echipa Asignată"
            data={teamAssignedData}
            dataKey="count"
            nameKey="team"
            colors={["#8884D8", "#83A6ED", "#8DD1E1", "#82CA9D", "#A4DE6C"]}
          />,
          // <CustomPieChart
          //   key="slaStatusChart"
          //   title="Tichete după SLA"
          //   data={ticketsSLA}
          //   dataKey="value"
          //   nameKey="status"
          //   colors={["#FF7F50", "#6495ED", "#DC143C"]}
          // />,
        ]}
      />
    </div>
  );
}

export default PieChartSection;
