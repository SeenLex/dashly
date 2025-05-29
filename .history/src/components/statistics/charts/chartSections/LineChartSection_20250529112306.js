import { useEffect, useState } from "react";
import CustomLineChart from "../chartComponents/CustomLineChart.js";

const periodOptions = {
  day: "Zi",
  week: "Săptămână",
  month: "Lună",
  quarter: "Trimestru"
};

function LineChartSection({ filters }) {
  const [ticketsData, setTicketsData] = useState([]);
  const [period, setPeriod] = useState("day");

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();

      if (filters.team_assigned_person) params.append("team_assigned_person", filters.team_assigned_person);
      if (filters.team_created_by) params.append("team_created_by", filters.team_created_by);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.project) params.append("project", filters.project);
      if (filters.status) params.append("status", filters.status);
      if (filters.slaStatus) params.append("slaStatus", filters.slaStatus);
      if (filters.sla) params.append("sla", filters.sla);
      if (filters.startDate) params.append("dateFrom", filters.startDate);
      if (filters.endDate) params.append("dateTo", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      params.append("period", period);

      try {
        const res = await fetch(`http://localhost/api/tickets.php?${params.toString()}`);
        const data = await res.json();
        setTicketsData(data);
      } catch (err) {
        console.error("Error loading line chart data:", err);
        setTicketsData([]);
      }
    };

    fetchData();
  }, [filters, period]);

  const groupByPeriod = (data) => {
    const grouped = {};

    data.forEach((ticket) => {
      const date = new Date(ticket.start_date);
      let key;

      switch (period) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "quarter":
          const q = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${q}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!grouped[key]) {
        grouped[key] = 1;
      } else {
        grouped[key] += 1;
      }
    });

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));
  };

  const chartData = groupByPeriod(ticketsData);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Trend Creare Tichete</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          {Object.entries(periodOptions).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <CustomLineChart
        title={`Tichete create (${periodOptions[period]})`}
        data={chartData}
        dataKey="count"
        labelName="Data:"
        xAxisKey="date"
      />
    </div>
  );
}

export default LineChartSection;
