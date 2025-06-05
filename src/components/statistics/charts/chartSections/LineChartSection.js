import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { exportChartSectionToCSV, exportTicketsPerDayToCSV } from '../../exportCSV';

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
      .then(setStartedClosedDateDataDaily)
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/linecharts/get_ticket_trend_weekly.php?${params.toString()}`)
      .then((res) => res.json())
      .then(setStartedClosedDateDataWeekly)
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/linecharts/get_ticket_trend_monthly.php?${params.toString()}`)
      .then((res) => res.json())
      .then(setStartedClosedDateDataMonthly)
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/linecharts/get_sla_performance_monthly.php?${params.toString()}`)
      .then((res) => res.json())
      .then(setSlaOverallData)
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/linecharts/get_team_names.php`)
      .then((res) => res.json())
      .then(async (team_names_data) => {
        const teamParams = new URLSearchParams(params);
        teamParams.delete("team_assigned_person_name");
        const teamDataPromises = team_names_data.map((teamName) =>
          fetch(
            `http://localhost/api/linecharts/get_sla_performance_monthly.php?team_assigned_person_name=${encodeURIComponent(
              teamName
            )}&${teamParams.toString()}`
          ).then((res) => res.json())
        );

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
        const projectNamePromises = project_names_data.map((projectName) =>
          fetch(
            `http://localhost/api/linecharts/get_sla_performance_monthly.php?project=${encodeURIComponent(
              projectName
            )}&${projectParams.toString()}`
          ).then((res) => res.json())
        );

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

  // Export functions with pre-processing to fix CSV output
  const exportDailyTrend = () => {
    exportTicketsPerDayToCSV({
      title: "Trend_Tichete_Zilnic",
      data: startedClosedDateDataDaily,
    });
  };

  const exportWeeklyTrend = () => {
    exportTicketsPerDayToCSV({
      title: "Trend_Tichete_Saptamanal",
      data: startedClosedDateDataWeekly,
    });
  };

  const exportMonthlyTrend = () => {
    exportTicketsPerDayToCSV({
      title: "Trend_Tichete_Lunar",
      data: startedClosedDateDataMonthly,
    });
  };

  const exportSlaOverall = () => {
    if (!slaOverallData || slaOverallData.length === 0) return;

    const processedData = slaOverallData.map(({ date, Met, Exceeded }) => ({
      date,
      Met,
      Exceeded,
    }));

    exportChartSectionToCSV({
      title: "SLA_General_Lunar",
      data: processedData,
    });
  };

  const exportSlaTeam = (team) => {
    if (!slaTeamData[team] || slaTeamData[team].length === 0) return;

    const processedData = slaTeamData[team].map(({ date, Met, Exceeded }) => ({
      date,
      Met,
      Exceeded,
    }));

    exportChartSectionToCSV({
      title: `SLA_Per_Echipa_${team}`,
      data: processedData,
    });
  };

  const exportSlaProject = (project) => {
    if (!slaProjectData[project] || slaProjectData[project].length === 0) return;

    const processedData = slaProjectData[project].map(({ date, Met, Exceeded }) => ({
      date,
      Met,
      Exceeded,
    }));

    exportChartSectionToCSV({
      title: `SLA_Per_Proiect_${project}`,
      data: processedData,
    });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-2xl font-bold text-black dark:text-white">Diagrame liniare</h1>
      </div>

      <CustomHorizontalContainer
        components={[
          <div key="daily-trend">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
              <button onClick={exportDailyTrend} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Descarcă CSV
              </button>
            </div>
            <CustomLineChart
              title={"Trend tichete - Zilnic"}
              data={startedClosedDateDataDaily}
              tooltipLabelName="Day"
              dataKey={"startCount"}
              labelDataKey={"date"}
              labelName={"Started"}
              secondDataKey="closedCount"
              secondLabel={"Closed"}
              secondStroke="#b254ff"
            />
          </div>,

          <div key="weekly-trend">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
              <button onClick={exportWeeklyTrend} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Descarcă CSV
              </button>
            </div>
            <CustomLineChart
              title={"Trend tichete - Săptămânal"}
              data={startedClosedDateDataWeekly}
              tooltipLabelName="Week"
              dataKey={"startCount"}
              labelDataKey={"date"}
              labelName={"Started"}
              secondDataKey="closedCount"
              secondLabel={"Closed"}
              secondStroke="#b254ff"
            />
          </div>,

          <div key="monthly-trend">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
              <button onClick={exportMonthlyTrend} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Descarcă CSV
              </button>
            </div>
            <CustomLineChart
              title={"Trend tichete - Lunar"}
              data={startedClosedDateDataMonthly}
              tooltipLabelName="Month"
              dataKey={"startCount"}
              labelDataKey={"date"}
              labelName={"Started"}
              secondDataKey="closedCount"
              secondLabel={"Closed"}
              secondStroke="#b254ff"
            />
          </div>,

          slaOverallData && slaOverallData.length > 0 ? (
            <div key="sla-overall">
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                <button onClick={exportSlaOverall} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Descarcă CSV
                </button>
              </div>
              <CustomLineChart
                title={"Performanță generală SLA (Lunar)"}
                data={slaOverallData}
                tooltipLabelName="Month"
                labelName={"Met"}
                labelDataKey={"date"}
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#b254ff"
                secondLabel="Exceeded"
              />
            </div>
          ) : (
            <div key="no-overall-sla">No Overall SLA Data</div>
          ),

          ...Object.entries(slaTeamData).map(([team, data]) =>
            data && data.length > 0 ? (
              <div key={`sla-team-${team}`}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                  <button
                    onClick={() => exportSlaTeam(team)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Descarcă CSV
                  </button>
                </div>
                <CustomLineChart
                  title={`Echipă: ${team} - Performanță SLA (Lunar)`}
                  data={data}
                  tooltipLabelName="Month"
                  labelName={"Met"}
                  labelDataKey={"date"}
                  dataKey="Met"
                  secondDataKey="Exceeded"
                  secondStroke="#b254ff"
                  secondLabel="Exceeded"
                />
              </div>
            ) : (
              <div key={`no-sla-team-${team}`}>No {team} SLA Data</div>
            )
          ),

          ...Object.entries(slaProjectData).map(([project, data]) =>
            data && data.length > 0 ? (
              <div key={`sla-project-${project}`}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                  <button
                    onClick={() => exportSlaProject(project)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Descarcă CSV
                  </button>
                </div>
                <CustomLineChart
                  title={`Proiect: ${project} - Performanță SLA (Lunar)`}
                  data={data}
                  tooltipLabelName="Month"
                  labelName={"Met"}
                  dataKey="Met"
                  labelDataKey={"date"}
                  secondDataKey="Exceeded"
                  secondStroke="#b254ff"
                  secondLabel="Exceeded"
                />
              </div>
            ) : (
              <div key={`no-sla-project-${project}`}>
                Nu există date SLA pentru proiectul {project}
              </div>
            )
          ),
        ]}
      />
    </>
  );
}

export default LineChartSection;
