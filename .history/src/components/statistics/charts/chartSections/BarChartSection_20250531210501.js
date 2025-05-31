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
    if (ticket.response_time == null) {
      return { ...ticket, resolution: "Exceeded" };
    }
    // response_time și duration_hours sunt în ore; comparația directă
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
    const exceededCount = team.tickets.filter(
      (t) => t.resolution === "Exceeded"
    ).length;
    const slaPercentage =
      team.tickets.length > 0
        ? Math.round((metCount / team.tickets.length) * 100)
        : 0;

    return {
      ...team,
      metCount,
      exceededCount,
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
  const teamSlaStatus = calculateSlaStatus(
    ticketsWithResolution,
    "team_assigned_person"
  ).map((item) => ({
    ...item,
    tickets: ticketsWithResolution.filter(
      (t) => t.team_assigned_person === item.name
    ),
  }));

  const projectSlaStatus = calculateSlaStatus(
    ticketsWithResolution,
    "project"
  ).map((item) => ({
    ...item,
    tickets: ticketsWithResolution.filter((t) => t.project === item.name),
  }));

  // 7. Setarea tuturor statelor
  setNumByPriority(dataWithTicketsByPriority);
  setPercByPriority(percByPriority);
  setResolutionSLANumByPriority(dataWithTicketsByPriority);
  setResolutionSLAPercByPriority(ticketsResolutionSLAPercByPriority);
  setResolutionSLANumByTeam(dataWithTicketsByTeam);
  setResolutionSLAPercByTeam(ticketsResolutionSLAPercByTeam);
  setResolutionSLANumByProject(dataWithTicketsByProject);
  setResolutionSLAPercByProject(ticketsResolutionSLAPercByProject);
  setSlaStatusByTeam(teamSlaStatus);
  setSlaStatusByProject(projectSlaStatus);
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
            key="num-perc-priority"
            title="Tickets by priority (count and %)"
            data={numByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
          />,

          // SLA resolution metrics
          <CustomBarChart
            key="sla-num-perc-priority"
            title="Resolution SLA by priority (count and %)"
            data={resolutionSLANumByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
          />,
          <CustomBarChart
            key="sla-num-perc-team"
            title="Resolution SLA by team"
            data={resolutionSLANumByTeam}
            dataKey="count"
            categoryKey="team_assigned_person"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
            slaStatusByTeam={slaStatusByTeam}
          />,
          
          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA number by project"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
            showBothValues={true}
            teamsByCategory={teamsByCategory}
            slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          />,
          // <CustomBarChart
          //   key="sla-perc-project"
          //   title="Resolution SLA % by project"
          //   data={resolutionSLAPercByProject}
          //   dataKey="perc"
          //   categoryKey="project"
          //   perc={true}
          //   teamsByCategory={teamsByCategory}
          //   slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          // />,

          // // SLA Met vs Exceeded charts
          // <CustomBarChart
          //   key="sla-team-count"
          //   title="SLA Compliance by Team (Count)"
          //   data={slaStatusByTeam}
          //   dataKey={["Met", "Exceeded"]}
          //   categoryKey="name" // <-- numele echipei
          //   stacked={true}
          //   colors={["#4CAF50", "#F44336"]}
          //   teamsByCategory={teamsByCategory}
          //   slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
          // />,
          // <CustomBarChart
          //   key="sla-project-count"
          //   title="SLA Compliance by Project (Count)"
          //   data={slaStatusByProject}
          //   dataKey={["Met", "Exceeded"]}
          //   categoryKey="name" // <-- numele proiectului
          //   stacked={true}
          //   colors={["#4CAF50", "#F44336"]}
          //   teamsByCategory={teamsByCategory}
          //   slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          // />,
        ]}
      />
    </>
  );
}

export default BarChartSection;
