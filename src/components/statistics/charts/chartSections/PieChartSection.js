import { useEffect, useState } from "react";
import CustomPieChart from "../chartComponents/CustomPieChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { exportChartSectionToCSV} from "../../exportCSV";

function PieChartSection({ filters }) {
  const [statusData, setStatusData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [pData, setPriorityData] = useState([]);
  const [teamAssignedData, setTeamAssignedData] = useState([]);
  const [ticketsSLA, setTicketsSLA] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(filters).toString();
    fetch(`http://localhost/api/piecharts/get_tickets_by_status.php?${params}`)
      .then((res) => res.json())
      .then((data) => setStatusData(data))
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/piecharts/get_tickets_by_sla_status.php?${params}`)
      .then((res) => res.json())
      .then((data) => setSlaData(data))
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/piecharts/get_tickets_by_priority.php?${params}`)
      .then((res) => res.json())
      .then((data) => setPriorityData(data))
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/piecharts/get_tickets_by_team_assigned.php?${params}`)
      .then((res) => res.json())
      .then((data) => setTeamAssignedData(data))
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/piecharts/get_tickets_by_sla.php?${params}`)
      .then((res) => res.json())
      .then((data) => setTicketsSLA(data))
      .catch((err) => console.error("Error fetching filtered tickets:", err));
  }, [filters]);

  // Export functions for each chart:
const exportStatusData = () => {
  exportChartSectionToCSV({
    title: "Tichete_dupa_Status",
    data: statusData,
    ticketsKey: "tickets", // <- Adăugat!
  });
};

const exportSlaData = () => {
  exportChartSectionToCSV({
    title: "Tichete_dupa_SLA_Status",
    data: slaData,
    ticketsKey: "tickets", // <- Adăugat!
  });
};


  const exportPriorityData = () => {
    exportChartSectionToCSV({
      title: "Tichete_pe_Prioritate",
      data: pData,
      ticketsKey: "tickets", // exact ca în BarChart
    });
  };

  const exportTeamAssignedData = () => {
    exportChartSectionToCSV({
      title: "Tichete_dupa_Echipa_Asignata",
      data: teamAssignedData,
      ticketsKey: "tickets",
    });
  };

  const exportTicketsSLA = () => {
    exportChartSectionToCSV({
      title: "Tichete_dupa_SLA_Complet",
      data: ticketsSLA,
      ticketsKey: "tickets",
    });
  };

  return (
    <div className="pie-chart-section">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Diagrame circulare
        </h1>
      </div>

      <CustomHorizontalContainer
        components={[
          <div key="statusChart" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
              <button
                onClick={exportStatusData}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                DEscarcă CSV
              </button>
            </div>
            <CustomPieChart
              title="Tichete după Status"
              data={statusData}
              dataKey="count"
              nameKey="status"
              colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]}
            />
          </div>,

          <div key="slaChart" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
              <button
                onClick={exportSlaData}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                DEscarcă CSV
              </button>
            </div>
            <CustomPieChart
              title="Tichete după SLA"
              data={slaData}
              dataKey="value"
              nameKey="status"
              colors={["#FF6B6B", "#4ECDC4", "#FFE66D"]}
            />
          </div>,

          <div key="priorityChart" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
              <button
                onClick={exportPriorityData}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                DEscarcă CSV
              </button>
            </div>
            <CustomPieChart
              title="Tichete după Prioritate"
              data={pData}
              dataKey="count"
              nameKey="priority"
              colors={["#FF0000", "#FFA500", "#FFFF00", "#008000"]}
            />
          </div>,

          <div key="teamAssignedChart" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
              <button
                onClick={exportTeamAssignedData}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                DEscarcă CSV
              </button>
            </div>
            <CustomPieChart
              title="Tichete după Echipa Asignată"
              data={teamAssignedData}
              dataKey="count"
              nameKey="team"
              colors={["#8884D8", "#83A6ED", "#8DD1E1", "#82CA9D", "#A4DE6C"]}
            />
          </div>,

          // <div key="ticketsSLAChart" style={{ position: "relative" }}>
          //   <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
          //     <button
          //       onClick={exportTicketsSLA}
          //       className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          //     >
          //       DEscarcă CSV
          //     </button>
          //   </div>
          //   {/* Dacă vrei să afișezi acest grafic, de-comentează */}
          //   {/* <CustomPieChart
          //     title="Tichete după SLA (complet)"
          //     data={ticketsSLA}
          //     dataKey="value"
          //     nameKey="status"
          //     colors={["#FF7F50", "#6495ED", "#DC143C"]}
          //   /> */}
          // </div>,
        ]}
      />
    </div>
  );
}

export default PieChartSection;
