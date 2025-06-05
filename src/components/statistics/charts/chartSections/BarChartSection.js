import { useEffect, useState } from "react";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { exportChartSectionToCSV } from '../../exportCSV';

function BarChartSection({ filters }) {
  const [numByPriority, setNumByPriority] = useState([]);
  const [resolutionSLANumByPriority, setResolutionSLANumByPriority] = useState(
    []
  );
  const [resolutionSLANumByTeam, setResolutionSLANumByTeam] = useState([]);
  const [resolutionSLANumByProject, setResolutionSLANumByProject] = useState(
    []
  );
  const [slaStatusByTeam, setSlaStatusByTeam] = useState([]);
  const [slaStatusByProject, setSlaStatusByProject] = useState([]);
  const [teamsByCategory, setTeamsByCategory] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(filters).toString();
    fetch(
      `http://localhost/api/barcharts/get_tickets_by_priority.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setNumByPriority(data.filter((e) => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/barcharts/get_tickets_by_priority_and_sla_met.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByPriority(data.filter((e) => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/barcharts/get_tickets_by_team_assigned_person_and_sla_met.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByTeam(data.filter((e) => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/barcharts/get_tickets_by_project_and_sla_met.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByProject(data.filter((e) => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/barcharts/get_tickets_sla_compliance_by_team.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlaStatusByTeam(data.filter((e) => e.name != null));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(
      `http://localhost/api/barcharts/get_tickets_sla_compliance_by_project.php?${params}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlaStatusByProject(data.filter((e) => e.name != null));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
  }, [filters]);

  const exportPriorityTickets = () => {
    exportChartSectionToCSV({
      title: "Tichete_pe_Prioritate",
      data: numByPriority,
      ticketsKey: "tickets"
    });
  };

  const exportPrioritySLA = () => {
    exportChartSectionToCSV({
      title: "SLA_pe_Prioritate",
      data: resolutionSLANumByPriority,
      ticketsKey: "tickets"
    });
  };

  const exportTeamSLA = () => {
    exportChartSectionToCSV({
      title: "SLA_pe_Echipa",
      data: resolutionSLANumByTeam,
      ticketsKey: "tickets"
    });
  };

  const exportProjectSLA = () => {
    exportChartSectionToCSV({
      title: "SLA_pe_Proiect",
      data: resolutionSLANumByProject,
      ticketsKey: "tickets"
    });
  };

  const exportTeamSLAStatus = () => {
  const formattedData = slaStatusByTeam.map(item => ({
    name: item.name,
    Met: item.Met,
    Exceeded: item.Exceeded,
    "In Progress": item["In Progress"],
    tickets: item.tickets ? item.tickets.map(t => t.ticket_id).join(", ") : "N/A"
  }));
  
  exportChartSectionToCSV({
    title: "SLA_Status_pe_Echipa",
    data: formattedData
  });
};

const exportProjectSLAStatus = () => {
  const formattedData = slaStatusByProject.map(item => ({
    name: item.name,
    Met: item.Met,
    Exceeded: item.Exceeded,
    "In Progress": item["In Progress"],
    tickets: item.tickets ? item.tickets.map(t => t.ticket_id).join(", ") : "N/A"
  }));
  
  exportChartSectionToCSV({
    title: "SLA_Status_pe_Proiect",
    data: formattedData
  });
};
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Diagrame cu bare
        </h1>
      </div>

      <CustomHorizontalContainer
        components={[
          // Grafic 1 cu butonul său
          <div key="num-priority-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportPriorityTickets}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="Număr de tichete pe prioritate"
              data={numByPriority}
              dataKey="count"
              categoryKey="priority"
              teamsByCategory={teamsByCategory}
              showBothValues={true}
              colors={["#4299e1"]}
            />
          </div>,

          // Grafic 2 cu butonul său
          <div key="sla-num-priority-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportPrioritySLA}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="SLA de rezolvare pe prioritate"
              data={resolutionSLANumByPriority}
              dataKey="count"
              categoryKey="priority"
              teamsByCategory={teamsByCategory}
              showBothValues={true}
              colors={["#4299e1"]}
            />
          </div>,

          // [Restul graficelor cu butoane similare...]
          // Grafic 3
          <div key="sla-num-team-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportTeamSLA}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="SLA de rezolvare pe echipă"
              data={resolutionSLANumByTeam}
              dataKey="count"
              categoryKey="team_assigned_person"
              teamsByCategory={teamsByCategory}
              showBothValues={true}
              colors={["#4299e1"]}
              slaStatusByTeam={slaStatusByTeam}
            />
          </div>,

          // Grafic 4
          <div key="sla-num-project-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportProjectSLA}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="SLA de rezolvare pe proiect"
              data={resolutionSLANumByProject}
              dataKey="count"
              categoryKey="project"
              teamsByCategory={teamsByCategory}
              showBothValues={true}
              colors={["#4299e1"]}
              slaStatusByProject={slaStatusByProject}
            />
          </div>,

          // Grafic 5
          <div key="sla-team-count-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportTeamSLAStatus}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="Respectarea SLA-ului pe echipă"
              data={slaStatusByTeam}
              dataKey={["Met", "In Progress", "Exceeded"]}
              categoryKey="name"
              stacked={true}
              teamsByCategory={teamsByCategory}
              slaStatusByTeam={slaStatusByTeam}
            />
          </div>,

          // Grafic 6
          <div key="sla-project-count-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button
                onClick={exportProjectSLAStatus}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Descarcă CSV
              </button>
            </div>
            <CustomBarChart
              title="Respectarea SLA-ului pe proiect"
              data={slaStatusByProject}
              dataKey={["Met", "In Progress", "Exceeded"]}
              categoryKey="name"
              stacked={true}
              teamsByCategory={teamsByCategory}
              slaStatusByProject={slaStatusByProject}
            />
          </div>
        ]}
      />
    </>
  );
}

export default BarChartSection;