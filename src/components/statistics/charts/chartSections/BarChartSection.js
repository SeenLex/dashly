import { useEffect, useState } from "react";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

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

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
         <h1 className="text-2xl font-bold text-black dark:text-white">Bar charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          // Basic ticket metrics
          <CustomBarChart
            key="num-priority"
            title="Număr de tichete pe prioritate"
            data={numByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            colors={["#4299e1"]}
          />,

          // SLA resolution metrics
          <CustomBarChart
            key="sla-num-priority"
            title="SLA de rezolvare pe prioritate"
            data={resolutionSLANumByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            colors={["#4299e1"]}
          />,

          <CustomBarChart
            key="sla-num-team"
            title="SLA de rezolvare pe echipă"
            data={resolutionSLANumByTeam}
            dataKey="count"
            categoryKey="team_assigned_person"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            colors={["#4299e1"]}
            slaStatusByTeam={slaStatusByTeam}
          />,

          <CustomBarChart
            key="sla-num-project"
            title="SLA de rezolvare pe proiect"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            colors={["#4299e1"]}
            slaStatusByProject={slaStatusByProject}
          />,

          // SLA Compliance charts
          <CustomBarChart
            key="sla-team-count"
            title="Respectarea SLA-ului pe echipă"
            data={slaStatusByTeam}
            dataKey={["Met", "In Progress", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            teamsByCategory={teamsByCategory}
            slaStatusByTeam={slaStatusByTeam}
          />,

          <CustomBarChart
            key="sla-project-count"
            title="Respectarea SLA-ului pe proiect"
            data={slaStatusByProject}
            dataKey={["Met", "In Progress", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            teamsByCategory={teamsByCategory}
            slaStatusByProject={slaStatusByProject}
          />,
        ]}
      />
    </>
  );
}

export default BarChartSection;
