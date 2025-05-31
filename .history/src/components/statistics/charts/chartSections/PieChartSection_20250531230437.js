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
    } else {
      // Reset data when no tickets
      setStatusData([]);
      setSlaData([]);
      setPriorityData([]);
      setTeamAssignedData([]);
      setTicketsSLA([]);
    }
  }, [tickets]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, dataKey, nameKey }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="label font-semibold text-gray-800 dark:text-gray-200">{`${payload[0].payload[nameKey]}`}</p>
          <p className="value text-blue-600 dark:text-blue-400">{`${payload[0].payload[dataKey]} tickets`}</p>
          {payload[0].payload.percentage && (
            <p className="percent text-green-600 dark:text-green-400">{`${payload[0].payload.percentage}%`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pie-chart-section">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Pie Charts Analysis</h1>
      </div>
      
      <CustomHorizontalContainer
        components={[
          <CustomPieChart
            key="statusChart"
            title="Tickets by Status"
            data={statusData}
            dataKey="count"
            nameKey="status"
            tooltip={<CustomTooltip dataKey="count" nameKey="status" />}
            colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']}
          />,
          <CustomPieChart
            key="slaChart"
            title="Tickets by SLA Status"
            data={slaData}
            dataKey="count"
            nameKey="status"
        
            colors={['#FF6B6B', '#4ECDC4', '#FFE66D']}
          />,
          <CustomPieChart
            key="priorityChart"
            title="Tickets by Priority"
            data={pData}
            dataKey="count"
            nameKey="priority"
      
            colors={['#FF0000', '#FFA500', '#FFFF00', '#008000']}
          />,
          <CustomPieChart
            key="teamAssignedChart"
            title="Tickets by Team Assigned"
            data={teamAssignedData}
            dataKey="count"
            nameKey="team"
    
            colors={['#8884D8', '#83A6ED', '#8DD1E1', '#82CA9D', '#A4DE6C']}
          />,
          <CustomPieChart
            key="slaStatusChart"
            title="Tickets by SLA"
            data={ticketsSLA}
            dataKey="value"
            nameKey="status"

            colors={['#FF7F50', '#6495ED', '#DC143C']}
          />,
        ]}
      />
    </div>
  );
}

export default PieChartSection;