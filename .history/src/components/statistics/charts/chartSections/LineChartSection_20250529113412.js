import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

function LineChartSection({ filters }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

const fetchData = async (type, groupBy = "", groupValue = "", setData) => {
  const params = new URLSearchParams();

  if (filters?.team_assigned_person) params.append("team_assigned_person", filters.team_assigned_person);
  if (filters?.team_created_by) params.append("team_created_by", filters.team_created_by);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.project) params.append("project", filters.project);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.startDate) params.append("dateFrom", filters.startDate);
  if (filters?.endDate) params.append("dateTo", filters.endDate);
  if (filters?.search) params.append("search", filters.search);

  params.append("mode", "timeline");
  params.append("type", type);
  if (groupBy) {
    params.append("groupBy", groupBy);
    params.append("groupValue", groupValue);
  }

  try {
    const res = await fetch(`http://localhost/api/tickets.php?${params.toString()}`);
    const data = await res.json();

    let mappedData = [];
    if (type.startsWith("count")) {
      // Pentru trendul ticketelor - doar date și count
      mappedData = data.map(d => ({
        date: d.date,
        count: d.count,
      }));
    } else if (type === "sla") {
      // Pentru SLA - met și exceeded
      mappedData = data.map(d => ({
        date: d.date,
        Met: d.sla_met,
        Exceeded: d.sla_exceeded,
      }));
    } else {
      // fallback
      mappedData = data;
    }

    setData(mappedData);
  } catch (err) {
    console.error(`Error fetching line chart ${type} ${groupBy}:${groupValue}:`, err);
  }
};

fetchData("count", "", "", setDailyData);
fetchData("count_weekly", "", "", setWeeklyData);
fetchData("count_monthly", "", "", setMonthlyData);

useEffect(() => {
  if (!filters) return;

  // Trenduri globale de creare tickete
  fetchData("count", "", "", setDailyData);
  fetchData("count_weekly", "", "", setWeeklyData);
  fetchData("count_monthly", "", "", setMonthlyData);

  // SLA overall
  fetchData("sla", "", "", setSlaOverallData);

  // SLA pe echipe
  if (filters.team_assigned_person_list?.length) {
    const teamData = {};
    filters.team_assigned_person_list.forEach((team) => {
      fetchData("sla", "team_assigned_person", team, (data) => {
        teamData[team] = data;
        setSlaTeamData({ ...teamData });
      });
    });
  }

  // SLA pe proiecte
  if (filters.project_list?.length) {
    const projData = {};
    filters.project_list.forEach((project) => {
      fetchData("sla", "project", project, (data) => {
        projData[project] = data;
        setSlaProjectData({ ...projData });
      });
    });
  }
}, [filters]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Line charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomLineChart
            title="Ticket Creation Trend - Daily"
            data={dailyData}
            dataKey="count"
            labelName="Day: "
          />,
          <CustomLineChart
            title="Ticket Creation Trend - Weekly"
            data={weeklyData}
            dataKey="count"
            labelName="Week: "
          />,
          <CustomLineChart
            title="Ticket Creation Trend - Monthly"
            data={monthlyData}
            dataKey="count"
            labelName="Month: "
          />,
          slaOverallData?.length > 0 ? (
            <CustomLineChart
              title="Overall SLA Performance (Monthly)"
              data={slaOverallData}
              labelName="Month: "
              dataKey="Met"
              secondDataKey="Exceeded"
              secondStroke="#ffc658"
              secondLabel="Exceeded"
            />
          ) : (
            <div>No Overall SLA Data</div>
          ),
          ...Object.entries(slaTeamData).map(([team, data]) =>
            data?.length > 0 ? (
              <CustomLineChart
                key={team}
                title={`Team: ${team} SLA Performance (Monthly)`}
                data={data}
                labelName="Month: "
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
            data?.length > 0 ? (
              <CustomLineChart
                key={project}
                title={`Project: ${project} SLA Performance (Monthly)`}
                data={data}
                labelName="Month: "
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
