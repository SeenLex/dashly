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

function BarChartSection({ filters }) {
 useEffect(() => {
   
    const params = new URLSearchParams();

    if (filters.team_assigned_person) params.append("assigned_person", filters.team_assigned_person);
    if (filters.team_created_by) params.append("created_by", filters.team_created_by);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.project) params.append("project", filters.project);
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("dateFrom", filters.startDate);
    if (filters.endDate) params.append("dateTo", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    params.append("mode", "grouped");

    fetch(`http://localhost/api/tickets.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setPriorityData(data))
      .catch((err) => console.error("Error fetching grouped data:", err));
  }, [filters]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Bar charts</h1>
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
          />,
          <CustomBarChart
            key="perc-priority"
            title="Ticket % by priority"
            data={percByPriority}
            dataKey="perc"
            perc={true}
            categoryKey="priority"
          />,

          // SLA resolution metrics
          <CustomBarChart
            key="sla-num-priority"
            title="Resolution SLA number by priority"
            data={resolutionSLANumByPriority}
            dataKey="count"
            categoryKey="priority"
          />,
          <CustomBarChart
            key="sla-perc-priority"
            title="Resolution SLA % by priority"
            data={resolutionSLAPercByPriority}
            dataKey="perc"
            categoryKey="priority"
            perc={true}
          />,
          <CustomBarChart
            key="sla-num-team"
            title="Resolution SLA number by team"
            data={resolutionSLANumByTeam}
            dataKey="count"
            categoryKey="team"
          />,
          <CustomBarChart
            key="sla-perc-team"
            title="Resolution SLA % by team"
            data={resolutionSLAPercByTeam}
            dataKey="perc"
            categoryKey="team"
            perc={true}
          />,
          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA number by project"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
          />,
          <CustomBarChart
            key="sla-perc-project"
            title="Resolution SLA % by project"
            data={resolutionSLAPercByProject}
            dataKey="perc"
            categoryKey="project"
            perc={true}
          />,

          // SLA Met vs Exceeded charts
          <CustomBarChart
            key="sla-team-count"
            title="SLA Compliance by Team (Count)"
            data={slaStatusByTeam}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
          />,
        
          <CustomBarChart
            key="sla-project-count"
            title="SLA Compliance by Project (Count)"
            data={slaStatusByProject}
            dataKey={["Met", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            colors={["#4CAF50", "#F44336"]}
          />,
          
        ]}
      />
    </>
  );
}

export default BarChartSection;
