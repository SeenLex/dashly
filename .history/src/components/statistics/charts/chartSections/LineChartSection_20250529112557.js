import { useEffect, useState } from "react";
import {
  countByCreatedDateDaily,
  countByCreatedDateWeekly,
  countByCreatedDateMonthly,
  countSLAOverTime,
} from "../../helpers/fct.js";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
z
function LineChartSection({ tickets }) {
  const [createdDateDataDaily, setCreatedDateDataDaily] = useState([]);
  const [createdDateDataWeekly, setCreatedDateDataWeekly] = useState([]);
  const [createdDateDataMonthly, setCreatedDateDataMonthly] = useState([]);

  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

  useEffect(() => {
    if (tickets) {
      const countedByCreatedDateDailyData = countByCreatedDateDaily(tickets);
      const countedByCreatedDateWeeklyData = countByCreatedDateWeekly(tickets);
      const countedByCreatedDateMonthlyData =
        countByCreatedDateMonthly(tickets);

      setCreatedDateDataDaily(countedByCreatedDateDailyData);
      setCreatedDateDataWeekly(countedByCreatedDateWeeklyData);
      setCreatedDateDataMonthly(countedByCreatedDateMonthlyData);

      const overallSLAData = countSLAOverTime(tickets, "monthly");
      setSlaOverallData(overallSLAData);

      const teams = [
        ...new Set(tickets.map((t) => t.team_assigned_person).filter(Boolean)),
      ];
      const teamData = {};
      teams.forEach((team) => {
        const teamSLAData = countSLAOverTime(
          tickets,
          "monthly",
          "team_assigned_person",
          team
        );
        teamData[team] = teamSLAData;
      });
      setSlaTeamData(teamData);

      const projects = [
        ...new Set(tickets.map((t) => t.project).filter(Boolean)),
      ];
      const projectData = {};
      projects.forEach((project) => {
        const projectSLAData = countSLAOverTime(
          tickets,
          "monthly",
          "project",
          project
        );
        projectData[project] = projectSLAData;
      });
      setSlaProjectData(projectData);
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
            title={"Ticket Creation Trend - Daily"}
            data={createdDateDataDaily}
            dataKey={"count"}
            labelName={"Day: "}
          />,
          <CustomLineChart
            title={"Ticket Creation Trend - Weekly"}
            data={createdDateDataWeekly}
            dataKey={"count"}
            labelName={"Week: "}
          />,
          <CustomLineChart
            title={"Ticket Creation Trend - Monthly"}
            data={createdDateDataMonthly}
            dataKey={"count"}
            labelName={"Month: "}
          />,
          slaOverallData && slaOverallData.length > 0 ? (
            <CustomLineChart
              title={"Overall SLA Performance (Monthly)"}
              data={slaOverallData}
              labelName={"Month: "}
              dataKey="Met"
              secondDataKey="Exceeded"
              secondStroke="#ffc658"
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
                labelName={"Month: "}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
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
                labelName={"Month: "}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
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
