import { mapSLAToMinutes } from "./const";

export function countBySlaStatus(data) {
    const today = new Date();

    const grouped = {
      "In progress": 0,
      Met: 0,
      Exceeded: 0,
    };

    data.forEach((ticket) => {
      const startDate = new Date(ticket.start_date.date.slice(0, -4));

      const slaHours = ticket.duration_hours;
      let slaMinutes = mapSLAToMinutes[slaHours];

      const closedDate = ticket.closed_date
        ? new Date(ticket.closed_date.date.slice(0, -4))
        : null;

    const diffMinutes = closedDate
      ? (closedDate - startDate) / 60000
      : (today - startDate) / 60000;

    if (!closedDate && diffMinutes < slaMinutes) {
      grouped["In progress"] += 1;
    } else if (closedDate && diffMinutes <= slaMinutes) {
      grouped["Met"] += 1;
    } else {
      grouped["Exceeded"] += 1;
    }
  });

  return Object.entries(grouped).map(([status, count]) => ({
    status,
    count,
  }));
}

export function countByTeamAssigned(tickets, SLAResolutionMandatory = false) {
  if (SLAResolutionMandatory) {
    const resolvedTickets = tickets.filter(
      (ticket) => getSLAResolution(ticket) === true
    );
    tickets = resolvedTickets;
  }


  const groupedDataNum = tickets.reduce((acc, ticket) => {
    if ("team_assigned_person" in ticket) {
      const team = ticket.team_assigned_person || "Neatribuit";
      acc[team] = (acc[team] || 0) + 1;
    } else {
      acc = [];
    }
    return acc;
  }, {});

  return Object.entries(groupedDataNum).map(([team, count]) => ({
    team,
    count,
  }));
}

export function ticketsBySLA(tickets) {
  let slaCount = {
    8: 0,
    40: 0,
    132: 0,
    4: 0,
  };

  tickets.forEach((ticket) => {
    if (
      ticket.duration_hours &&
      slaCount.hasOwnProperty(ticket.duration_hours)
    ) {
      slaCount[ticket.duration_hours] += 1;
    }
  });

  return Object.entries(slaCount).map(([status, count]) => ({
    status: status + "h",
      value: count,
  }));
}

export function getSLAResolution(ticket) {
  const today = new Date();
  const startDate = new Date(ticket.start_date.date.slice(0, -4));

  const slaHours = ticket.duration_hours;
  let slaMinutes = mapSLAToMinutes[slaHours];

  const closedDate = ticket.closed_date
    ? new Date(ticket.closed_date.date.slice(0, -4))
    : null;

  const diffMinutes = closedDate
    ? (closedDate - startDate) / 60000
    : (today - startDate) / 60000;

  if (closedDate && diffMinutes <= slaMinutes) {
    return true;
  }
  return false;
}

export function countByPriority(data, SLAResolutionMandatory = false) {
  if (SLAResolutionMandatory) {
    const resolvedTickets = data.filter(
      (ticket) => getSLAResolution(ticket) === true
    );
    data = resolvedTickets;
  }
  const groupedDataNum = data.reduce((acc, ticket) => {
    if ("priority" in ticket) {
      const priority = ticket.priority;
      acc[priority] = (acc[priority] || 0) + 1;
    } else {
      acc = [];
    }
    return acc;
  }, {});
  const counted = Object.entries(groupedDataNum).map(([priority, count]) => ({
    priority,
    count,
  }));
  const priorityOrder = ["Low", "Medium", "High", "Critical"];
  counted.sort(
    (a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );

  return counted;
}

export function getPercentsFromCounted(
  countedData,
  totalCount = null,
  key = "priority"
) {
  if (!totalCount) {
    totalCount = countedData.reduce((sum, item) => sum + item.count, 0);
  }
  const dataPerc = countedData.map((entry, idx) => {
    if (key in entry && "count" in entry) {
      return {
        [key]: entry[key],
        perc: (entry.count / totalCount) * 100,
      };
    }
    return {};
  });
  return dataPerc;
}

export function countByCreatedDateDaily(data) {
  const groupedDataDate = data.reduce((acc, ticket) => {
    if ("start_date" in ticket) {
      const start_date = ticket.start_date.date;
      const key = start_date.slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const counted = Object.entries(groupedDataDate)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([createdDate, count]) => {
      const date = new Date(createdDate);

      const formatted = date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        createdDate: formatted,
        count,
      };
    });

  return counted;
}

export function countByStatus(tickets) {
  // Lista completă de statusuri dorite
  const statuses = ["Open", "In Progress", "Closed", "Pending", "Resolved"];
  
  // Obiect pentru contorizare
  const count = {};
  statuses.forEach(status => count[status] = 0);

  tickets.forEach(ticket => {
    const status = ticket.status || "Unknown";
    if (count.hasOwnProperty(status)) {
      count[status] += 1;
    } else {
      // dacă apare un status nou necunoscut, îl adaugă
      count[status] = 1;
    }
  });

  // Transformă în array pentru grafice
  return Object.entries(count).map(([status, count]) => ({ status, count }));
}

export function calculateDiffMinutes(startDate, closedDate) {
  const diffMs = closedDate - startDate;

  const diffMinutes = Math.floor(diffMs / 60000);
  return diffMinutes;
}

export function countByCreatedDateWeekly(data) {
  const groupedDataDate = data.reduce((acc, ticket) => {
    if ("start_date" in ticket) {
      const start_date = ticket.start_date.date;
      const crDate = new Date(start_date.slice(0, -4));

      const startOfWeek = new Date(crDate);
      startOfWeek.setDate(crDate.getDate() - crDate.getDay());

      const weekKey = startOfWeek.toISOString().split("T")[0];

      acc[weekKey] = (acc[weekKey] || 0) + 1;
    }
    return acc;
  }, {});

  const counted = Object.entries(groupedDataDate)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([createdDate, count]) => {
      const startDate = new Date(createdDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const year = startDate.getFullYear();
      const options = { month: "short", day: "numeric" };

      const start = startDate.toLocaleDateString("en-US", options);
      const end = endDate.toLocaleDateString("en-US", options);

      return {
        createdDate: `${start}–${end}, ${year}`,
        count,
      };
    });

  return counted;
}

export function countByCreatedDateMonthly(data) {
  const groupedDataDate = new Map();

  data.forEach((ticket) => {
    if ("start_date" in ticket) {
      const start_date = ticket.start_date.date;
      const crDate = new Date(start_date.slice(0, -4));

      const key = crDate.toISOString().slice(0, 7);
      const display = crDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!groupedDataDate.has(key)) {
        groupedDataDate.set(key, { count: 0, display });
      }
      groupedDataDate.get(key).count += 1;
    }
  });

  const counted = Array.from(groupedDataDate.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([_, { count, display }]) => ({
      createdDate: display,
      count,
    }));

  return counted;
}

export const getSLAStatus = (data) => {
  const startDate = new Date(data.start_date.date.slice(0, -4));
  const slaMinutes = mapSLAToMinutes[data.duration_hours] || 0;
  const closedDate = data.closed_date
    ? new Date(data.closed_date.date.slice(0, -4))
    : null;

  if (!closedDate) {
    return "Exceeded";
  } else {
    const diffMinutes = (closedDate - startDate) / 60000;
    return diffMinutes <= slaMinutes ? "Met" : "Exceeded";
  }
};

export const countSLAOverTime = (
  tickets,
  timeUnit,
  filterKey = null,
  filterValue = null
) => {
  const filteredTickets =
    filterKey && filterValue
      ? tickets.filter((ticket) => ticket[filterKey] === filterValue)
      : tickets;

  const groupedData = {};

  filteredTickets.forEach((ticket) => {
    const ticketDate = new Date(ticket.start_date.date.slice(0, -4));
    let timeKey;

    if (timeUnit === "daily") {
      timeKey = ticketDate.toISOString().split("T")[0];
    } else if (timeUnit === "weekly") {
      const startOfWeek = new Date(ticketDate);
      startOfWeek.setDate(ticketDate.getDate() - ticketDate.getDay());
      timeKey = startOfWeek.toISOString().split("T")[0];
    } else if (timeUnit === "monthly") {
      timeKey = ticketDate.toISOString().slice(0, 7);
    }

    if (!groupedData[timeKey]) {
      groupedData[timeKey] = { Met: 0, Exceeded: 0, date: timeKey };
    }
    const status = getSLAStatus(ticket);
    groupedData[timeKey][status]++;
  });

  const result = Object.values(groupedData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  result.forEach((item) => {
    if (!item.Met) item.Met = 0;
    if (!item.Exceeded) item.Exceeded = 0;
  });

  if (timeUnit === "daily") {
    result.forEach((item) => {
      const date = new Date(item.date);
      item.date = date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    });
  } else if (timeUnit === "weekly") {
    result.forEach((item) => {
      const startDate = new Date(item.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      const start = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      item.date = `${start} - ${end}`;
    });
  } else if (timeUnit === "monthly") {
    result.forEach((item) => {
      const date = new Date(item.date);
      item.date = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    });
  }
  return result;
};
// --------------------------------

// Additional helper functions for fct.js
export function countByProject(tickets, slaOnly = false) {
  const counts = {};

  tickets.forEach((ticket) => {
    if (!slaOnly || (ticket.closed_date && ticket.duration_hours)) {
      const project = ticket.project || "Unassigned";
      counts[project] = (counts[project] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([project, count]) => ({
    project,
    count,
  }));
}

// Add these functions to your existing fct.js helpers

/**
 * Calculate SLA status (Met/Exceeded) for tickets grouped by specified field
 */
export function calculateSlaStatus(tickets, groupByField) {
  const result = {};

  tickets.forEach((ticket) => {
    if (!ticket.closed_date || !ticket.duration_hours) return;

    const groupValue = ticket[groupByField] || "Unassigned";
    const created = new Date(ticket.start_date.date);
    const closed = new Date(ticket.closed_date.date);
    const hoursToResolve = (closed - created) / (1000 * 60 * 60);
    const status = hoursToResolve <= ticket.duration_hours ? "Met" : "Exceeded";

    if (!result[groupValue]) {
      result[groupValue] = { Met: 0, Exceeded: 0 };
    }
    result[groupValue][status]++;
  });

  return Object.entries(result).map(([name, counts]) => ({
    name,
    ...counts,
  }));
}

/**
 * Convert counts to percentages for SLA status data
 */
export function convertSlaStatusToPercentages(data) {
  return data.map((item) => {
    const total = item.Met + item.Exceeded;
    return {
      name: item.name,
      Met: total > 0 ? Math.round((item.Met / total) * 100) : 0,
      Exceeded: total > 0 ? Math.round((item.Exceeded / total) * 100) : 0,
    };
  });
}
