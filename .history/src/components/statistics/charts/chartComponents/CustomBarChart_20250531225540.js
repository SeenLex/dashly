import {
  YAxis,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import React, { useRef } from "react";

function CustomTooltip({ active, payload, label, showPercentage, coordinate }) {
  const scrollRef = useRef(null);
  const tooltipWidth = 550;
  const margin = 20;

  const x = coordinate?.x || 0;
  const windowWidth = window.innerWidth;

  // Determină dacă tooltipul ar ieși în afara ecranului
  const wouldOverflowRight = x + tooltipWidth + margin > windowWidth;

  // Setează poziția în funcție de overflow
  const leftPosition = wouldOverflowRight
    ? windowWidth - tooltipWidth - margin // Aliniază cu marginea dreaptă a ecranului
    : x + margin; // Poziție normală

  // Calculează poziția verticală (cu verificare similară pentru partea de sus/jos dacă e necesar)
  const y = coordinate?.y || 0;
  const windowHeight = window.innerHeight;
  const tooltipHeight = 500; // sau calculează dinamic dacă e necesar
  const wouldOverflowBottom = y + tooltipHeight > windowHeight;

  const topPosition = wouldOverflowBottom
    ? windowHeight - tooltipHeight - margin 
    : y - 200; 

  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};
  const tickets = data.tickets || [];
  const title =
    data.team_assigned_person || data.team || data.name || label || "N/A";
  const value = data.count || data[payload[0].dataKey] || 0;
  const percentage = data.perc || 0;
  const metCount = tickets.filter((t) => t.resolution === "Met").length;
  const inProgressCount = tickets.filter(
    (t) => t.resolution === "In Progress"
  ).length;
  const exceededCount = tickets.filter(
    (t) => t.resolution === "Exceeded"
  ).length;
  const totalCount = tickets.length;

  const projects = {};
  tickets.forEach((ticket) => {
    const project = ticket.project || "N/A";
    if (!projects[project]) {
      projects[project] = {
        count: 0,
        met: 0,
        exceeded: 0,
        open: 0,
        responseTimeSum: 0,
        tickets: [],
      };
    }
    projects[project].count++;
    if (ticket.resolution === "Met") projects[project].met++;
    else if (ticket.resolution === "Exceeded") projects[project].exceeded++;
    else projects[project].open++;

    if (ticket.response_time) {
      projects[project].responseTimeSum += ticket.response_time;
    }
    projects[project].tickets.push(ticket);
  });


  const projectsWithSla = Object.entries(projects).map(([project, stats]) => {
    const avgResponseTime =
      stats.count > 0 ? (stats.responseTimeSum / stats.count).toFixed(2) : 0;
    const slaCompliance =
      stats.count > 0 ? Math.round((stats.met / stats.count) * 100) : 0;

    return {
      project,
      ...stats,
      avgResponseTime,
      slaCompliance,
    };
  });

  const isStackedSla =
    Array.isArray(payload) &&
    payload.some((item) => item.name === "Met" || item.name === "Exceeded");

  const handleWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const delta = e.deltaY;

    if (
      (delta > 0 && scrollTop + clientHeight >= scrollHeight) ||
      (delta < 0 && scrollTop <= 0)
    ) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <div
      ref={scrollRef}
      style={{
        position: "fixed",
        top: `${Math.max(margin, topPosition)}px`, 
        left: `${Math.max(margin, leftPosition)}px`,
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        color: "#333",
        padding: "12px 16px",
        border: "1px solid #e1e1e1",
        borderRadius: "8px",
        fontSize: "14px",
        width: `${tooltipWidth}px`,
        maxHeight: "500px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transform: "scale(1)",
        transition: "transform 0.3s ease-in-out",
      }}
      onWheel={handleWheel}
    >
      {/* Header Section */}
      <div
        style={{
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "8px",
          marginBottom: "8px",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            margin: 0,
            fontSize: "15px",
            color: "#222",
          }}
        >
          {title}
        </p>

        {/* Afișăm întotdeauna cele 3 stări */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <p style={{ margin: 0, color: "#4CAF50" }}>
            <strong>Met:</strong> {metCount}
          </p>
          <p style={{ margin: 0, color: "#FF9800" }}>
            <strong>In Progress:</strong> {inProgressCount}
          </p>
          <p style={{ margin: 0, color: "#F44336" }}>
            <strong>Exceeded:</strong> {exceededCount}
          </p>
          <p style={{ margin: 0, color: "#666" }}>
            <strong>Total:</strong> {totalCount}
          </p>
        </div>
      </div>

      {/* Projects Summary Section with SLA Details */}
      {projectsWithSla.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <p
            style={{
              fontWeight: 500,
              margin: "0 0 6px 0",
              color: "#444",
            }}
          >
            Projects Summary (SLA Metrics):
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto auto",
              gap: "8px 12px",
              fontSize: "13px",
              overflowX: "auto",
            }}
          >
            <span style={{ fontWeight: 500, color: "#666" }}>Project</span>
            <span
              style={{ fontWeight: 500, color: "#666", textAlign: "right" }}
            >
              Total
            </span>
            <span
              style={{ fontWeight: 500, color: "#4CAF50", textAlign: "right" }}
            >
              Met
            </span>
            <span
              style={{ fontWeight: 500, color: "#F44336", textAlign: "right" }}
            >
              Exceeded
            </span>
            <span
              style={{ fontWeight: 500, color: "#666", textAlign: "right" }}
            >
              Avg Time
            </span>

            {projectsWithSla.map(
              ({
                project,
                count,
                met,
                exceeded,
                avgResponseTime,
                slaCompliance,
              }) => (
                <React.Fragment key={project}>
                  <span>{project}</span>
                  <span style={{ textAlign: "right" }}>{count}</span>
                  <span style={{ textAlign: "right", color: "#4CAF50" }}>
                    {met}
                  </span>
                  <span style={{ textAlign: "right", color: "#F44336" }}>
                    {exceeded}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {avgResponseTime}h
                    <br />
                    <span
                      style={{
                        color:
                          slaCompliance >= 90
                            ? "#4CAF50"
                            : slaCompliance >= 75
                            ? "#FF9800"
                            : "#F44336",
                        fontSize: "12px",
                      }}
                    >
                      ({slaCompliance}%)
                    </span>
                  </span>
                </React.Fragment>
              )
            )}
          </div>
        </div>
      )}

      {/* Tickets List Section */}
      {tickets.length > 0 ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          style={{
            overflowY: "auto",
            maxHeight: "200px",
            scrollbarWidth: "thin",
            paddingRight: "4px",
          }}
        >
          <p
            style={{
              fontWeight: 500,
              margin: "0 0 6px 0",
              color: "#444",
            }}
          >
            Individual Tickets:
          </p>
          <ul
            style={{
              padding: 0,
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {tickets.map((ticket) => (
              <li
                key={ticket.ticket_id}
                style={{
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "6px",
                  borderLeft: `3px solid ${
                    ticket.priority === "High"
                      ? "#F44336"
                      : ticket.priority === "Medium"
                      ? "#FF9800"
                      : ticket.priority === "Low"
                      ? "#4CAF50"
                      : "#4285F4"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "4px 12px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#666", fontWeight: 500 }}>ID:</span>
                  <span>{ticket.ticket_id}</span>

                  <span style={{ color: "#666", fontWeight: 500 }}>
                    Project:
                  </span>
                  <span>{ticket.project || "N/A"}</span>

                  <span style={{ color: "#666", fontWeight: 500 }}>
                    Priority:
                  </span>
                  <span>{ticket.priority || "N/A"}</span>

                  <span style={{ color: "#666", fontWeight: 500 }}>
                    Status:
                  </span>
                  <span
                    style={{
                      color:
                        ticket.resolution === "Met"
                          ? "#4CAF50"
                          : ticket.resolution === "Exceeded"
                          ? "#F44336"
                          : "#666",
                    }}
                  >
                    {ticket.resolution || "Open"}
                  </span>

                  {ticket.response_time && (
                    <>
                      <span style={{ color: "#666", fontWeight: 500 }}>
                        Response:
                      </span>
                      <span>{ticket.response_time}h</span>
                    </>
                  )}

                  {ticket.team_assigned_person && (
                    <>
                      <span style={{ color: "#666", fontWeight: 500 }}>
                        Team:
                      </span>
                      <span>{ticket.team_assigned_person}</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ color: "#666", fontStyle: "italic", margin: 0 }}>
          No tickets available for this category
        </p>
      )}
    </div>
  );
}

function CustomBarChart({
  title,
  data,
  dataKey,
  categoryKey = "priority",
  stacked = false,
  colors = [],
  showBothValues = false,
  totalCount,
  teamsByCategory = {},
  slaStatusByTeam = [],
  slaStatusByProject = [],
}) {
  const isEmpty = !data || data.length === 0;
  const defaultColors = ["#4299e1", "#48bb78", "#ed8936", "#f56565"];
  console.log("CustomBarChart data:", data);
  const fallbackData = [
    {
      [categoryKey]: "No Data",
      ...(Array.isArray(dataKey)
        ? dataKey.reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
        : { [dataKey]: 0 }),
    },
  ];

  return (
    <div>
      <p className="text-lg font-semibold text-black dark:text-white mb-4 text-center">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={isEmpty ? fallbackData : data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis
            dataKey={categoryKey}
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12, fill: "var(--text-color-secondary)" }}
            stroke="var(--text-color-secondary)"
          />
          <YAxis stroke="var(--text-color-secondary)" />
          <Tooltip
            content={
              <CustomTooltip
                teamsByCategory={teamsByCategory}
                slaStatusByTeam={slaStatusByTeam}
                slaStatusByProject={slaStatusByProject}
              />
            }
          />
          <Legend wrapperStyle={{ color: "var(--text-color-primary)" }} />

          {Array.isArray(dataKey) ? (
            // Afișare pentru graficele stacked (SLA Compliance)
            dataKey.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={
                  key === "Met"
                    ? "#4CAF50"
                    : key === "In Progress"
                    ? "#FF9800"
                    : "#F44336" // Exceeded
                }
              >
                <LabelList
                  dataKey={key}
                  position="top"
                  formatter={(value) => `${value}`}
                  style={{ fill: "#333", fontSize: 12, fontWeight: "bold" }}
                />
              </Bar>
            ))
          ) : (
            // Afișare pentru graficele simple (count/percentage)
            <Bar dataKey={dataKey} fill={colors[0] || defaultColors[0]}>
              {showBothValues && (
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  formatter={(value) => {
                    const total =
                      totalCount ||
                      data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
                    const percentage = total
                      ? Math.round((value / total) * 100)
                      : 0;
                    return `${value} (${percentage}%)`;
                  }}
                  style={{
                    fill: "#333",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CustomBarChart;
