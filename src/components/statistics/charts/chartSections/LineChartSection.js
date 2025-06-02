import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function LineChartSection({ filters }) {
  const [startedClosedDateDataDaily, setStartedClosedDateDataDaily] = useState([]);
  const [startedClosedDateDataWeekly, setStartedClosedDateDataWeekly] = useState([]);
  const [startedClosedDateDataMonthly, setStartedClosedDateDataMonthly] = useState([]);

  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(filters);
    fetch(`http://localhost/api/linecharts/get_ticket_trend_daily.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStartedClosedDateDataDaily(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
    fetch(`http://localhost/api/linecharts/get_ticket_trend_weekly.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStartedClosedDateDataWeekly(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
    fetch(`http://localhost/api/linecharts/get_ticket_trend_monthly.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStartedClosedDateDataMonthly(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
    fetch(`http://localhost/api/linecharts/get_sla_performance_monthly.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setSlaOverallData(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
    fetch(`http://localhost/api/linecharts/get_team_names.php`)
      .then((res) => res.json())
      .then(async (team_names_data) => {
        const teamParams = new URLSearchParams(params);
        teamParams.delete("team_assigned_person_name");
        const teamDataPromises = team_names_data.map(teamName =>
          fetch(`http://localhost/api/linecharts/get_sla_performance_monthly.php?team_assigned_person_name=${encodeURIComponent(teamName)}&${teamParams.toString()}`)
            .then(res => res.json())
        )

        const results = await Promise.all(teamDataPromises);
        let slaDataByTeam = {};
        team_names_data.forEach((team, idx) => {
          if (results[idx].length > 0) {
            slaDataByTeam[team] = results[idx];
          }
        });
        setSlaTeamData(slaDataByTeam);
      })
      .catch((err) => console.error("Error:", err));
    fetch(`http://localhost/api/linecharts/get_project_names.php`)
      .then((res) => res.json())
      .then(async (project_names_data) => {
        const projectParams = new URLSearchParams(params);
        projectParams.delete("project");
        const projectNamePromises = project_names_data.map(projectName =>
          fetch(`http://localhost/api/linecharts/get_sla_performance_monthly.php?project=${encodeURIComponent(projectName)}&${projectParams.toString()}`)
            .then(res => res.json())
        )

        const results = await Promise.all(projectNamePromises);

        let slaDataByProject = {};
        project_names_data.forEach((project, idx) => {
          if (results[idx].length > 0) {
            slaDataByProject[project] = results[idx];
          }
        });
        setSlaProjectData(slaDataByProject);
      })
      .catch((err) => console.error("Error:", err));
  }, [filters]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-2xl font-bold text-black dark:text-white">Line charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomLineChart
            title={"Ticket Trend - Daily"}
            data={startedClosedDateDataDaily}
            tooltipLabelName="Day"
            dataKey={"startCount"}
            labelDataKey={"date"}
            labelName={"Started"}
            secondDataKey="closedCount"
            secondLabel={"Closed"}
            secondStroke="#b254ff"
          />,
          <CustomLineChart
            title={"Ticket Trend - Weekly"}
            data={startedClosedDateDataWeekly}
            tooltipLabelName="Week"
            dataKey={"startCount"}
            labelDataKey={"date"}
            labelName={"Started"}
            secondDataKey="closedCount"
            secondLabel={"Closed"}
            secondStroke="#b254ff"
          />,
          <CustomLineChart
            title={"Ticket Trend - Monthly"}
            data={startedClosedDateDataMonthly}
            tooltipLabelName="Month"
            dataKey={"startCount"}
            labelDataKey={"date"}
            labelName={"Started"}
            secondDataKey="closedCount"
            secondLabel={"Closed"}
            secondStroke="#b254ff"
          />,
          slaOverallData && slaOverallData.length > 0 ? (
            <CustomLineChart
              title={"Overall SLA Performance (Monthly)"}
              data={slaOverallData}
              tooltipLabelName="Month"
              labelName={"Met"}
              labelDataKey={"date"}
              dataKey="Met"
              secondDataKey="Exceeded"
              secondStroke="#b254ff"
              secondLabel="Exceeded"
            />
          ) : (
            <div>No Overall SLA Data</div>
          ),
          ...Object.entries(slaTeamData).map(([team, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={team}
                title={`Team: ${team} SLA Performance (Monthly)`}
                data={data}
                tooltipLabelName="Month"
                labelName={"Met"}
                labelDataKey={"date"}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#b254ff"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={team}>No {team} SLA Data</div>
            )
          ),
          ...Object.entries(slaProjectData).map(([project, data]) =>
            data && data.length > 0 ? (
              <CustomLineChart
                key={project}
                title={`Project: ${project} SLA Performance (Monthly)`}
                data={data}
                tooltipLabelName="Month"
                labelName={"Met"}
                dataKey="Met"
                labelDataKey={"date"}
                secondDataKey="Exceeded"
                secondStroke="#b254ff"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={project}>No {project} SLA Data</div>
            )
          ),
        ]}
      />
    </>
  );
}

export default LineChartSection;
