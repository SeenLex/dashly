import { useEffect, useState } from "react";
import {
  countByCreatedDateDaily,
  countByCreatedDateWeekly,
  countByCreatedDateMonthly,
  countSLAOverTime,
} from "../../helpers/fct.js";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function LineChartSection({ filters }) {
  const [tickets, setTickets] = useState([]);
  const [createdDateDataDaily, setCreatedDateDataDaily] = useState([]);
  const [createdDateDataWeekly, setCreatedDateDataWeekly] = useState([]);
  const [createdDateDataMonthly, setCreatedDateDataMonthly] = useState([]);

  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

  // Fetch tickets filtered by filters (similar to BarChartSection's API call)
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams();

        if (filters.team_assigned_person) params.append("team_assigned_person", filters.team_assigned_person);
        if (filters.team_created_by) params.append("team_created_by", filters.team_created_by);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.project) params.append("project", filters.project);
        if (filters.status) params.append("status", filters.status);
        if (filters.startDate) params.append("dateFrom", filters.startDate);
        if (filters.endDate) params.append("dateTo", filters.endDate);
        if (filters.search) params.append("search", filters.search);

        // Fetch all tickets matching filters
        const res = await fetch(`http://localhost/api/tickets.php?${params.toString()}`);
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      }
    };

    fetchTickets();
  }, [filters]);

  // Update chart data based on fetched tickets
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      const countedByCreatedDateDailyData = countByCreatedDateDaily(tickets);
      const countedByCreatedDateWeeklyData = countByCreatedDateWeekly(tickets);
      const countedByCreatedDateMonthlyData = countByCreatedDateMonthly(tickets);

      setCreatedDateDataDaily(countedByCreatedDateDailyData);
      setCreatedDateDataWeekly(countedByCreatedDateWeeklyData);
      setCreatedDateDataMonthly(countedByCreatedDateMonthlyData);

      const overallSLAData = countSLAOverTime(tickets, "monthly");
      setSlaOverallData(overallSLAData);

      const teams = [...new Set(tickets.map((t) => t.team_assigned_person).filter(Boolean))];
      const teamData = {};
      teams.forEach((team) => {
        const teamSLAData = countSLAOverTime(tickets, "monthly", "team_assigned_person", team);
        teamData[team] = teamSLAData;
      });
      setSlaTeamData(teamData);

      const projects = [...new Set(tickets.map((t) => t.project).filter(Boolean))];
      const projectData = {};
      projects.forEach((project) => {
        const projectSLAData = countSLAOverTime(tickets, "monthly", "project", project);
        projectData[project] = projectSLAData;
      });
      setSlaProjectData(projectData);
    } else {
      // Reset if no tickets
      setCreatedDateDataDaily([]);
      setCreatedDateDataWeekly([]);
      setCreatedDateDataMonthly([]);
      setSlaOverallData([]);
      setSlaTeamData({});
      setSlaProjectData({});
    }
  }, [tickets]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Line charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomLineChart
            key="daily"
            title={"Ticket Creation Trend - Daily"}
            data={createdDateDataDaily}
            dataKey={"count"}
            labelName={"Day: "}
          />,
          <CustomLineChart
            key="weekly"
            title={"Ticket Creation Trend - Weekly"}
            data={createdDateDataWeekly}
            dataKey={"count"}
            labelName={"Week: "}
          />,
          <CustomLineChart
            key="monthly"
            title={"Ticket Creation Trend - Monthly"}
            data={createdDateDataMonthly}
            dataKey={"count"}
            labelName={"Month: "}
          />,
          slaOverallData && slaOverallData.length > 0 ? (
            <CustomLineChart
              key="overall-sla"
              title={"Overall SLA Performance (Monthly)"}
              data={slaOverallData}
              labelName={"Month: "}
              dataKey="Met"
              secondDataKey="Exceeded"
              secondStroke="#ffc658"
              secondLabel="Exceeded"
            />
          ) : (
            <div key="no-overall-sla">No Overall SLA Data</div>
          ),
          ...Object.entries(slaTeamData).map(([team, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={`team-${team}`}
                title={`Team: ${team} SLA Performance (Monthly)`}
                data={data}
                labelName={"Month: "}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`no-team-${team}`}>No {team} SLA Data</div>
            )
          ),
          ...Object.entries(slaProjectData).map(([project, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={`project-${project}`}
                title={`Project: ${project} SLA Performance (Monthly)`}
                data={data}
                labelName={"Month: "}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`no-project-${project}`}>No {project} SLA Data</div>
            )
          ),
        ]}
      />
    </>
  );
}

export default LineChartSection;
  