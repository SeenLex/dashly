import { useRef } from "react";
import {exportTooltipTicketsToCSV} from "../exportCSV"
// --- MODIFIED TICKET ITEM FUNCTION ---
function ticketItem(ticket) {
  return <li
    key={ticket.id} // Assuming 'id' is still unique and present for the key
    style={{
      padding: "10px",
      backgroundColor: "#f9f9f9",
      borderRadius: "6px",
      // Use ticket.priority_name for color logic
      borderLeft: `3px solid ${ticket.priority_name === "High"
        ? "orange"
        : ticket.priority_name === "Medium"
          ? "#ffd84d"
          : ticket.priority_name === "Low"
            ? "blue"
            : "red" // Assuming "Critical" or other defaults to red
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
      <span>{ticket.ticket_id ?? 'N/A'}</span> {/* Use nullish coalescing for safety */}

      <span style={{ color: "#666", fontWeight: 500 }}>
        Project:
      </span>
      {/* --- CHANGE HERE: Use project_name --- */}
      <span>{ticket.project_name ?? "N/A"}</span>

      <span style={{ color: "#666", fontWeight: 500 }}>
        Priority:
      </span>
      {/* --- CHANGE HERE: Use priority_name --- */}
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
                : "#666", // Default color for "Open" or other statuses
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

      {ticket.team_assigned_person_name && ( // Check for the new name property
        <>
          <span style={{ color: "#666", fontWeight: 500 }}>
            Team:
          </span>
          {/* --- CHANGE HERE: Use team_assigned_person_name --- */}
          <span>{ticket.team_assigned_person_name}</span>
        </>
      )}
      {/* If you also want to show the 'Created By' team: */}
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

// --- CustomTooltip component remains largely the same, but now feeds correct data to ticketItem ---
function CustomTooltip({ active, payload, displayLabel, label, showPercentage, coordinate, buttonCallback }) {
  const scrollRef = useRef(null);
  const tooltipWidth = 550;
  const margin = 20; // Changed from 400 to 20 to reduce the side offset.

  const x = coordinate?.x || 0;
  const windowWidth = window.innerWidth;

  // Determine if tooltip would overflow right
  const wouldOverflowRight = x + tooltipWidth + margin > windowWidth;

  const leftPosition = wouldOverflowRight
    ? x - tooltipWidth - margin // Adjusted to prevent overflow to the left if it overflows right
    : x + margin;
  const y = coordinate?.y || 0;
  const windowHeight = window.innerHeight;
  // Estimate tooltip height, or calculate dynamically if needed. For now, assume it expands.
  // The 'maxHeight' property will control actual height, but for positioning 'tooltipHeight' needs to be somewhat accurate
  const tooltipHeight = 0; // This value is not used for topPosition calculation directly for dynamic height

  // Check if tooltip would overflow bottom
  const wouldOverflowBottom = y + tooltipHeight > windowHeight; // This logic might need refinement if tooltipHeight is dynamic

  // For `topPosition`, it's common to place it slightly above or below the cursor.
  // Given your click-trigger, `y` might be a good starting point.
  // If `maxHeight` is fixed, you could subtract that if `wouldOverflowBottom` is true.
  // Let's simplify for now assuming scroll will handle internal overflow, or `maxHeight` prevents external overflow.
  const topPosition = y;


  if (!(active && payload && payload.length)) return null;

  const data = payload[0].payload || {};

  // Ensure these properties exist and default to empty arrays if not
  const startedTickets = data.startedTickets || [];
  const closedTickets = data.closedTickets || [];
  const metTickets = data.metTickets || [];
  const exceededTickets = data.exceededTickets || [];
  const tickets = data.tickets || []; // This is the main array from get_tickets_by_priority.php
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
        maxHeight: "700px", // Controls vertical scroll
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transform: "scale(1)",
        transition: "transform 0.3s ease-in-out",
      }}
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
            {displayLabel}{" "}{label ?? payload[0].name ?? ""}
          </p>
          <button style={{ fontWeight: "bold", fontSize: "16px", color: "red", cursor: "pointer", background: "none", border: "none" }} onClick={() => { buttonCallback() }}>X</button>
        </div>
      </div>
<button
  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
  onClick={() => {
    // Create a safe filename
    let name = displayLabel || "Tickets";
    if (label) {
      name += ` ${label}`;
    } else if (payload[0]?.name) {
      name += ` ${payload[0].name}`;
    }
    
    // Remove invalid filename characters and trim
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


      {/* Tickets List Section */}
      {tickets.length > 0 || startedTickets.length > 0 || closedTickets.length > 0 || metTickets.length > 0 || exceededTickets.length > 0 ? (
        <div
          ref={scrollRef}
          style={{
            overflowY: "auto",
            maxHeight: "600px", // Allows scrolling for long lists
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
            {/* Logic to render tickets based on which array has data */}
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                // Passing the ticket object to the ticketItem function
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
            ) : null // Should not reach here if the outer condition is met
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