import { useEffect, useState } from "react";
import {
  normalizeTickets,
} from "../../helpers/fct.js";
import CustomBarChart from "../chartComponents/CustomBarChart.js";
import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";
import { prepareDataWithTicketsByCategory } from "../../helpers/fct.js";

function BarChartSection({ tickets, totalCount }) {
  // State-uri pentru datele grupate și procente
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
    fetch(`http://localhost/api/get_tickets_by_priority.php`)
      .then((res) => res.json())
      .then((data) => {
        setNumByPriority(data.filter(e => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/get_tickets_by_priority_and_sla_met.php`)
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByPriority(data.filter(e => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/get_tickets_by_team_assigned_person_and_sla_met.php`)
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByTeam(data.filter(e => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/get_tickets_by_project_and_sla_met.php`)
      .then((res) => res.json())
      .then((data) => {
        setResolutionSLANumByProject(data.filter(e => e.count > 0));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

     fetch(`http://localhost/api/get_tickets_sla_compliance_by_team.php`)
      .then((res) => res.json())
      .then((data) => {
        setSlaStatusByTeam(data.filter(e => e.name != null));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));

    fetch(`http://localhost/api/get_tickets_sla_compliance_by_project.php`)
      .then((res) => res.json())
      .then((data) => {
        setSlaStatusByProject(data.filter(e => e.name != null));
      })
      .catch((err) => console.error("Error fetching filtered tickets:", err));
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 className="text-black dark:text-white">Bar charts</h1>
      </div>
      <CustomHorizontalContainer
        components={[
          // Basic ticket metrics
          <CustomBarChart
            key="num-priority"
            title="Ticket number by priority"
            data={numByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
            colors={["#4299e1"]}
          />,

          // SLA resolution metrics
          <CustomBarChart
            key="sla-num-priority"
            title="Resolution SLA by priority"
            data={resolutionSLANumByPriority}
            dataKey="count"
            categoryKey="priority"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
            colors={["#4299e1"]}
          />,

          <CustomBarChart
            key="sla-num-team"
            title="Resolution SLA by team"
            data={resolutionSLANumByTeam}
            dataKey="count"
            categoryKey="team_assigned_person"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
            colors={["#4299e1"]}
            slaStatusByTeam={slaStatusByTeam}
          />,

          <CustomBarChart
            key="sla-num-project"
            title="Resolution SLA by project"
            data={resolutionSLANumByProject}
            dataKey="count"
            categoryKey="project"
            teamsByCategory={teamsByCategory}
            showBothValues={true}
            totalCount={totalCount}
            colors={["#4299e1"]}
            slaStatusByProject={slaStatusByProject}
          />,

          // SLA Compliance charts
          <CustomBarChart
            key="sla-team-count"
            title="SLA Compliance by Team"
            data={slaStatusByTeam}
            dataKey={["Met", "In Progress", "Exceeded"]}
            categoryKey="name"
            stacked={true}
            teamsByCategory={teamsByCategory}
            slaStatusByTeam={slaStatusByTeam}
          />,

          <CustomBarChart
            key="sla-project-count"
            title="SLA Compliance by Project"
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
