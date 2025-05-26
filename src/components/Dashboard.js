import { useState, useEffect, useCallback, useRef } from "react";
import StatsCards from "./StatsCards";
import TicketList from "./TicketList";

export default function Dashboard() {
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, closed: 0, avgTime: 0 });
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const role = localStorage.getItem("role");    
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
    project: "",
    assigned_person: "",
    dateFrom: "",
    dateTo: "",
    ticket_id: "",
    created_by: ""
  });

  const typingTimeoutRef = useRef(null);
  const fetchController = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);

    if (fetchController.current) {
      fetchController.current.abort();
    }

    const controller = new AbortController();
    fetchController.current = controller;

    // Fetch statistics
    fetch(`http://localhost/tickets-api/dashboard_stats.php?period=${period}`, {
      signal: controller.signal
    })
      .then((res) => res.json())
      .then((statsData) => {
        setStats(statsData.stats || { total: 0, closed: 0, avgTime: 0 });

        // Build ticket query params
        const query = {
          page: currentPage,
          limit: ticketsPerPage,
          period
        };
        for (const key in filters) {
          if (filters[key] && filters[key].trim() !== "") {
            query[key] = filters[key];
          }
        }

        const queryParams = new URLSearchParams(query).toString();

        // Fetch tickets
        return fetch(`http://localhost/tickets-api/tickets.php?${queryParams}`, {
          signal: controller.signal
        });
      })
      .then((res) => {
        if (!res.ok) {
          console.warn("⚠️ tickets.php responded with status", res.status);
          return { tickets: [], totalCount: 0 };
        }
        return res.json();
      })
      .then((ticketsData) => {
        setTickets(ticketsData.tickets || []);
        setTotalPages(Math.ceil((ticketsData.totalCount || 0) / ticketsPerPage));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ Fetch error:", err);
        }
      })
      .finally(() => setLoading(false));
  }, [period, currentPage, ticketsPerPage, filters]);

  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(fetchData, 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [filters, period, ticketsPerPage, currentPage, fetchData]);

  const handleDeleteTicket = (ticketId) => {
    if (!window.confirm("Sigur dorești să ștergi acest ticket?")) return;
    fetch(`http://localhost/tickets-api/delete_ticket.php?id=${ticketId}`, {
      method: "DELETE"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Ticket șters!");
          fetchData();
        } else {
          alert("Eroare la ștergere.");
        }
      })
      .catch((err) => {
        console.error("Eroare ștergere:", err);
        alert("Eroare server!");
      });
  };

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* Period selector */}
      <div className="flex justify-center gap-4 mb-8">
        {["day", "week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-4 py-2 text-sm rounded-full ${
              period === p
                ? "bg-blue-600 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            }`}
          >
            {p === "day" ? "Azi" : p === "week" ? "Săptămână" : p === "month" ? "Lună" : "An"}
          </button>
        ))}
      </div>

      <StatsCards stats={stats} />

      

      {/* Dacă e superuser - buton Adaugă Ticket */}
      {role === "superuser" && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Adaugă Ticket Nou
          </button>
        </div>
      )}

      {/* Lista Tickete */}
      {loading ? (
        <p className="text-center text-gray-400">Se încarcă ticketele...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300 mt-6">
          Nu există tickete pentru perioada selectată.
        </p>
      ) : (
        <>
          <TicketList
            tickets={tickets}
            filters={filters}
            setFilters={(f) => {
              setCurrentPage(1);
              setFilters(f);
            }}
            onDelete={handleDeleteTicket}
            onAdd={fetchData}
            startIndex={(currentPage - 1) * ticketsPerPage}
          />
          {/* Per page selector */}
          <div className="flex justify-end mb-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
              Tickete pe pagină:
            </label>
            <select
              value={ticketsPerPage}
              onChange={(e) => {
                setTicketsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            >
              {[5, 10, 20, 50, 100].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
