import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
const exportDataToCsv = (filename, data, labelKey = "label", valueKeys = ["count"]) => {
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

  useEffect(() => {
    const fetchTrendData = async () => {
      const baseParams = new URLSearchParams(filters); // include dateFrom/dateTo dacă există

      const daily = await fetch(
        `http://localhost/api/tickets.php?mode=trend&period=day&${baseParams}`
      ).then((res) => res.json());
      const weekly = await fetch(
        `http://localhost/api/tickets.php?mode=trend&period=week&${baseParams}`
      ).then((res) => res.json());
      const monthly = await fetch(
        `http://localhost/api/tickets.php?mode=trend&period=month&${baseParams}`
      ).then((res) => res.json());

      setDailyData(
        daily.map((d) => ({
          label: d.period_label, // aici vine '2025-05-29 09'
          count: d.tickets_count,
        }))
      );
      setWeeklyData(
        weekly.map((d) => ({
          label:
            typeof d.period_label === "string"
              ? d.period_label
              : d.period_label.date,
          count: d.tickets_count,
        }))
      );
      setMonthlyData(
        monthly.map((d) => ({
          label: d.period_label.date, // extragi stringul de dată
          count: d.tickets_count,
        }))
      );
    };

    fetchTrendData();
  }, [filters]);

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
    onClick={() => exportDataToCsv("daily-trend.csv", dailyData, "label", ["count"])}
  >
    Export CSV
  </button>
</>

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
          onClick={() => exportDataToCsv("sla-overall.csv", slaOverallData)}
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
            onClick={() => exportDataToCsv(`sla-project-${project}.csv`, data)}
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
