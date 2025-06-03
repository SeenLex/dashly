import { useState, useEffect } from "react";
import BarChartSection from "../charts/chartSections/BarChartSection";
import LineChartSection from "../charts/chartSections/LineChartSection";
import PieChartSection from "../charts/chartSections/PieChartSection";
import Filters from "./Filters";

function ChartSwitcher() {
  const [chartType, setChartType] = useState("bar");
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const [filters, setFilters] = useState({
    team_assigned_person_name: "",
    team_created_by_name: "",
    priority: "",
    project: "",
    status: "",
    slaStatus: "",
    sla: "",
    startDate: formatDate(oneYearAgo),
    endDate: formatDate(today),
  });

  const [allTeamsAssigned, setAllTeamsAssigned] = useState([]);
  const [allTeamsCreated, setAllTeamsCreated] = useState([]);
  const [allPriorities, setAllPriorities] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);

  // Fetch all values for filters
  useEffect(() => {
    fetch("http://localhost/api/get_filter_values.php")
      .then((res) => res.json())
      .then((data) => {
        setAllTeamsAssigned(data["assignedTeams"]);
        setAllTeamsCreated(data["createdTeams"]);
        setAllPriorities(data["priorities"]);
        setAllProjects(data["projects"]);
        setAllStatuses(data["statuses"]);
      })
      .catch((err) => console.error("Error fetching all values:", err));
  }, []);

  return (
    <div>
      <div className="flex justify-start mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`custom-button ${
            showFilters ? "custom-button-active" : "custom-button-inactive"
          }`}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-blue-200 dark:bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6 shadow-inner">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
            Advanced Filters
          </h3>
          <Filters
            filters={filters}
            setFilters={setFilters}
            allValues={{
              team_assigned_person_name: allTeamsAssigned,
              team_created_by_name: allTeamsCreated,
              priority: allPriorities,
              project: allProjects,
              status: allStatuses,
            }}
            isLineChart={chartType === "line"}
          />
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setChartType("bar")}
          className={`custom-button ${
            chartType === "bar"
              ? "custom-button-active"
              : "custom-button-inactive"
          }`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType("line")}
          className={`custom-button ${
            chartType === "line"
              ? "custom-button-active"
              : "custom-button-inactive"
          }`}
        >
          Line Chart
        </button>
        <button
          onClick={() => setChartType("pie")}
          className={`custom-button ${
            chartType === "pie"
              ? "custom-button-active"
              : "custom-button-inactive"
          }`}
        >
          Pie Chart
        </button>
      </div>

      <div>
        {chartType === "bar" && <BarChartSection filters={filters} />}
        {chartType === "line" && <LineChartSection filters={filters} />}
        {chartType === "pie" && <PieChartSection filters={filters} />}
      </div>
    </div>
  );
}

export default ChartSwitcher;
