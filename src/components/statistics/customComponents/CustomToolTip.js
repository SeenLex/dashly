import { useRef } from "react";
import {exportTooltipTicketsToCSV} from "../exportCSV"

function ticketItem(ticket) {
  return <li
    key={ticket.id} 
    style={{
      padding: "10px",
      backgroundColor: "#f9f9f9",
      borderRadius: "6px",

      borderLeft: `3px solid ${ticket.priority_name === "High"
        ? "orange"
        : ticket.priority_name === "Medium"
          ? "#ffd84d"
          : ticket.priority_name === "Low"
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
      <span>{ticket.ticket_id ?? 'N/A'}</span> 

      <span style={{ color: "#666", fontWeight: 500 }}>
        Project:
      </span>
     
      <span>{ticket.project_name ?? "N/A"}</span>

      <span style={{ color: "#666", fontWeight: 500 }}>
        Priority:
      </span>
   
      <span>{ticket.priority_name ?? "N/A"}</span>

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
        {ticket.status ?? "N/A"}
      </span>

      {ticket.response_time && (
        <>
          <span style={{ color: "#666", fontWeight: 500 }}>
            Response:
          </span>
          <span>{ticket.response_time}h</span>
        </>
      )}

      {ticket.team_assigned_person_name && ( 
        <>
          <span style={{ color: "#666", fontWeight: 500 }}>
            Team:
          </span>
  
          <span>{ticket.team_assigned_person_name}</span>
        </>
      )}
     
      {ticket.team_created_by_name && (
        <>
          <span style={{ color: "#666", fontWeight: 500 }}>
            Created By:
          </span>
          <span>{ticket.team_created_by_name}</span>
        </>
      )}
    </div>
  </li>
}


function CustomTooltip({ active, payload, displayLabel, label, showPercentage, coordinate, buttonCallback }) {
  const scrollRef = useRef(null);
  const tooltipWidth = 550;
  const margin = 20; 

  const x = coordinate?.x || 0;
  const windowWidth = window.innerWidth;

  
  const wouldOverflowRight = x + tooltipWidth + margin > windowWidth;

  const leftPosition = wouldOverflowRight
    ? x - tooltipWidth - margin 
    : x + margin;
  const y = coordinate?.y || 0;
  const windowHeight = window.innerHeight;

  const tooltipHeight = 0;


  const wouldOverflowBottom = y + tooltipHeight > windowHeight; 


  const topPosition = y;


  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};

 
  const startedTickets = data.startedTickets || [];
  const closedTickets = data.closedTickets || [];
  const metTickets = data.metTickets || [];
  const exceededTickets = data.exceededTickets || [];
  const tickets = data.tickets || [];
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
    >
    
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
            {displayLabel}{" "}{label ?? payload[0].name ?? ""}
          </p>
          <button style={{ fontWeight: "bold", fontSize: "16px", color: "red", cursor: "pointer", background: "none", border: "none" }} onClick={() => { buttonCallback() }}>X</button>
        </div>
      </div>
<button
  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
  onClick={() => {
 
    let name = displayLabel || "Tickets";
    if (label) {
      name += ` ${label}`;
    } else if (payload[0]?.name) {
      name += ` ${payload[0].name}`;
    }
    
    const safeFilename = name
      .replace(/[\\/:*?"<>|]/g, "")
      .trim() + ".csv";

    exportTooltipTicketsToCSV({
      tickets,
      startedTickets,
      closedTickets,
      metTickets,
      exceededTickets,
      filename: safeFilename
    });
  }}
>
  Descarcă CSV
</button>


     
      {tickets.length > 0 || startedTickets.length > 0 || closedTickets.length > 0 || metTickets.length > 0 || exceededTickets.length > 0 ? (
        <div
          ref={scrollRef}
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
            
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                
                ticketItem(ticket)
              ))
            ) : (startedTickets.length > 0 || closedTickets.length > 0) ? (
              <>
                {startedTickets.length > 0 && (
                  <div>
                    <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Started tickets:</p>
                    {startedTickets.map((ticket) => (
                      ticketItem(ticket)
                    ))}
                  </div>
                )}
                {closedTickets.length > 0 && (
                  <div>
                    <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Closed tickets:</p>
                    {closedTickets.map((ticket) => (
                      ticketItem(ticket)
                    ))}
                  </div>
                )}
              </>
            ) : (metTickets.length > 0 || exceededTickets.length > 0) ? (
              <>
                {metTickets.length > 0 && (
                  <div>
                    <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Met SLA tickets:</p>
                    {metTickets.map((ticket) => (
                      ticketItem(ticket)
                    ))}
                  </div>
                )}
                {exceededTickets.length > 0 && (
                  <div>
                    <p className="text-md font-bold" style={{ marginBottom: "20px" }}>Exceeded SLA tickets:</p>
                    {exceededTickets.map((ticket) => (
                      ticketItem(ticket)
                    ))}
                  </div>
                )}
              </>
            ) : null 
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