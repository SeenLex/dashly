import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer";

function LineChartSection({ filters }) {
  const [lineData, setLineData] = useState([]);

  const fetchLineData = async () => {
      if (!filters) return; // ⛔️ Protecție contra undefined
    const params = new URLSearchParams();

    if (filters.team_assigned_person) params.append("team_assigned_person", filters.team_assigned_person);
    if (filters.team_created_by) params.append("team_created_by", filters.team_created_by);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.project) params.append("project", filters.project);
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("dateFrom", filters.startDate);
    if (filters.endDate) params.append("dateTo", filters.endDate);
    if (filters.search) params.append("search", filters.search);

    params.append("mode", "timeline"); // sau orice mod ai tu pentru linie
    params.append("type", "count"); // sau alt tip necesar (ex: sla_met)

    try {
      const res = await fetch(`http://localhost/api/tickets.php?${params.toString()}`);
      const data = await res.json();

      // Asumăm că răspunsul are forma: [{ date: "2024-01-01", count: 5 }, ...]
      const mappedData = data.map(d => ({
        date: d.date,
        count: d.count,
        sla_met: d.sla_met,
        sla_exceeded: d.sla_exceeded,
      }));

      setLineData(mappedData);
    } catch (err) {
      console.error("Error fetching line chart data:", err);
    }
  };

  useEffect(() => {
    fetchLineData();
  }, [filters]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Line Chart</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          <CustomLineChart
            key="line-count"
            title="Ticket count over time"
            data={lineData}
            dataKey="count"
            categoryKey="date"
          />,
          <CustomLineChart
            key="sla-met-over-time"
            title="SLA Met over time"
            data={lineData}
            dataKey="sla_met"
            categoryKey="date"
          />,
          <CustomLineChart
            key="sla-exceeded-over-time"
            title="SLA Exceeded over time"
            data={lineData}
            dataKey="sla_exceeded"
            categoryKey="date"
          />,
        ]}
      />
    </>
  );
}

export default LineChartSection;
