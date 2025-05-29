import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { parseISO, format } from "date-fns";


const exportDataToCsv = (
  filename,
  data,
  labelKey = "label",
  valueKeys = ["count"]
) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const csvRows = [];

  // Header
  const headers = [labelKey, ...valueKeys];
  csvRows.push(headers.join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map((key) => {
      const val = row[key] ?? "";
      return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
    });
    csvRows.push(values.join(","));
  }

  // Create and trigger download
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function LineChartSection({ filters }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [slaOverallData, setSlaOverallData] = useState([]);
  const [slaTeamData, setSlaTeamData] = useState({});
  const [slaProjectData, setSlaProjectData] = useState({});

 // Update your data processing in the fetchTrendData function
const fetchTrendData = async () => {
  const baseParams = new URLSearchParams(filters);

  const daily = await fetch(
    `http://localhost/api/tickets.php?mode=trend&period=day&${baseParams}`
  ).then((res) => res.json());
  
  const weekly = await fetch(
    `http://localhost/api/tickets.php?mode=trend&period=week&${baseParams}`
  ).then((res) => res.json());
  
  const monthly = await fetch(
    `http://localhost/api/tickets.php?mode=trend&period=month&${baseParams}`
  ).then((res) => res.json());

  // Process daily data
  setDailyData(
    daily.map((d) => {
      // Handle both string and object responses
      const periodLabel = typeof d.period_label === 'string' 
        ? d.period_label 
        : d.period_label?.date || '';
      
      // Format as "YYYY-MM-DD HH:00" for display and CSV
      let label = periodLabel;
      try {
        if (periodLabel.includes(' ')) {
          const [datePart, hourPart] = periodLabel.split(' ');
          label = `${datePart} ${hourPart.split(':')[0]}:00`;
        } else {
          const date = parseISO(periodLabel);
          label = format(date, 'yyyy-MM-dd HH:00');
        }
      } catch (e) {
        console.error('Error formatting daily label:', e);
      }
      
      return {
        label,
        count: d.tickets_count,
        date: label.split(' ')[0], // For sorting/grouping if needed
        hour: label.split(' ')[1]  // For sorting/grouping if needed
      };
    })
  );

  // Process weekly data
  setWeeklyData(
    weekly.map((d) => {
      const periodLabel = typeof d.period_label === 'string' 
        ? d.period_label 
        : d.period_label?.date || '';
      
      let label = periodLabel;
      try {
        // Handle different possible week formats
        if (periodLabel.match(/^Week \d+/)) {
          // Format like "Week 22 (2025-05-27)"
          label = periodLabel;
        } else {
          // Try to parse as ISO date
          const date = parseISO(periodLabel);
          const weekNumber = format(date, 'ww');
          const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
          label = `Week ${weekNumber} (${weekStart})`;
        }
      } catch (e) {
        console.error('Error formatting weekly label:', e);
      }
      
      return {
        label,
        count: d.tickets_count,
        weekNumber: label.match(/Week (\d+)/)?.[1] || '', // Extract week number
        year: label.match(/\d{4}/)?.[0] || ''            // Extract year
      };
    })
  );

  // Process monthly data
  setMonthlyData(
    monthly.map((d) => {
      const periodLabel = typeof d.period_label === 'string' 
        ? d.period_label 
        : d.period_label?.date || '';
      
      let label = periodLabel;
      try {
        if (periodLabel.match(/^\d{4}-\d{2}$/)) {
          // Already in YYYY-MM format
          label = periodLabel;
        } else {
          // Try to parse and format
          const date = parseISO(periodLabel);
          label = format(date, 'yyyy-MM');
        }
      } catch (e) {
        console.error('Error formatting monthly label:', e);
      }
      
      return {
        label,
        count: d.tickets_count,
        year: label.split('-')[0],
        month: label.split('-')[1]
      };
    })
  );
};
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Line charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <>
            <CustomLineChart
              title="Ticket Creation Trend - Daily"
              data={dailyData}
              dataKey="count"
              labelName="Day: "
            />
            <button
              onClick={() =>
                exportDataToCsv("daily-trend.csv", dailyData, "label", [
                  "count",
                ])
              }
            >
              Export CSV
            </button>
          </>,
          <>
            <CustomLineChart
              title="Ticket Creation Trend - Weekly"
              data={weeklyData}
              dataKey="count"
              labelName="Week: "
            />
            <button
              style={{ marginBottom: 24 }}
              onClick={() => exportDataToCsv("weekly-trend.csv", weeklyData)}
            >
              Export CSV
            </button>
          </>,

          <>
            <CustomLineChart
              title="Ticket Creation Trend - Monthly"
              data={monthlyData}
              dataKey="count"
              labelName="Month: "
            />
            <button
              style={{ marginBottom: 24 }}
              onClick={() => exportDataToCsv("monthly-trend.csv", monthlyData)}
            >
              Export CSV
            </button>
          </>,

          slaOverallData?.length > 0 ? (
            <>
              <CustomLineChart
                title="Overall SLA Performance (Monthly)"
                data={slaOverallData}
                labelName="Month: "
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />
              <button
                style={{ marginBottom: 24 }}
                onClick={() =>
                  exportDataToCsv("sla-overall.csv", slaOverallData)
                }
              >
                Export CSV
              </button>
            </>
          ) : (
            <div>No Overall SLA Data</div>
          ),

          ...Object.entries(slaTeamData).map(([team, data]) =>
            data?.length > 0 ? (
              <>
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
                <button
                  key={`btn-${team}`}
                  style={{ marginBottom: 24 }}
                  onClick={() => exportDataToCsv(`sla-team-${team}.csv`, data)}
                >
                  Export CSV
                </button>
              </>
            ) : (
              <div key={team}>No {team} SLA Data</div>
            )
          ),

          ...Object.entries(slaProjectData).map(([project, data]) =>
            data?.length > 0 ? (
              <>
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
                <button
                  key={`btn-${project}`}
                  style={{ marginBottom: 24 }}
                  onClick={() =>
                    exportDataToCsv(`sla-project-${project}.csv`, data)
                  }
                >
                  Export CSV
                </button>
              </>
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
