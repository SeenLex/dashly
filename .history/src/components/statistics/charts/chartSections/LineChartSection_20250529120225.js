  import { useEffect, useState } from "react";
  import CustomLineChart from "../chartComponents/CustomLineChart.js";
  import CustomHorizontalContainer from "../../customContainers/CustomHorizontalContainer.js";

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

    const daily = await fetch(`/api/tickets?mode=trend&period=day&${baseParams}`).then(res => res.json());
    const weekly = await fetch(`/api/tickets?mode=trend&period=week&${baseParams}`).then(res => res.json());
    const monthly = await fetch(`/api/tickets?mode=trend&period=month&${baseParams}`).then(res => res.json());

    setDailyData(daily.map(d => ({ label: d.period_label, count: d.tickets_count })));
    setWeeklyData(weekly.map(d => ({ label: d.period_label, count: d.tickets_count })));
    setMonthlyData(monthly.map(d => ({ label: d.period_label, count: d.tickets_count })));
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
             <CustomLineChart
              title="Ticket Creation Trend - Daily"
              data={dailyData}
              dataKey="count"
              labelName="Day: "
            />,
            <CustomLineChart
      title="Ticket Creation Trend - Weekly"
      data={weeklyData}
      dataKey="count"
      labelName="Week: "
    />,
            <CustomLineChart
              title="Ticket Creation Trend - Monthly"
              data={monthlyData}
              dataKey="count"
              labelName="Month: "
            />,
            slaOverallData?.length > 0 ? (
              <CustomLineChart
                title="Overall SLA Performance (Monthly)"
                data={slaOverallData}
                labelName="Month: "
                dataKey="Met"
                secondDataKey="Exceeded"
                secondStroke="#ffc658"
                secondLabel="Exceeded"
              />  
            ) : (
              <div>No Overall SLA Data</div>
            ),
            ...Object.entries(slaTeamData).map(([team, data]) =>
              data?.length > 0 ? (
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
              ) : (
                <div key={team}>No {team} SLA Data</div>
              )
            ),
            ...Object.entries(slaProjectData).map(([project, data]) =>
              data?.length > 0 ? (
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
