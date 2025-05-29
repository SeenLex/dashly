import { useEffect, useState } from "react";
import {
  countByCreatedDateDaily,
  countByCreatedDateWeekly,
  countByCreatedDateMonthly,
  countSLAOverTime,
} from "../../helpers/fct.js";
import CustomLineChart from "../chartComponents/CustomLineChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import axios from "axios";

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
      try {
        const res = await axios.get(
          `http://localhost/api/tickets.php?period=${period}`
        );
        setTicketsData(res.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setTicketsData([]);
      }
    };

    fetchData();
  }, [period]);

  const groupByDate = (data) => {
    const grouped = {};
    data.forEach((ticket) => {
      let key;
      const date = new Date(ticket.start_date);
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
      count
    }));
  };

  const chartData = groupByDate(ticketsData);

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
        labelName="Data: "
        xAxisKey="date"
      />
    </div>
  );
}

export default LineChartSection;
