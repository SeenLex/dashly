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

  // 1. Normalizează datele din API în formatul folosit în React
  const normalizedTickets = tickets.map(ticket => ({
    priority: ticket.priority_name || "N/A",
    team_assigned_person: ticket.team_assigned_person_name || "Unassigned",
    project: ticket.project_name || "Unassigned",
    response_time: ticket.response_time, // poate fi null
    closed_date: ticket.closed_date,
    duration_hours: ticket.duration_hours || 0, // asigură-te că ai acest câmp din backend, altfel pune 0
    // Păstrează și celelalte câmpuri dacă e nevoie
    ...ticket,
  }));

  // 2. Calculează statusul de rezolvare SLA
  const ticketsWithResolution = normalizedTickets.map(ticket => {
    if (!ticket.closed_date) {
      return { ...ticket, resolution: "In Progress" };
    }

    // Dacă response_time este null, consideră SLA depășită (sau ajustează după logică)
    if (ticket.response_time == null) {
      return { ...ticket, resolution: "Exceeded" };
    }

    return {
      ...ticket,
      resolution:
        ticket.response_time <= ticket.duration_hours ? "Met" : "Exceeded",
    };
  });

  // 3. Grupează echipele pe categorii de prioritate
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

  // 4. Pregătirea datelor cu tickete incluse după prioritate
  const dataWithTicketsByPriority = prepareDataWithTicketsByCategory(
    ticketsWithResolution,
    "priority"
  );

  // 5. Pregătirea datelor după echipă, cu calcul SLA met/exceeded
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
      inProgressCount,
      slaPercentage,
    };
  });

  // 6. Pregătirea datelor după proiect
  const dataWithTicketsByProject = prepareDataWithTicketsByCategory(
    ticketsWithResolution,
    "project"
  );

  // 7. Calculează procentele pentru prioritate
  const percByPriority = countByPriority(ticketsWithResolution).map((item) => ({
    ...item,
    tickets:
      dataWithTicketsByPriority.find((p) => p.priority === item.priority)
        ?.tickets || [],
  }));

  // 8. Procente SLA rezolvare după prioritate
  const ticketsResolutionSLAPercByPriority = getPercentsFromCounted(
    countByPriority(ticketsWithResolution, true),
    totalCount
  ).map((item) => ({
    ...item,
    tickets:
      dataWithTicketsByPriority.find((p) => p.priority === item.priority)
        ?.tickets || [],
  }));

  // 9. Procente SLA rezolvare după echipă
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

  // 10. Procente SLA rezolvare după proiect
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

  // 11. SLA status pe echipă
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

  // 12. SLA status pe proiect
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

  // 13. Setează state-urile finale pentru grafice
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
           colors={["#4299e1"]}
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
