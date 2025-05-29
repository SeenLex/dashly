<CustomHorizontalContainer
  components={[
    <>
      <CustomLineChart
        title="Ticket Creation Trend - Daily"
        data={dailyData}
        dataKey="count"
        labelName="Day: "
      />
      <button
        style={{ marginBottom: 24 }}
        onClick={() => exportDataToCsv("daily-trend.csv", dailyData)}
      >
        Export CSV
      </button>
    </>,

    <>
      <CustomLineChart
        title="Ticket Creation Trend - Weekly"
        data={weeklyData}
        dataKey="count"
        labelName="Week: "
      />
      <button
        style={{ marginBottom: 24 }}
        onClick={() => exportDataToCsv("weekly-trend.csv", weeklyData)}
      >
        Export CSV
      </button>
    </>,

    <>
      <CustomLineChart
        title="Ticket Creation Trend - Monthly"
        data={monthlyData}
        dataKey="count"
        labelName="Month: "
      />
      <button
        style={{ marginBottom: 24 }}
        onClick={() => exportDataToCsv("monthly-trend.csv", monthlyData)}
      >
        Export CSV
      </button>
    </>,

    slaOverallData?.length > 0 ? (
      <>
        <CustomLineChart
          title="Overall SLA Performance (Monthly)"
          data={slaOverallData}
          labelName="Month: "
          dataKey="Met"
          secondDataKey="Exceeded"
          secondStroke="#ffc658"
          secondLabel="Exceeded"
        />
        <button
          style={{ marginBottom: 24 }}
          onClick={() => exportDataToCsv("sla-overall.csv", slaOverallData)}
        >
          Export CSV
        </button>
      </>
    ) : (
      <div>No Overall SLA Data</div>
    ),

    ...Object.entries(slaTeamData).map(([team, data]) =>
      data?.length > 0 ? (
        <>
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
          <button
            key={`btn-${team}`}
            style={{ marginBottom: 24 }}
            onClick={() => exportDataToCsv(`sla-team-${team}.csv`, data)}
          >
            Export CSV
          </button>
        </>
      ) : (
        <div key={team}>No {team} SLA Data</div>
      )
    ),

    ...Object.entries(slaProjectData).map(([project, data]) =>
      data?.length > 0 ? (
        <>
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
          <button
            key={`btn-${project}`}
            style={{ marginBottom: 24 }}
            onClick={() => exportDataToCsv(`sla-project-${project}.csv`, data)}
          >
            Export CSV
          </button>
        </>
      ) : (
        <div key={project}>No {project} SLA Data</div>
      )
    ),
  ]}
/>
