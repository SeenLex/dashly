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
  // State-uri pentru datele grupate și procente
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

  // Funcție generică care grupează ticket-urile după orice categorie
  function prepareDataWithTicketsByCategory(tickets, categoryKey) {
    const grouped = {};

    tickets.forEach((ticket) => {
      const categoryValue = ticket[categoryKey] || "N/A";
      if (!grouped[categoryValue])
        grouped[categoryValue] = {
          [categoryKey]: categoryValue,
          count: 0,
          tickets: [],
        };
      grouped[categoryValue].count += 1;
      grouped[categoryValue].tickets.push(ticket);
    });

    return Object.values(grouped);
  }

useEffect(() => {
  if (!tickets) return;

  // 1. Calculează resolution (Met sau Exceeded)
const ticketsWithResolution = tickets.map((ticket) => {
    if (!ticket.closed_date) {
      return { ...ticket, resolution: "In Progress" };
    }
    return {
      ...ticket,
      resolution:
        ticket.response_time <= ticket.duration_hours ? "Met" : "Exceeded",
    };
  });

  // 2. Gruparea echipelor pe categorii de prioritate
  const teamsByCategoryTemp = {};
  ticketsWithResolution.forEach((ticket) => {
    const catValue = ticket.priority || "N/A";
    if (!teamsByCategoryTemp[catValue]) teamsByCategoryTemp[catValue] = new Set();
    if (ticket.team_assigned_person)
      teamsByCategoryTemp[catValue].add(ticket.team_assigned_person);
  });

  const teamsByCategoryMap = {};
  for (const key in teamsByCategoryTemp) {
    teamsByCategoryMap[key] = Array.from(teamsByCategoryTemp[key]);
  }
  setTeamsByCategory(teamsByCategoryMap);

  // 3. Pregătirea datelor cu tickete incluse
  const dataWithTicketsByPriority = prepareDataWithTicketsByCategory(
    ticketsWithResolution,
    "priority"
  );


const dataWithTicketsByTeam = prepareDataWithTicketsByCategory(
  ticketsWithResolution,
  "team_assigned_person"
).map((team) => {
  const metCount = team.tickets.filter((t) => t.resolution === "Met").length;
  const exceededCount = team.tickets.filter((t) => t.resolution === "Exceeded").length;
  const inProgressCount = team.tickets.filter((t) => t.resolution === "In Progress").length;
  const totalRelevant = metCount + exceededCount;

  const slaPercentage = totalRelevant > 0 ? Math.round((metCount / totalRelevant) * 100) : 0;

  return {
    ...team,
    metCount,
    exceededCount,
    inProgressCount, // ➕ adăugat pentru vizualizare
    slaPercentage,
  };
});


  const dataWithTicketsByProject = prepareDataWithTicketsByCategory(
    ticketsWithResolution,
    "project"
  );

  // 4. Date pentru prioritate (număr și procente)
  const percByPriority = countByPriority(ticketsWithResolution).map((item) => ({
    ...item,
    tickets:
      dataWithTicketsByPriority.find((p) => p.priority === item.priority)
        ?.tickets || [],
  }));

  // 5. Date pentru SLA resolution
  const ticketsResolutionSLAPercByPriority = getPercentsFromCounted(
    countByPriority(ticketsWithResolution, true),
    totalCount
  ).map((item) => ({
    ...item,
    tickets:
      dataWithTicketsByPriority.find((p) => p.priority === item.priority)
        ?.tickets || [],
  }));

  const ticketsResolutionSLAPercByTeam = getPercentsFromCounted(
    countByTeamAssigned(ticketsWithResolution, true),
    totalCount,
    "team"
  ).map((item) => ({
    ...item,
    team_assigned_person: item.team,
    tickets:
      dataWithTicketsByTeam.find((t) => t.team_assigned_person === item.team)
        ?.tickets || [],
  }));

  const ticketsResolutionSLAPercByProject = getPercentsFromCounted(
    countByProject(ticketsWithResolution, true),
    totalCount,
    "project"
  ).map((item) => ({
    ...item,
    tickets:
      dataWithTicketsByProject.find((p) => p.project === item.project)
        ?.tickets || [],
  }));

  // 6. Date pentru SLA status (Met/Exceeded)
 const teamSlaStatus = ticketsWithResolution.reduce((acc, ticket) => {
    const team = ticket.team_assigned_person || "Unassigned";
    if (!acc[team]) {
      acc[team] = {
        name: team,
        Met: 0,
        "In Progress": 0,
        Exceeded: 0,
        tickets: []
      };
    }
    acc[team][ticket.resolution]++;
    acc[team].tickets.push(ticket);
    return acc;
  }, {});

  setSlaStatusByTeam(Object.values(teamSlaStatus));
 const projectSlaStatus = ticketsWithResolution.reduce((acc, ticket) => {
    const project = ticket.project || "Unassigned";
    if (!acc[project]) {
      acc[project] = {
        name: project,
        Met: 0,
        "In Progress": 0,
        Exceeded: 0,
        tickets: []
      };
    }
    acc[project][ticket.resolution]++;
    acc[project].tickets.push(ticket);
    return acc;
  }, {});

  setSlaStatusByProject(Object.values(projectSlaStatus));
  // 7. Setarea tuturor statelor
  setNumByPriority(dataWithTicketsByPriority);
  setPercByPriority(percByPriority);
  setResolutionSLANumByPriority(dataWithTicketsByPriority);
  setResolutionSLAPercByPriority(ticketsResolutionSLAPercByPriority);
  setResolutionSLANumByTeam(dataWithTicketsByTeam);
  setResolutionSLAPercByTeam(ticketsResolutionSLAPercByTeam);
  setResolutionSLANumByProject(dataWithTicketsByProject);
  setResolutionSLAPercByProject(ticketsResolutionSLAPercByProject);

 
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
          showBothValues={true}
          totalCount={totalCount}
          colors={["#4299e1"]}
        />,

        // SLA resolution metrics
        <CustomBarChart
          key="sla-num-priority"
          title="Resolution SLA by priority"
          data={resolutionSLANumByPriority}
          dataKey="count"
          categoryKey="priority"
          teamsByCategory={teamsByCategory}
          showBothValues={true}
          totalCount={totalCount}
          colors={["#4299e1"]}
        />,

        <CustomBarChart
          key="sla-num-team"
          title="Resolution SLA by team"
          data={resolutionSLANumByTeam}
          dataKey="count"
          categoryKey="team_assigned_person"
          teamsByCategory={teamsByCategory}
          showBothValues={true}
          totalCount={totalCount}
          colors={["#4299e1"]}
          slaStatusByTeam={slaStatusByTeam}
        />,

        <CustomBarChart
          key="sla-num-project"
          title="Resolution SLA by project"
          data={resolutionSLANumByProject}
          dataKey="count"
          categoryKey="project"
          teamsByCategory={teamsByCategory}
          showBothValues={true}
          totalCount={totalCount}
          colors={["#f56565"]}
          slaStatusByProject={slaStatusByProject}
        />,

        // SLA Compliance charts
        <CustomBarChart
          key="sla-team-count"
          title="SLA Compliance by Team"
          data={slaStatusByTeam}
          dataKey={["Met", "In Progress", "Exceeded"]}
          categoryKey="name"
          stacked={true}
          teamsByCategory={teamsByCategory}
          slaStatusByTeam={slaStatusByTeam}
        />,
        
        <CustomBarChart
          key="sla-project-count"
          title="SLA Compliance by Project"
          data={slaStatusByProject}
          dataKey={["Met", "In Progress", "Exceeded"]}
          categoryKey="name"
          stacked={true}
          teamsByCategory={teamsByCategory}
          slaStatusByProject={slaStatusByProject}
        />,
      ]}
    />
  </>
);
}

export default BarChartSection;
