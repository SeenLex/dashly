import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function LineChartSection({ filters }) {
  const [dataDaily, setDataDaily] = useState([]);
  const [dataWeekly, setDataWeekly] = useState([]);
  const [dataMonthly, setDataMonthly] = useState([]);
  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

  // Fetch helper
  async function fetchData(aggregateType, extraParams = {}) {
    try {
      const query = new URLSearchParams({
        ...filters,
        aggregate: aggregateType,
        ...extraParams,
      }).toString();

      const response = await fetch(`/path/to/tickets.php?${query}`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  }

  useEffect(() => {
    async function loadData() {
      // Daily ticket counts
      const daily = await fetchData("created_date_daily");
      setDataDaily(daily);

      // Weekly ticket counts
      const weekly = await fetchData("created_date_weekly");
      setDataWeekly(weekly);

      // Monthly ticket counts
      const monthly = await fetchData("created_date_monthly");
      setDataMonthly(monthly);

      // SLA overall monthly
      const slaOverall = await fetchData("sla_overall_monthly");
      setSlaOverallData(slaOverall);

      // Fetch list of teams (unique) from backend or from filters?
      // Ideally backend endpoint or frontend prop with list of teams
      // Here, suppose we have it in filters.teamList (array of team names)
      if (filters.teamList && Array.isArray(filters.teamList)) {
        const teamPromises = filters.teamList.map(async (team) => {
          const data = await fetchData("sla_team_monthly", {
            groupBy: "team_assigned_person",
            groupValue: team,
          });
          return { team, data };
        });
        const teamResults = await Promise.all(teamPromises);
        const teamDataObj = {};
        teamResults.forEach(({ team, data }) => {
          teamDataObj[team] = data;
        });
        setSlaTeamData(teamDataObj);
      }

      // Same for projects
      if (filters.projectList && Array.isArray(filters.projectList)) {
        const projectPromises = filters.projectList.map(async (project) => {
          const data = await fetchData("sla_project_monthly", {
            groupBy: "project",
            groupValue: project,
          });
          return { project, data };
        });
        const projectResults = await Promise.all(projectPromises);
        const projectDataObj = {};
        projectResults.forEach(({ project, data }) => {
          projectDataObj[project] = data;
        });
        setSlaProjectData(projectDataObj);
      }
    }

    loadData();
  }, [filters]);

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
            data={dataDaily}
            dataKey={"count"}
            labelName={"Day: "}
          />,
          <CustomLineChart
            key="weekly"
            title={"Ticket Creation Trend - Weekly"}
            data={dataWeekly}
            dataKey={"count"}
            labelName={"Week: "}
          />,
          <CustomLineChart
            key="monthly"
            title={"Ticket Creation Trend - Monthly"}
            data={dataMonthly}
            dataKey={"count"}
            labelName={"Month: "}
          />,
          slaOverallData && slaOverallData.length > 0 ? (
            <CustomLineChart
              key="sla-overall"
              title={"Overall SLA Performance (Monthly)"}
              data={slaOverallData}
              labelName={"Month: "}
              dataKey="sla_met"
              secondDataKey="sla_exceeded"
              secondStroke="#ffc658"
              secondLabel="Exceeded"
            />
          ) : (
            <div key="sla-overall-empty">No Overall SLA Data</div>
          ),
          ...Object.entries(slaTeamData).map(([team, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={`sla-team-${team}`}
                title={`Team: ${team} SLA Performance (Monthly)`}
                data={data}
                labelName={"Month: "}
                dataKey="sla_met"
                secondDataKey="sla_exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`sla-team-empty-${team}`}>No {team} SLA Data</div>
            )
          ),
          ...Object.entries(slaProjectData).map(([project, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={`sla-project-${project}`}
                title={`Project: ${project} SLA Performance (Monthly)`}
                data={data}
                labelName={"Month: "}
                dataKey="sla_met"
                secondDataKey="sla_exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`sla-project-empty-${project}`}>No {project} SLA Data</div>
            )
          ),
        ]}
      />
    </>
  );
}

export default LineChartSection;
