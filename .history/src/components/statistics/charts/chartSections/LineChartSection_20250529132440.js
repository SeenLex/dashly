import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

const exportAllLineChartDataToCsv = (filename, sections) => {
  const separator = ",";
  let csvContent = "";

  for (const [title, rows] of sections) {
    if (!rows || rows.length === 0) continue;

    const keys = Object.keys(rows[0]);
    csvContent += `"${title}"\n`; // titlul secțiunii în rând separat
    csvContent += keys.join(separator) + "\n";

    csvContent += rows
      .map((row) =>
        keys
          .map((k) => {
            const val = row[k] ?? "";
            return typeof val === "string"
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(separator)
      )
      .join("\n");

    csvContent += "\n\n"; // spațiu între secțiuni
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  daily.map((d) => {
    let label = d.period_label;
    if (typeof label === "string") {
      // Ex: "2025-05-29 09:00:00"
      const parts = label.split(" ");
      if (parts.length === 2) {
        const date = parts[0];
        const hour = parts[1].split(":")[0]; // ia doar ora
        label = `${date} ${hour}:00`; // format fix: "2025-05-29 09:00"
      }
    }
    return {
      label,
      count: d.tickets_count,
    };
  })
);

setWeeklyData(
  weekly.map((d) => {
    let label = "";
    if (typeof d.period_label === "string") {
      label = d.period_label;
    } else if (d.period_label?.date) {
      label = d.period_label.date;
    } else {
      label = String(d.period_label);
    }
    return {
      label,
      count: d.tickets_count,
    };
  })
);

setMonthlyData(
  monthly.map((d) => {
    let label = "";
    if (typeof d.period_label === "string") {
      label = d.period_label;
    } else if (d.period_label?.date) {
      label = d.period_label.date;
    } else {
      label = String(d.period_label);
    }
    return {
      label,
      count: d.tickets_count,
    };
  })
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
,

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
      <button
  style={{ margin: "24px auto", display: "block" }}
  onClick={() => {
    exportAllLineChartDataToCsv("all-trends.csv", [
      ["Daily Ticket Trend", dailyData],
      ["Weekly Ticket Trend", weeklyData],
      ["Monthly Ticket Trend", monthlyData],
      ["Overall SLA", slaOverallData],
      // poți adăuga și echipe, proiecte dacă ai datele sub formă de array
    ]);
  }}
>
  Export All Data to CSV
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
