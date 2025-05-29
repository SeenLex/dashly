import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { format, subDays } from "date-fns";

function LineChartSection({ filters }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyRawData, setWeeklyRawData] = useState([]); // date zilnice pentru ultimele 7 zile
  const [weeklySummary, setWeeklySummary] = useState([]); // suma pe 7 zile
  const [monthlyData, setMonthlyData] = useState([]);
  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

  const fetchData = async (type, groupBy = "", groupValue = "", setData, filtersOverride) => {
    const params = new URLSearchParams();

    const appliedFilters = filtersOverride || filters;

    if (appliedFilters?.team_assigned_person) params.append("team_assigned_person", appliedFilters.team_assigned_person);
    if (appliedFilters?.team_created_by) params.append("team_created_by", appliedFilters.team_created_by);
    if (appliedFilters?.priority) params.append("priority", appliedFilters.priority);
    if (appliedFilters?.project) params.append("project", appliedFilters.project);
    if (appliedFilters?.status) params.append("status", appliedFilters.status);
    if (appliedFilters?.startDate) params.append("dateFrom", appliedFilters.startDate);
    if (appliedFilters?.endDate) params.append("dateTo", appliedFilters.endDate);
    if (appliedFilters?.search) params.append("search", appliedFilters.search);

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
        mappedData = data.map(d => ({
          date: d.date,
          count: d.count,
        }));
      } else if (type === "sla") {
        mappedData = data.map(d => ({
          date: d.date,
          Met: d.sla_met,
          Exceeded: d.sla_exceeded,
        }));
      } else {
        mappedData = data;
      }

      setData(mappedData);
    } catch (err) {
      console.error(`Error fetching line chart ${type} ${groupBy}:${groupValue}:`, err);
    }
  };

  useEffect(() => {
    if (!filters) return;

    // Data azi (pentru daily)
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const dailyFilters = { ...filters, startDate: todayStr, endDate: todayStr };

    // Data pentru ultimele 7 zile (azi inclusiv)
    const weekStartStr = format(subDays(new Date(), 6), "yyyy-MM-dd"); // 7 zile total
    const weeklyFilters = { ...filters, startDate: weekStartStr, endDate: todayStr };

    // Data pentru ultimele 30 de zile (azi inclusiv)
    const monthStartStr = format(subDays(new Date(), 29), "yyyy-MM-dd"); // 30 zile total
    const monthlyFilters = { ...filters, startDate: monthStartStr, endDate: todayStr };

    // Fetch daily (azi)
    fetchData("count", "", "", setDailyData, dailyFilters);

    // Fetch raw weekly (date zilnice)
    fetchData("count", "", "", setWeeklyRawData, weeklyFilters);

    // Fetch monthly (date zilnice)
    fetchData("count", "", "", setMonthlyData, monthlyFilters);

    // SLA overall
    fetchData("sla", "", "", setSlaOverallData);

    // SLA echipe
    if (filters.team_assigned_person_list?.length) {
      const teamData = {};
      filters.team_assigned_person_list.forEach((team) => {
        fetchData("sla", "team_assigned_person", team, (data) => {
          teamData[team] = data;
          setSlaTeamData({ ...teamData });
        });
      });
    }

    // SLA proiecte
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

  // Calculează suma tickete din ultima săptămână după ce primim raw data
  useEffect(() => {
    if (weeklyRawData.length > 0) {
      const totalWeekly = weeklyRawData.reduce((acc, curr) => acc + (curr.count || 0), 0);
      setWeeklySummary([{ date: "Last 7 days", count: totalWeekly }]);
    }
  }, [weeklyRawData]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Line charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomLineChart
            key="daily"
            title="Ticket Creation Today"
            data={dailyData}
            dataKey="count"
            labelName="Today: "
          />,
          <CustomLineChart
            key="weekly"
            title="Ticket Creation Last 7 Days (Total)"
            data={weeklySummary}
            dataKey="count"
            labelName="Last 7 days: "
          />,
          <CustomLineChart
            key="monthly"
            title="Ticket Creation Trend - Last 30 Days"
            data={monthlyData}
            dataKey="count"
            labelName="Day: "
          />,
          slaOverallData?.length > 0 ? (
            <CustomLineChart
              key="slaOverall"
              title="Overall SLA Performance (Monthly)"
              data={slaOverallData}
              labelName="Month: "
              dataKey="Met"
              secondDataKey="Exceeded"
              secondStroke="#ffc658"
              secondLabel="Exceeded"
            />
          ) : (
            <div key="noSlaOverall">No Overall SLA Data</div>
          ),
          ...Object.entries(slaTeamData).map(([team, data]) =>
            data?.length > 0 ? (
              <CustomLineChart
                key={`slaTeam-${team}`}
                title={`Team: ${team} SLA Performance (Monthly)`}
                data={data}
                labelName="Month: "
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`noSlaTeam-${team}`}>No {team} SLA Data</div>
            )
          ),
          ...Object.entries(slaProjectData).map(([project, data]) =>
            data?.length > 0 ? (
              <CustomLineChart
                key={`slaProject-${project}`}
                title={`Project: ${project} SLA Performance (Monthly)`}
                data={data}
                labelName="Month: "
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
            ) : (
              <div key={`noSlaProject-${project}`}>No {project} SLA Data</div>
            )
          ),
        ]}
      />
    </>
  );
}

export default LineChartSection;
