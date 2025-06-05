export const exportChartSectionToCSV = ({ title, data, ticketsKey }) => {
  const separator = ",";
  let csvContent = "";
  const filename = `${title}.csv`;

  if (!data || data.length === 0) {
    console.warn(`No data to export for ${title}`);
    return;
  }

  
  csvContent += `=== ${title} ===\n`;

  
  if (ticketsKey) {

    const allTickets = data.flatMap(item => item[ticketsKey] || []);
    
    if (allTickets.length === 0) {
      console.warn(`No tickets to export for ${title}`);
      return;
    }

 
    const allKeys = new Set();
    allTickets.forEach(ticket => {
      Object.keys(ticket).forEach(key => allKeys.add(key));
    });

 
    const keys = Array.from(allKeys).filter(key => 
      !['date', 'timezone_type', 'timezone'].includes(key)
    );

 
    csvContent += keys.join(separator) + "\n";


    csvContent += allTickets
      .map(ticket => {
        return keys.map(key => {
          let value = ticket[key];
          
          
          if (value && typeof value === 'object' && value.date) {
            value = value.date;
          }
          
      
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(separator)) {
              value = `"${value}"`;
            }
          }
          
        return value ?? "";

        }).join(separator);
      })
      .join("\n");
     } else {
    
    const possibleTicketsKey = Object.keys(data[0]).find(key => Array.isArray(data[0][key]));
    if (possibleTicketsKey) {
      const allTickets = data.flatMap(item => item[possibleTicketsKey] || []);

      if (allTickets.length === 0) {
        console.warn(`No tickets found in field "${possibleTicketsKey}" for ${title}`);
        return;
      }

      const allKeys = new Set();
      allTickets.forEach(ticket => Object.keys(ticket).forEach(key => allKeys.add(key)));
      const keys = Array.from(allKeys).filter(key =>
        !["date", "timezone_type", "timezone"].includes(key)
      );

      csvContent += keys.join(separator) + "\n";

      allTickets.forEach(ticket => {
        const row = keys.map(key => {
          let value = ticket[key];
          if (value && typeof value === "object" && value.date) value = value.date;
          if (typeof value === "object" && value !== null) value = JSON.stringify(value);
          if (typeof value === "string") {
            value = value.replace(/"/g, '""');
            if (value.includes(separator)) value = `"${value}"`;
          }
          return value ?? "";

        }).join(separator);
        csvContent += row + "\n";
      });
    } else {
     
      const keys = Object.keys(data[0]);
      csvContent += keys.join(separator) + "\n";
      csvContent += data
        .map(item => {
          return keys.map(key => {
            let value = item[key];
            if (typeof value === "object" && value !== null) value = JSON.stringify(value);
            if (typeof value === "string") {
              value = value.replace(/"/g, '""');
              if (value.includes(separator)) value = `"${value}"`;
            }
           return value ?? "";

          }).join(separator);
        })
        .join("\n");
    }
  }


  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const exportTicketsPerDayToCSV = (section, filename = "tickets_per_day.csv") => { 
  const separator = ",";
  let csvContent = "";

  section.data.forEach(dayItem => {
    csvContent += `\n=== ${dayItem.date} ===\n`;

   
    csvContent += "\n-- Started Tickets --\n";
    const startedTickets = dayItem.startedTickets || [];
    if (startedTickets.length === 0) {
      csvContent += "No tickets\n";
    } else {
      const startedKeys = new Set();
      startedTickets.forEach(ticket => Object.keys(ticket).forEach(k => startedKeys.add(k)));
      const keysArr = Array.from(startedKeys).filter(k => !['date', 'timezone_type', 'timezone'].includes(k));
      csvContent += keysArr.join(separator) + "\n";
      startedTickets.forEach(ticket => {
        const row = keysArr.map(key => {
          let val = ticket[key];
          if (val && typeof val === 'object' && val.date) val = val.date;
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          if (typeof val === 'string') {
            val = val.replace(/"/g, '""');
            if (val.includes(separator)) val = `"${val}"`;
          }
          return val ?? "";

        }).join(separator);
        csvContent += row + "\n";
      });
    }

    
    csvContent += "\n-- Closed Tickets --\n";
    const closedTickets = dayItem.closedTickets || [];
    if (closedTickets.length === 0) {
      csvContent += "No tickets\n";
    } else {
      const closedKeys = new Set();
      closedTickets.forEach(ticket => Object.keys(ticket).forEach(k => closedKeys.add(k)));
      const keysArr = Array.from(closedKeys).filter(k => !['date', 'timezone_type', 'timezone'].includes(k));
      csvContent += keysArr.join(separator) + "\n";
      closedTickets.forEach(ticket => {
        const row = keysArr.map(key => {
          let val = ticket[key];
          if (val && typeof val === 'object' && val.date) val = val.date;
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          if (typeof val === 'string') {
            val = val.replace(/"/g, '""');
            if (val.includes(separator)) val = `"${val}"`;
          }
          return val ?? "";
        }).join(separator);
        csvContent += row + "\n";
      });
    }
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const exportTooltipTicketsToCSV = ({
  tickets = [],
  startedTickets = [],
  closedTickets = [],
  metTickets = [],
  exceededTickets = [],
  filename = "tooltip_tickets.csv"
}) => {
  const separator = ",";
  let csvContent = "";

 
  const processTicketGroup = (groupName, ticketList) => {
    if (!ticketList || ticketList.length === 0) return;

   
    if (csvContent.length > 0) {
      csvContent += `\n\n=== ${groupName} ===\n`;
    } else {
      csvContent += `=== ${groupName} ===\n`;
    }

    
    const sampleTicket = ticketList.reduce((prev, current) => 
      Object.keys(prev).length > Object.keys(current).length ? prev : current
    );
    const keys = Object.keys(sampleTicket).filter(
      key => !["date", "timezone_type", "timezone"].includes(key)
    );

    
    csvContent += keys.join(separator) + "\n";

  
    ticketList.forEach(ticket => {
      const row = keys.map(key => {
        let value = ticket[key];

        if (value && typeof value === "object") {
          if (value.date) {
            value = value.date;
          } else {
            value = JSON.stringify(value);
          }
        }
        
        if (value === undefined || value === null) {
          return "";
        }

        if (typeof value === "string") {
          value = value.replace(/"/g, '""');
          if (value.includes(separator)) {
            value = `"${value}"`;
          }
        }

        return value;
      }).join(separator);

      csvContent += row + "\n";
    });
  };

  
  if (tickets.length > 0) processTicketGroup("All Tickets", tickets);
  if (startedTickets.length > 0) processTicketGroup("Started Tickets", startedTickets);
  if (closedTickets.length > 0) processTicketGroup("Closed Tickets", closedTickets);
  if (metTickets.length > 0) processTicketGroup("Met SLA Tickets", metTickets);
  if (exceededTickets.length > 0) processTicketGroup("Exceeded SLA Tickets", exceededTickets);

  if (csvContent.length === 0) {
    csvContent = "No ticket data available for export";
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
