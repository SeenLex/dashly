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
  const [resolutionSLANumByPriority, setResolutionSLANumByPriority] = useState([]);
  const [resolutionSLAPercByPriority, setResolutionSLAPercByPriority] = useState([]);
  const [resolutionSLANumByTeam, setResolutionSLANumByTeam] = useState([]);
  const [resolutionSLAPercByTeam, setResolutionSLAPercByTeam] = useState([]);
  const [resolutionSLANumByProject, setResolutionSLANumByProject] = useState([]);
  const [resolutionSLAPercByProject, setResolutionSLAPercByProject] = useState([]);
  const [slaStatusByTeam, setSlaStatusByTeam] = useState([]);
  const [slaStatusByTeamPercent, setSlaStatusByTeamPercent] = useState([]);
  const [slaStatusByProject, setSlaStatusByProject] = useState([]);
  const [slaStatusByProjectPercent, setSlaStatusByProjectPercent] = useState([]);
  const [teamsByCategory, setTeamsByCategory] = useState({});

  // Funcție generică care grupează ticket-urile după orice categorie
  function prepareDataWithTicketsByCategory(tickets, categoryKey) {
    const grouped = {};

    tickets.forEach((ticket) => {
      const categoryValue = ticket[categoryKey] || "N/A";
      if (!grouped[categoryValue])
        grouped[categoryValue] = { [categoryKey]: categoryValue, count: 0, tickets: [] };
      grouped[categoryValue].count += 1;
      grouped[categoryValue].tickets.push(ticket);
    });

    return Object.values(grouped);
  }

//   useEffect(() => {
//     if (!tickets) return;

//     // Setare teamsByCategory: echipele active pe fiecare prioritate
//     const teamsByCategoryTemp = {};
//     tickets.forEach((ticket) => {
//       const catValue = ticket.priority || "N/A";
//       if (!teamsByCategoryTemp[catValue]) teamsByCategoryTemp[catValue] = new Set();
//       if (ticket.team_assigned_person) teamsByCategoryTemp[catValue].add(ticket.team_assigned_person);
//     });
//     const teamsByCategoryMap = {};
//     for (const key in teamsByCategoryTemp) {
//       teamsByCategoryMap[key] = Array.from(teamsByCategoryTemp[key]);
//     }
//     setTeamsByCategory(teamsByCategoryMap);

//     // Date brute pentru priority (count & percent)
   


//     const percByPriority = countByPriority(tickets);

//     // SLA resolution counts
//     const ticketsResolutionSLANumByPriority = countByPriority(tickets, true);
//     const ticketsResolutionSLAPercByPriority = getPercentsFromCounted(
//       ticketsResolutionSLANumByPriority,
//       totalCount
//     );
//     const ticketsResolutionSLANumByTeam = countByTeamAssigned(tickets, true);
//     const ticketsResolutionSLAPercByTeam = getPercentsFromCounted(
//       ticketsResolutionSLANumByTeam,
//       totalCount,
//       "team"
//     );
//     const ticketsResolutionSLANumByProject = countByProject(tickets, true);
//     const ticketsResolutionSLAPercByProject = getPercentsFromCounted(
//       ticketsResolutionSLANumByProject,
//       totalCount,
//       "project"
//     );

//     // SLA compliance
//     const teamSlaStatus = calculateSlaStatus(tickets, "team_assigned_person");
//     const teamSlaStatusPercent = convertSlaStatusToPercentages(teamSlaStatus);
//     const projectSlaStatus = calculateSlaStatus(tickets, "project");
//     const projectSlaStatusPercent = convertSlaStatusToPercentages(projectSlaStatus);

//     // Gruparea cu lista de ticket-uri pentru tooltip pe fiecare categorie
//     const dataWithTicketsByTeam = prepareDataWithTicketsByCategory(tickets, "team_assigned_person");
//     const dataWithTicketsByProject = prepareDataWithTicketsByCategory(tickets, "project");
//     const dataWithTicketsByPriority = prepareDataWithTicketsByCategory(tickets, "priority");

//     // Setare state final
//     setNumByPriority(dataWithTicketsByPriority);
//   setPercByPriority(
//   percByPriority.map(item => {
//     const matchingTickets = numByPriority.find(p => p.priority === item.priority)?.tickets || [];
//     return { ...item, tickets: matchingTickets };
//   })
// );

//     // setResolutionSLANumByPriority(ticketsResolutionSLANumByPriority);
//   setResolutionSLAPercByPriority(
//   ticketsResolutionSLAPercByPriority.map(item => {
//     const matchingTickets = resolutionSLANumByPriority.find(p => p.priority === item.priority)?.tickets || [];
//     return { ...item, tickets: matchingTickets };
//   })
// );

//  setResolutionSLAPercByTeam(
//   ticketsResolutionSLAPercByTeam.map(item => {
//     const matchingTickets = resolutionSLANumByTeam.find(t => t.team_assigned_person === item.team)?.tickets || [];
//     return { ...item, tickets: matchingTickets, team_assigned_person: item.team };
//   })
// );
//     // setResolutionSLANumByProject(ticketsResolutionSLANumByProject);
//    setResolutionSLAPercByProject(
//   ticketsResolutionSLAPercByProject.map(item => {
//     const matchingTickets = resolutionSLANumByProject.find(p => p.project === item.project)?.tickets || [];
//     return { ...item, tickets: matchingTickets };
//   })
// );
//     setSlaStatusByTeam(teamSlaStatus);
//     setSlaStatusByTeamPercent(teamSlaStatusPercent);
//     setSlaStatusByProject(projectSlaStatus);
//     setSlaStatusByProjectPercent(projectSlaStatusPercent);
// setResolutionSLANumByTeam(dataWithTicketsByTeam);

//     setResolutionSLANumByProject(dataWithTicketsByProject);
//     setResolutionSLANumByPriority(dataWithTicketsByPriority);
//   }, [tickets, totalCount]);
useEffect(() => {
  if (!tickets) return;

  // 1. Gruparea echipelor pe categorii de prioritate
  const teamsByCategoryTemp = {};
  tickets.forEach((ticket) => {
    const catValue = ticket.priority || "N/A";
    if (!teamsByCategoryTemp[catValue]) teamsByCategoryTemp[catValue] = new Set();
    if (ticket.team_assigned_person) teamsByCategoryTemp[catValue].add(ticket.team_assigned_person);
  });
  
  const teamsByCategoryMap = {};
  for (const key in teamsByCategoryTemp) {
    teamsByCategoryMap[key] = Array.from(teamsByCategoryTemp[key]);
  }
  setTeamsByCategory(teamsByCategoryMap);

  // 2. Pregătirea datelor cu tickete incluse
  const dataWithTicketsByPriority = prepareDataWithTicketsByCategory(tickets, "priority");
  const dataWithTicketsByTeam = prepareDataWithTicketsByCategory(tickets, "team_assigned_person");
  const dataWithTicketsByProject = prepareDataWithTicketsByCategory(tickets, "project");

  // 3. Date pentru prioritate (număr și procente)
  const percByPriority = countByPriority(tickets).map(item => ({
    ...item,
    tickets: dataWithTicketsByPriority.find(p => p.priority === item.priority)?.tickets || []
  }));

  // 4. Date pentru SLA resolution
  const ticketsResolutionSLAPercByPriority = getPercentsFromCounted(
    countByPriority(tickets, true),
    totalCount
  ).map(item => ({
    ...item,
    tickets: dataWithTicketsByPriority.find(p => p.priority === item.priority)?.tickets || []
  }));

  const ticketsResolutionSLAPercByTeam = getPercentsFromCounted(
    countByTeamAssigned(tickets, true),
    totalCount,
    "team"
  ).map(item => ({
    ...item,
    team_assigned_person: item.team,
    tickets: dataWithTicketsByTeam.find(t => t.team_assigned_person === item.team)?.tickets || []
  }));

  const ticketsResolutionSLAPercByProject = getPercentsFromCounted(
    countByProject(tickets, true),
    totalCount,
    "project"
  ).map(item => ({
    ...item,
    tickets: dataWithTicketsByProject.find(p => p.project === item.project)?.tickets || []
  }));

  // 5. Date pentru SLA status (Met/Exceeded)
  const teamSlaStatus = calculateSlaStatus(tickets, "team_assigned_person").map(item => ({
    ...item,
    tickets: tickets.filter(t => t.team_assigned_person === item.name)
  }));

  const projectSlaStatus = calculateSlaStatus(tickets, "project").map(item => ({
    ...item,
    tickets: tickets.filter(t => t.project === item.name)
  }));

  // 6. Setarea tuturor statelor
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
            key="num-priority"
            title="Ticket number by priority"
            data={numByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
          />,
          <CustomBarChart
            key="perc-priority"
            title="Ticket % by priority"
            data={percByPriority}
            dataKey="perc"
            perc={true}
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
          />,

          // SLA resolution metrics
          <CustomBarChart
            key="sla-num-priority"
            title="Resolution SLA number by priority"
            data={resolutionSLANumByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
          />,
          <CustomBarChart
            key="sla-perc-priority"
            title="Resolution SLA % by priority"
            data={resolutionSLAPercByPriority}
            dataKey="perc"
            categoryKey="priority"
            perc={true}
            teamsByCategory={teamsByCategory}
          />,
          <CustomBarChart
            key="sla-num-team"
            title="Resolution SLA number by team"
            data={resolutionSLANumByTeam}
            dataKey="count"
            categoryKey="team_assigned_person"
            teamsByCategory={teamsByCategory}
            slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
          />,
          <CustomBarChart
            key="sla-perc-team"
            title="Resolution SLA % by team"
            data={resolutionSLAPercByTeam}
            dataKey="perc"
            categoryKey="team_assigned_person"
            perc={true}
            teamsByCategory={teamsByCategory}
            slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
          />,
          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA number by project"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
            teamsByCategory={teamsByCategory}
            slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          />,
          <CustomBarChart
            key="sla-perc-project"
            title="Resolution SLA % by project"
            data={resolutionSLAPercByProject}
            dataKey="perc"
            categoryKey="project"
            perc={true}
            teamsByCategory={teamsByCategory}
            slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          />,

          // SLA Met vs Exceeded charts
          <CustomBarChart
            key="sla-team-count"
            title="SLA Compliance by Team (Count)"
            data={slaStatusByTeam}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name" // <-- numele echipei
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
            teamsByCategory={teamsByCategory}
            slaStatusByTeam={slaStatusByTeam} // ✅ OBLIGATORIU
          />,
          <CustomBarChart
            key="sla-project-count"
            title="SLA Compliance by Project (Count)"
            data={slaStatusByProject}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name" // <-- numele proiectului
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
            teamsByCategory={teamsByCategory}
            slaStatusByProject={slaStatusByProject} // ✅ OBLIGATORIU
          />,
        ]}
      />
    </>
  );
}

export default BarChartSection;
