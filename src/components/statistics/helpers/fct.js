import { mapSLAToMinutes } from "./const";

export function countBySlaStatus(data) {
  const today = new Date();

  const grouped = {
    "In progress": { count: 0, tickets: [] },
    Met: { count: 0, tickets: [] },
    Exceeded: { count: 0, tickets: [] },
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

    let status;
    if (!closedDate && diffMinutes < slaMinutes) {
      status = "In progress";
    } else if (closedDate && diffMinutes <= slaMinutes) {
      status = "Met";
    } else {
      status = "Exceeded";
    }

    grouped[status].count += 1;
    grouped[status].tickets.push(ticket);
  });

  return Object.entries(grouped).map(([status, { count, tickets }]) => ({
    status,
    count,
    tickets,
  }));
}

export function countByTeamAssigned(tickets, SLAResolutionMandatory = false) {
  if (SLAResolutionMandatory) {
    tickets = tickets.filter(ticket => getSLAResolution(ticket) === true);
  }

  const groupedData = tickets.reduce((acc, ticket) => {
    if ("team_assigned_person" in ticket) {
      const team = ticket.team_assigned_person || "Neatribuit";
      if (!acc[team]) {
        acc[team] = { count: 0, tickets: [] };
      }
      acc[team].count += 1;
      acc[team].tickets.push(ticket);
    }
    return acc;
  }, {});

  return Object.entries(groupedData).map(([team, { count, tickets }]) => ({
    team,
    count,
    tickets,
  }));
}

export function ticketsBySLA(tickets) {
  let slaCount = {
    8: { count: 0, tickets: [] },
    40: { count: 0, tickets: [] },
    132: { count: 0, tickets: [] },
    4: { count: 0, tickets: [] },
  };

  tickets.forEach(ticket => {
    if (ticket.duration_hours && slaCount.hasOwnProperty(ticket.duration_hours)) {
      slaCount[ticket.duration_hours].count += 1;
      slaCount[ticket.duration_hours].tickets.push(ticket);
    }
  });

  return Object.entries(slaCount).map(([status, { count, tickets }]) => ({
    status: status + "h",
    value: count,
    tickets,
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

  const groupedData = data.reduce((acc, ticket) => {
    if ("priority" in ticket) {
      const priority = ticket.priority;
      if (!acc[priority]) {
        acc[priority] = { count: 0, tickets: [] };
      }
      acc[priority].count += 1;
      acc[priority].tickets.push(ticket);
    }
    return acc;
  }, {});

  const counted = Object.entries(groupedData).map(([priority, { count, tickets }]) => ({
    priority,
    count,
    tickets,
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

export function countByStatus(tickets) {
  // Lista completă de statusuri dorite
  const statuses = ["Open", "In Progress", "Closed", "Pending", "Resolved"];

  // Obiect pentru contorizare și colectare ticket-uri
  const count = {};
  const ticketsByStatus = {};

  statuses.forEach(status => {
    count[status] = 0;
    ticketsByStatus[status] = [];
  });

  tickets.forEach(ticket => {
    const status = ticket.status || "Unknown";
    if (!count.hasOwnProperty(status)) {
      count[status] = 0;
      ticketsByStatus[status] = [];
    }
    count[status] += 1;
    ticketsByStatus[status].push(ticket);
  });

  // Transformă în array pentru grafice, adăugând și lista de tickets
  return Object.entries(count).map(([status, count]) => ({
    status,
    count,
    tickets: ticketsByStatus[status],
  }));
}


export function calculateDiffMinutes(startDate, closedDate) {
  const diffMs = closedDate - startDate;

  const diffMinutes = Math.floor(diffMs / 60000);
  return diffMinutes;
}

export function countByStartedClosedDateDaily(data) {
  const startMap = {};
  const closedMap = {};

  data.forEach(ticket => {
    if (ticket.start_date?.date) {
      const date = ticket.start_date.date.slice(0, 10);
      if (!startMap[date]) {
        startMap[date] = { count: 0, tickets: [] };
      }
      startMap[date].count += 1;
      startMap[date].tickets.push(ticket);
    }

    if (ticket.closed_date?.date) {
      const date = ticket.closed_date.date.slice(0, 10);
      if (!closedMap[date]) {
        closedMap[date] = { count: 0, tickets: [] };
      }
      closedMap[date].count += 1;
      closedMap[date].tickets.push(ticket);
    }
  });

  const allDates = new Set([
    ...Object.keys(startMap),
    ...Object.keys(closedMap),
  ]);

  const counted = Array.from(allDates)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(dateStr => {
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        date: formatted,
        startCount: startMap[dateStr]?.count || 0,
        startedTickets: startMap[dateStr]?.tickets || [],
        closedCount: closedMap[dateStr]?.count || 0,
        closedTickets: closedMap[dateStr]?.tickets || [],
      };
    });

  return counted;
}

export function countByStartedClosedDateWeekly(data) {
  const startMap = {};
  const closedMap = {};

  const getWeekKey = (rawDate) => {
    const date = new Date(rawDate.slice(0, -4));
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday start
    return startOfWeek.toISOString().split("T")[0];
  };

  for (const ticket of data) {
    if (ticket.start_date?.date) {
      const key = getWeekKey(ticket.start_date.date);
      startMap[key] = startMap[key] || [];
      startMap[key].push(ticket);
    }
    if (ticket.closed_date?.date) {
      const key = getWeekKey(ticket.closed_date.date);
      closedMap[key] = closedMap[key] || [];
      closedMap[key].push(ticket);
    }
  }

  const allWeeks = new Set([...Object.keys(startMap), ...Object.keys(closedMap)]);

  return Array.from(allWeeks)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((weekStart) => {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const options = { month: "short", day: "numeric" };
      const formatted = `${startDate.toLocaleDateString("en-US", options)}–${endDate.toLocaleDateString("en-US", options)}, ${startDate.getFullYear()}`;

      const startedTickets = startMap[weekStart] || [];
      const closedTickets = closedMap[weekStart] || [];

      return {
        date: formatted,
        startCount: startedTickets.length,
        closedCount: closedTickets.length,
        startedTickets,
        closedTickets,
      };
    });
}

export function countByStartedClosedDateMonthly(data) {
  const startMap = new Map();
  const closedMap = new Map();

  const getMonthKey = (rawDate) => {
    const date = new Date(rawDate.slice(0, -4));
    return date.toISOString().slice(0, 7); // "YYYY-MM"
  };

  for (const ticket of data) {
    if (ticket.start_date?.date) {
      const key = getMonthKey(ticket.start_date.date);
      if (!startMap.has(key)) startMap.set(key, []);
      startMap.get(key).push(ticket);
    }
    if (ticket.closed_date?.date) {
      const key = getMonthKey(ticket.closed_date.date);
      if (!closedMap.has(key)) closedMap.set(key, []);
      closedMap.get(key).push(ticket);
    }
  }

  const allMonths = new Set([...startMap.keys(), ...closedMap.keys()]);

  return Array.from(allMonths)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((monthKey) => {
      const date = new Date(`${monthKey}-01`);
      const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      const startedTickets = startMap.get(monthKey) || [];
      const closedTickets = closedMap.get(monthKey) || [];

      return {
        date: formatted,
        startCount: startedTickets.length,
        closedCount: closedTickets.length,
        startedTickets,
        closedTickets,
      };
    });
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
      groupedData[timeKey] = {
        Met: 0,
        Exceeded: 0,
        metTickets: [],
        exceededTickets: [],
        date: timeKey,
      };
    }

    const status = getSLAStatus(ticket);
    if (status === "Met") {
      groupedData[timeKey].Met++;
      groupedData[timeKey].metTickets.push(ticket);
    } else if (status === "Exceeded") {
      groupedData[timeKey].Exceeded++;
      groupedData[timeKey].exceededTickets.push(ticket);
    }
  });

  const result = Object.values(groupedData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Formatting dates based on time unit
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
    const started = new Date(ticket.start_date.date);
    const closed = new Date(ticket.closed_date.date);
    const hoursToResolve = (closed - started) / (1000 * 60 * 60);
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

// Funcție generică care grupează ticket-urile după orice categorie
export function prepareDataWithTicketsByCategory(tickets, categoryKey) {
  const grouped = {};

  tickets.forEach((ticket) => {
    const categoryValue = ticket[categoryKey] || "N/A";
    if (!grouped[categoryValue])
      grouped[categoryValue] = {
        [categoryKey]: categoryValue,
        count: 0,
        tickets: [],
      };
    grouped[categoryValue].count += 1;
    grouped[categoryValue].tickets.push(ticket);
  });

  return Object.values(grouped);
}

export function normalizeTickets(tickets) {
  const normalizedTickets = tickets.map(ticket => ({
    priority: ticket.priority || "N/A",
    team_assigned_person: ticket.team_assigned_person || "Unassigned",
    project: ticket.project || "Unassigned",
    response_time: ticket.response_time, // poate fi null
    closed_date: ticket.closed_date,
    duration_hours: ticket.duration_hours || 0, // asigură-te că ai acest câmp din backend, altfel pune 0
    // Păstrează și celelalte câmpuri dacă e nevoie
    ...ticket,
  }));
  return normalizedTickets
}