import { useEffect, useState } from "react";
import { countByStatus } from "../../helpers/fct.js";
import { countBySlaStatus } from "../../helpers/fct.js";
import { countByPriority } from "../../helpers/fct.js";
import { countByTeamAssigned } from "../../helpers/fct.js";
import { ticketsBySLA } from "../../helpers/fct.js";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function PieChartSection({ tickets, filters }) {
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [pData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  const [ticketsSLA, setTicketsSLA] = useState([]);

  useEffect(() => {
    if (!tickets) return;

    // Aplică filtrele pe tickets
    const filtered = tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && ticket.priority !== filters.priority) return false;
      if (filters.team_assigned_person && ticket.team_assigned_person !== filters.team_assigned_person) return false;
      if (filters.project && ticket.project !== filters.project) return false;
      if (filters.startDate && new Date(ticket.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(ticket.date) > new Date(filters.endDate)) return false;
      if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    setFilteredTickets(filtered);
  }, [tickets, filters]);

  useEffect(() => {
    if (filteredTickets.length === 0) return;

    setStatusData(countByStatus(filteredTickets));
    setSlaData(countBySlaStatus(filteredTickets));
    setPriorityData(countByPriority(filteredTickets));
    setTeamAssignedData(countByTeamAssigned(filteredTickets));
    setTicketsSLA(ticketsBySLA(filteredTickets));
  }, [filteredTickets]);

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

