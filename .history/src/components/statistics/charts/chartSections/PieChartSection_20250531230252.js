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
    if (tickets && tickets.length > 0) {
      setStatusData(countByStatus(tickets));
      setSlaData(countBySlaStatus(tickets));
      setPriorityData(countByPriority(tickets));
      setTeamAssignedData(countByTeamAssigned(tickets));
      setTicketsSLA(ticketsBySLA(tickets));
    } else {
      setStatusData([]);
      setSlaData([]);
      setPriorityData([]);
      setTeamAssignedData([]);
      setTicketsSLA([]);
    }
  }, [tickets]);

 

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
  title="Tickets by Status"
  data={statusData}
  dataKey="count"
  nameKey="status"
  onSliceClick={() => {}}
/>
,
          <CustomPieChart
            key="slaChart"
            title="Tickets by SLA Status"
            data={slaData}
            dataKey="count"
            nameKey="status"
         
            colors={["#FF6B6B", "#4ECDC4", "#FFE66D"]}
          />,
          <CustomPieChart
            key="priorityChart"
            title="Tickets by Priority"
            data={pData}
            dataKey="count"
            nameKey="priority"

            colors={["#FF0000", "#FFA500", "#FFFF00", "#008000"]}
          />,
          <CustomPieChart
            key="teamAssignedChart"
            title="Tickets by Team Assigned"
            data={teamAssignedData}
            dataKey="count"
            nameKey="team"
   
            colors={["#8884D8", "#83A6ED", "#8DD1E1", "#82CA9D", "#A4DE6C"]}
          />,
          <CustomPieChart
            key="slaStatusChart"
            title="Tickets by SLA"
            data={ticketsSLA}
            dataKey="value"
            nameKey="status"
     
            colors={["#FF7F50", "#6495ED", "#DC143C"]}
          />,
        ]}
      />
    </div>
  );
}

export default PieChartSection;
