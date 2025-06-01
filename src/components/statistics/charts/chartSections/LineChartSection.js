import { useEffect, useState } from "react";
import {
  countByStartedClosedDateDaily,
  countByStartedClosedDateWeekly,
  countByStartedClosedDateMonthly,
  countSLAOverTime,
} from "../../helpers/fct.js";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { normalizeTickets } from "../../helpers/fct.js";

function LineChartSection({ tickets }) {
  const [startedClosedDateDataDaily, setStartedClosedDateDataDaily] = useState([]);
  const [startedClosedDateDataWeekly, setStartedClosedDateDataWeekly] = useState([]);
  const [startedClosedDateDataMonthly, setStartedClosedDateDataMonthly] = useState([]);

  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});
  const [normalizedTickets, setNormalizedTickets] = useState([])

  useEffect(() => {
    const normalizedTickets = normalizeTickets(tickets)
    setNormalizedTickets(normalizedTickets)
  }, [tickets])

  useEffect(() => {
    if (normalizedTickets) {
      const countedByStartedClosedDateDailyData = countByStartedClosedDateDaily(normalizedTickets);
      const countedByStartedClosedDateWeeklyData = countByStartedClosedDateWeekly(normalizedTickets);
      const countedByStartedClosedDateMonthlyData =
        countByStartedClosedDateMonthly(normalizedTickets);

      setStartedClosedDateDataDaily(countedByStartedClosedDateDailyData);
      setStartedClosedDateDataWeekly(countedByStartedClosedDateWeeklyData);
      setStartedClosedDateDataMonthly(countedByStartedClosedDateMonthlyData);

      const overallSLAData = countSLAOverTime(normalizedTickets, "monthly");
      setSlaOverallData(overallSLAData);

      const teams = [
        ...new Set(normalizedTickets.map((t) => t.team_assigned_person).filter(Boolean)),
      ];
      const teamData = {};
      teams.forEach((team) => {
        const teamSLAData = countSLAOverTime(
          normalizedTickets,
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
          normalizedTickets,
          "monthly",
          "project",
          project
        );
        projectData[project] = projectSLAData;
      });
      setSlaProjectData(projectData);
    }
  }, [normalizedTickets]);

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
