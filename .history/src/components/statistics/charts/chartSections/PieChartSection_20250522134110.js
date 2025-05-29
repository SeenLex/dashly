import { useEffect, useState } from "react";
import { countByStatus } from "../../helpers/fct.js";
import { countBySlaStatus } from "../../helpers/fct.js";
import { countByPriority } from "../../helpers/fct.js";
import { countByTeamAssigned } from "../../helpers/fct.js";
import { ticketsBySLA } from "../../helpers/fct.js";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets }) {
  const [statusData, setStatusData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [pData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  const [ticketsSLA, setTicketsSLA] = useState([]);

  useEffect(() => {
    if (tickets) {
      const stData = countByStatus(tickets);
      setStatusData(stData);

      const slaData = countBySlaStatus(tickets);
      setSlaData(slaData);

      const pData = countByPriority(tickets);
      setPriorityData(pData);

      const teamData = countByTeamAssigned(tickets);
      setTeamAssignedData(teamData);

      const ticketsSLA = ticketsBySLA(tickets);
      setTicketsSLA(ticketsSLA);
    }
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
            key="slaChart"
            title={"Tickets by SLA Status"}
            data={slaData}
            dataKey={"count"}
            nameKey={"status"}
          />,
          <CustomPieChart
            key="priorityChart"
            title={"Tickets by Priority"}
            data={pData}
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
          <CustomPieChart
            key="slaStatusChart"
            title={"Tickets by SLA"}
            data={ticketsSLA}
            dataKey={"value"}
            nameKey={"status"}
          />,
        ]}
      />
    </>
  );
}

export default PieChartSection;
