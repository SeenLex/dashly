import { useState, useEffect } from "react";
import BarChartSection from "../charts/chartSections/BarChartSection";
import LineChartSection from "../charts/chartSections/LineChartSection";
import PieChartSection from "../charts/chartSections/PieChartSection";
import Filters from "./Filters";

function ChartSwitcher() {
  const [chartType, setChartType] = useState("bar");
  const [showFilters, setShowFilters] = useState(false);

const [filters, setFilters] = useState({
  team_assigned_person_name: "", // Schimbat de la team_assigned_person
  team_created_by_name: "",     // Schimbat de la team_created_by
  priority: "",
  project: "",
  status: "",
  slaStatus: "",
  sla: "",
  startDate: "",
  endDate: "",
});


  const [filteredTickets, setFilteredTickets] = useState([]);
  const [allTeams_assigned, setAllTeams_assigned] = useState([]);
  const [allTeams_created, setAllTeams_created] = useState([]);
  const [allPriorities, setAllPriorities] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);


  // Fetch tickets filtered by backend
  useEffect(() => {
    const params = new URLSearchParams(filters).toString();
    fetch(`http://localhost/api/tickets.php?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredTickets(data);
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
  }, [filters]);

  // Fetch all values for filters
  useEffect(() => {
    fetch("http://localhost/api/tickets.php")
      .then((res) => res.json())
      .then((data) => {
        setAllTeams_assigned([...new Set(data.map(t => t.team_assigned_person).filter(Boolean))]);
        setAllTeams_created([...new Set(data.map(t => t.team_created_by).filter(Boolean))]);
        setAllPriorities([...new Set(data.map(t => t.priority).filter(Boolean))]);
        setAllProjects([...new Set(data.map(t => t.project).filter(Boolean))]);
        setAllStatuses([...new Set(data.map(t => t.status).filter(Boolean))]);
      })
      .catch((err) => console.error("Error fetching all values:", err));
  }, []);

  return (
    <div>
      {/* "Show Filters" Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`custom-button ${showFilters ? 'custom-button-active' : 'custom-button-inactive'}`}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {showFilters && (
        <div className="bg-blue-200 dark:bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6 shadow-inner">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Advanced Filters</h3>
          <Filters
            filters={filters}
            setFilters={setFilters}
            allValues={{
              team_assigned_person: allTeams_assigned,
              team_created_by: allTeams_created,
              priority: allPriorities, // Use allPriorities here
              project: allProjects, // Use allProjects here
              status: allStatuses, // Use allStatuses here
            }}
          />
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setChartType("bar")}
          className={`custom-button ${chartType === "bar" ? "custom-button-active" : "custom-button-inactive"}`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType("line")}
          className={`custom-button ${chartType === "line" ? "custom-button-active" : "custom-button-inactive"}`}
        >
          Line Chart
        </button>
        <button
          onClick={() => setChartType("pie")}
          className={`custom-button ${chartType === "pie" ? "custom-button-active" : "custom-button-inactive"}`}
        >
          Pie Chart
        </button>
      </div>

      {/* Render Chart Section based on chartType */}
      <div>
        {chartType === "bar" && <BarChartSection tickets={filteredTickets} totalCount={filteredTickets.length} />}
        {chartType === "line" && <LineChartSection tickets={filteredTickets} />}
        {chartType === "pie" && <PieChartSection tickets={filteredTickets} />}
      </div>
    </div>
  );
}

export default ChartSwitcher;