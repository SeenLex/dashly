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
  const [projectsByCategory, setProjectsByCategory] = useState({});

  useEffect(() => {
    if (tickets) {
      // Create teamsByCategory map
      const teamsByCategoryMap = {};
      const projectsByCategoryMap = {};

      tickets.forEach(ticket => {
        // Teams by priority
        const priority = ticket.priority;
        if (!teamsByCategoryMap[priority]) teamsByCategoryMap[priority] = new Set();
        if (ticket.team_assigned_person) teamsByCategoryMap[priority].add(ticket.team_assigned_person);

        // Projects by priority
        if (!projectsByCategoryMap[priority]) projectsByCategoryMap[priority] = new Set();
        if (ticket.project) projectsByCategoryMap[priority].add(ticket.project);
      });

      // Convert sets to arrays
      const teamsByCategoryFinal = {};
      const projectsByCategoryFinal = {};
      
      for (const key in teamsByCategoryMap) {
        teamsByCategoryFinal[key] = Array.from(teamsByCategoryMap[key]);
      }
      
      for (const key in projectsByCategoryMap) {
        projectsByCategoryFinal[key] = Array.from(projectsByCategoryMap[key]);
      }

      setTeamsByCategory(teamsByCategoryFinal);
      setProjectsByCategory(projectsByCategoryFinal);

      // Rest of your existing useEffect code...
      const ticketsNumByPriority = countByPriority(tickets);
      const percByPriority = getPercentsFromCounted(ticketsNumByPriority, totalCount);
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
      const teamSlaStatus = calculateSlaStatus(tickets, "team_assigned_person");
      const teamSlaStatusPercent = convertSlaStatusToPercentages(teamSlaStatus);
      const projectSlaStatus = calculateSlaStatus(tickets, "project");
      const projectSlaStatusPercent = convertSlaStatusToPercentages(projectSlaStatus);

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
          <CustomBarChart
            key="num-priority"
            title="Ticket number by priority"
            data={numByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            projectsByCategory={projectsByCategory}
            tickets={tickets}
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
            categoryKey="team"
            teamsByCategory={teamsByCategory}
            projectsByCategory={projectsByCategory}
            slaStatusByTeam={slaStatusByTeam}
            tickets={tickets}
          />,
          
          <CustomBarChart
            key="sla-perc-team"
            title="Resolution SLA % by team"
            data={resolutionSLAPercByTeam}
            dataKey="perc"
            categoryKey="team"
            perc={true}
            teamsByCategory={teamsByCategory}
          />,
          
          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA number by project"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
            teamsByCategory={teamsByCategory}
            projectsByCategory={projectsByCategory}
            slaStatusByProject={slaStatusByProject}
            tickets={tickets}
          />,
          
          <CustomBarChart
            key="sla-perc-project"
            title="Resolution SLA % by project"
            data={resolutionSLAPercByProject}
            dataKey="perc"
            categoryKey="project"
            perc={true}
            teamsByCategory={teamsByCategory}
          />,

          <CustomBarChart
            key="sla-team-count"
            title="SLA Compliance by Team (Count)"
            data={slaStatusByTeam}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
            teamsByCategory={teamsByCategory}
          />,
        
          <CustomBarChart
            key="sla-project-count"
            title="SLA Compliance by Project (Count)"
            data={slaStatusByProject}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
            teamsByCategory={teamsByCategory}
          />,
        ]}
      />
    </>
  );
}

export default BarChartSection;