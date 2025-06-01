import React, { useRef } from "react";

function ticketItem(ticket) {
  return <li
    key={ticket.ticket_id}
    style={{
      padding: "10px",
      backgroundColor: "#f9f9f9",
      borderRadius: "6px",
      borderLeft: `3px solid ${ticket.priority === "High"
        ? "orange"
        : ticket.priority === "Medium"
          ? "#ffd84d"
          : ticket.priority === "Low"
            ? "blue"
            : "red"
        }`,
        marginBottom: "20px"
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
}

function CustomTooltip({ active, payload, displayLabel, label, showPercentage, coordinate, buttonCallback }) {
  const scrollRef = useRef(null);
  const tooltipWidth = 550;
  const margin = 400;

  const x = coordinate?.x || 0;
  const windowWidth = window.innerWidth;

  // Determină dacă tooltipul ar ieși în afara ecranului
  const wouldOverflowRight = x + tooltipWidth + margin > windowWidth;

  const leftPosition = wouldOverflowRight
    ? x - margin
    : x + margin;
  const y = coordinate?.y || 0;
  const windowHeight = window.innerHeight;
  const tooltipHeight = 0;
  const wouldOverflowBottom = y + tooltipHeight > windowHeight;

  const topPosition = wouldOverflowBottom
    ? windowHeight
    : y;

  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};
  const startedTickets = data.startedTickets || []
  const closedTickets = data.closedTickets || []
  const metTickets = data.metTickets || []
  const exceededTickets = data.exceededTickets || []
  const tickets = data.tickets || [];
  // const value = data.count || data[payload[0].dataKey] || 0;
  // const percentage = data.perc || 0;
  // const metCount = tickets.filter((t) => t.resolution === "Met").length;
  // const inProgressCount = tickets.filter(
  //   (t) => t.resolution === "In Progress"
  // ).length;
  // const exceededCount = tickets.filter(
  //   (t) => t.resolution === "Exceeded"
  // ).length;
  // const totalCount = tickets.length;
  // const topMargin = 200

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


  // const projectsWithSla = Object.entries(projects).map(([project, stats]) => {
  //   const avgResponseTime =
  //     stats.count > 0 ? (stats.responseTimeSum / stats.count).toFixed(2) : 0;
  //   const slaCompliance =
  //     stats.count > 0 ? Math.round((stats.met / stats.count) * 100) : 0;

  //   return {
  //     project,
  //     ...stats,
  //     avgResponseTime,
  //     slaCompliance,
  //   };
  // });

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
        pointerEvents: "auto",
        position: "fixed",
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        color: "#333",
        padding: "12px 16px",
        border: "1px solid #e1e1e1",
        borderRadius: "8px",
        fontSize: "14px",
        width: `${tooltipWidth}px`,
        maxHeight: "700px",
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p
            style={{
              fontWeight: 600,
              margin: 0,
              fontSize: "15px",
              color: "#222",
            }}
          >
            {displayLabel}{" "}{label}
          </p>
          <button style={{ fontWeight: "bold", fontSize: "16px", color: "red" }} onClick={() => { buttonCallback() }}>X</button>
        </div>
      </div>

      {/* Afișăm întotdeauna cele 3 stări */}
      {/* <div
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
      </div> */}

      {/* Projects Summary Section with SLA Details */}
      {/* {projectsWithSla.length > 0 && (
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
      )} */}

      {/* Tickets List Section */}
      {startedTickets.length > 0 || closedTickets.length > 0 || tickets.length > 0 || metTickets.length > 0 || exceededTickets.length > 0 ? (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          style={{
            overflowY: "auto",
            maxHeight: "600px",
            scrollbarWidth: "thin",
            paddingRight: "4px",
          }}
        >
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
            {tickets.length ?
              (tickets.map((ticket) => (
                ticketItem(ticket)
              )))
              :
              (startedTickets.length || closedTickets.length ?
                (<>
                  {startedTickets.length ?
                    <div>
                      <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Started tickets:</p>
                      {startedTickets.map((ticket) => (
                        ticketItem(ticket)
                      ))}
                    </div> : <></>}
                  {closedTickets.length ?
                    <div>
                      <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Closed tickets:</p>
                      {closedTickets.map((ticket) => (
                        ticketItem(ticket)
                      ))}
                    </div>
                    : <></>}
                </>
                ) : (
                  metTickets.length || exceededTickets.length ?(<>
                  {metTickets.length ?
                    <div>
                      <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Met SLA tickets:</p>
                      {metTickets.map((ticket) => (
                        ticketItem(ticket)
                      ))}
                    </div> : <></>}
                  {exceededTickets.length ?
                    <div>
                      <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Exceeded SLA tickets:</p>
                      {exceededTickets.map((ticket) => (
                        ticketItem(ticket)
                      ))}
                    </div>
                    : <></>}
                </>
                ) 
                    : <></>
                )
              )
            }
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

export default CustomTooltip;
