import { useEffect, useState } from "react";
import {
  countByPriority,
  getPercentsFromCounted,
  countByTeamAssigned,
  countByProject,
  calculateSlaStatus,
  convertSlaStatusToPercentages,
} from "../../helpers/fct.js";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function BarChartSection({ tickets, totalCount }) {
  const [numByPriority, setNumByPriority] = useState([]);
  const [percByPriority, setPercByPriority] = useState([]);
  const [resolutionSLANumByPriority, setResolutionSLANumByPriority] = useState(
    []
  );
  const [resolutionSLAPercByPriority, setResolutionSLAPercByPriority] =
    useState([]);
  const [resolutionSLANumByTeam, setResolutionSLANumByTeam] = useState([]);
  const [resolutionSLAPercByTeam, setResolutionSLAPercByTeam] = useState([]);
  const [resolutionSLANumByProject, setResolutionSLANumByProject] = useState(
    []
  );
  const [resolutionSLAPercByProject, setResolutionSLAPercByProject] = useState(
    []
  );
  const [slaStatusByTeam, setSlaStatusByTeam] = useState([]);
  const [slaStatusByTeamPercent, setSlaStatusByTeamPercent] = useState([]);
  const [slaStatusByProject, setSlaStatusByProject] = useState([]);
  const [slaStatusByProjectPercent, setSlaStatusByProjectPercent] = useState(
    []
  );
const [teamsByCategory, setTeamsByCategory] = useState({});

  useEffect(() => {
    if (tickets) {

      const teamsByCategory = {};

tickets.forEach(ticket => {
  const catValue = ticket.priority; // sau orice categoryKey folosești
  if (!teamsByCategory[catValue]) teamsByCategory[catValue] = new Set();
  if (ticket.team_assigned_person) teamsByCategory[catValue].add(ticket.team_assigned_person);
});

// Convertim set-urile în array-uri
const teamsByCategoryMap = {};
for (const key in teamsByCategory) {
  teamsByCategoryMap[key] = Array.from(teamsByCategory[key]);
}

setTeamsByCategory(teamsByCategoryMap);
      // Basic ticket counts
      const ticketsNumByPriority = countByPriority(tickets);
      const percByPriority = getPercentsFromCounted(
        ticketsNumByPriority,
        totalCount
      );

      // SLA resolution counts
      const ticketsResolutionSLANumByPriority = countByPriority(tickets, true);
      const ticketsResolutionSLAPercByPriority = getPercentsFromCounted(
        ticketsResolutionSLANumByPriority,
        totalCount
      );
      const ticketsResolutionSLANumByTeam = countByTeamAssigned(tickets, true);
      const ticketsResolutionSLAPercByTeam = getPercentsFromCounted(
        ticketsResolutionSLANumByTeam,
        totalCount,
        "team"
      );
      const ticketsResolutionSLANumByProject = countByProject(tickets, true);
      const ticketsResolutionSLAPercByProject = getPercentsFromCounted(
        ticketsResolutionSLANumByProject,
        totalCount,
        "project"
      );

      // SLA compliance data
      const teamSlaStatus = calculateSlaStatus(tickets, "team_assigned_person");
      const teamSlaStatusPercent = convertSlaStatusToPercentages(teamSlaStatus);
      const projectSlaStatus = calculateSlaStatus(tickets, "project");
      const projectSlaStatusPercent =
        convertSlaStatusToPercentages(projectSlaStatus);

      // Setting state after inspection
      setNumByPriority(ticketsNumByPriority);
      setPercByPriority(percByPriority);
      setResolutionSLANumByPriority(ticketsResolutionSLANumByPriority);
      setResolutionSLAPercByPriority(ticketsResolutionSLAPercByPriority);
      setResolutionSLANumByTeam(ticketsResolutionSLANumByTeam);
      setResolutionSLAPercByTeam(ticketsResolutionSLAPercByTeam);
      setResolutionSLANumByProject(ticketsResolutionSLANumByProject);
      setResolutionSLAPercByProject(ticketsResolutionSLAPercByProject);
      setSlaStatusByTeam(teamSlaStatus);
      setSlaStatusByTeamPercent(teamSlaStatusPercent);
      setSlaStatusByProject(projectSlaStatus);
      setSlaStatusByProjectPercent(projectSlaStatusPercent);
    }
  }, [tickets, totalCount]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-black dark:text-white">Bar charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          // Basic ticket metrics
          <CustomBarChart
  key="num-priority"
  title="Ticket number by priority"
  data={numByPriority}
  dataKey="count"
  categoryKey="priority"
  teamsByCategory={teamsByCategory}
/>
,
         <CustomBarChart
  key="perc-priority"
  title="Ticket % by priority"
  data={percByPriority}
  dataKey="perc"
  perc={true}
  categoryKey="priority"
  teamsByCategory={teamsByCategory}
/>
,

          // SLA resolution metrics
         <CustomBarChart
  key="sla-num-priority"
  title="Resolution SLA number by priority"
  data={resolutionSLANumByPriority}
  dataKey="count"
  categoryKey="priority"
  teamsByCategory={teamsByCategory}
/>
,
          <CustomBarChart
  key="sla-perc-priority"
  title="Resolution SLA % by priority"
  data={resolutionSLAPercByPriority}
  dataKey="perc"
  categoryKey="priority"
  perc={true}
  teamsByCategory={teamsByCategory}
/>
,
         <CustomBarChart
  key="sla-num-team"
  title="Resolution SLA number by team"
  data={resolutionSLANumByTeam}
  dataKey="count"
  categoryKey="team"
  teamsByCategory={teamsByCategory}
  slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
/>
,
          <CustomBarChart
  key="sla-perc-team"
  title="Resolution SLA % by team"
  data={resolutionSLAPercByTeam}
  dataKey="perc"
  categoryKey="team"
  perc={true}
  teamsByCategory={teamsByCategory}
  slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
/>
,
          <CustomBarChart
  key="sla-num-project"
  title="Resolution SLA number by project"
  data={resolutionSLANumByProject}
  dataKey="count"
  categoryKey="project"
  teamsByCategory={teamsByCategory}
  slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
/>
,
          <CustomBarChart
  key="sla-perc-project"
  title="Resolution SLA % by project"
  data={resolutionSLAPercByProject}
  dataKey="perc"
  categoryKey="project"
  perc={true}
  teamsByCategory={teamsByCategory}
  slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
/>
,

          // SLA Met vs Exceeded charts
          <CustomBarChart
  key="sla-team-count"
  title="SLA Compliance by Team (Count)"
  data={slaStatusByTeam}
  dataKey={["Met", "Exceeded"]}
  categoryKey="name" // <-- e numele echipei
  stacked={true}
  colors={["#4CAF50", "#F44336"]}
  teamsByCategory={teamsByCategory}
  slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
/>
,
        
         <CustomBarChart
  key="sla-project-count"
  title="SLA Compliance by Project (Count)"
  data={slaStatusByProject}
  dataKey={["Met", "Exceeded"]}
  categoryKey="name" // <-- e numele proiectului
  stacked={true}
  colors={["#4CAF50", "#F44336"]}
  teamsByCategory={teamsByCategory}
  slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
/>
,
          
        ]}
      />
    </>
  );
}

export default BarChartSection;
