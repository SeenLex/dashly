import { useState, useEffect } from "react";
import StatsCards from "./StatsCards";
import TicketList from "./TicketList";
import TicketStatusPieChart from "./TicketStatusPieChart";
import AverageTimePerTeamChart from "./AverageTimePerTeamChart";

export default function Dashboard() {
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, closed: 0, avgTime: 0 });
  const [tickets, setTickets] = useState([]);
  const [statusChart, setStatusChart] = useState([]);
  const [teamChart, setTeamChart] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
    project: "",
    assigned_person: "",
    dateFrom: "",
    dateTo: "",
    last_modified: "",
  });

  const [visibleTickets, setVisibleTickets] = useState(20);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    incident_title: "",
    project: "",
    priority_id: "",
    assigned_person: ""
  });

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost/tickets-api/dashboard_stats.php?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || { total: 0, closed: 0, avgTime: 0 });
        setTickets(data.tickets || []);
        setStatusChart(data.statusChart || []);
        setTeamChart(data.teamChart || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

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

  const handleAddTicket = (e) => {
    e.preventDefault();

    fetch("http://localhost/tickets-api/add_ticket.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTicket)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Ticket adăugat!");
          setShowAddForm(false);
          setNewTicket({
            incident_title: "",
            project: "",
            priority_id: "",
            assigned_person: ""
          });
          fetchData();
        } else {
          alert("Eroare la adăugare ticket.");
        }
      })
      .catch((err) => {
        console.error("Eroare adăugare:", err);
        alert("Eroare server!");
      });
  };

  const handleLoadMore = () => {
    setVisibleTickets((prev) => prev + 20);
  };

  const filteredTickets = tickets.filter((t) => {
    const term = filters.search.toLowerCase();
    return (
      (filters.search === "" ||
        t.incident_title?.toLowerCase().includes(term) ||
        t.id?.toString().includes(term)) &&
      (filters.priority === "" || t.priority_name === filters.priority) &&
      (filters.status === "" || t.status === filters.status) &&
      (filters.project === "" ||
        t.project?.toLowerCase().includes(filters.project.toLowerCase())) &&
      (filters.assigned_person === "" ||
        t.assigned_person?.toLowerCase().includes(filters.assigned_person.toLowerCase())) &&
      (filters.dateFrom === "" ||
        new Date(t.start_date) >= new Date(filters.dateFrom)) &&
      (filters.dateTo === "" ||
        new Date(t.start_date) <= new Date(filters.dateTo)) &&
      (filters.last_modified === "" ||
        t.last_modified_date?.includes(filters.last_modified))
    );
  });

  return (
    <div className="p-6">

      {/* Perioadă */}
      <div className="flex justify-center gap-4 mb-8">
        {["day", "week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
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

      {/* KPI */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:scale-105 transition-transform">
          <h2 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300 text-center">
            Status Tickete
          </h2>
          {loading ? (
            <p className="text-center text-gray-400">Se încarcă...</p>
          ) : (
            <TicketStatusPieChart data={statusChart} height={400} />
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:scale-105 transition-transform">
          <h2 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300 text-center">
            Tickete pe Echipă
          </h2>
          {loading ? (
            <p className="text-center text-gray-400">Se încarcă...</p>
          ) : (
            <AverageTimePerTeamChart data={teamChart} height={450} />
          )}
        </div>
      </div>

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
      ) : (
        <>
          <TicketList tickets={filteredTickets.slice(0, visibleTickets)} onDelete={handleDeleteTicket} />
          {visibleTickets < filteredTickets.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Încarcă Mai Multe
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Adaugă Ticket */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200">
              Adaugă Ticket Nou
            </h2>
            <form onSubmit={handleAddTicket} className="space-y-4">
              <input
                type="text"
                placeholder="Titlu Incident"
                value={newTicket.incident_title}
                onChange={(e) => setNewTicket({ ...newTicket, incident_title: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Proiect"
                value={newTicket.project}
                onChange={(e) => setNewTicket({ ...newTicket, project: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newTicket.priority_id}
                onChange={(e) => setNewTicket({ ...newTicket, priority_id: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selectează Prioritate</option>
                <option value="1">Critical</option>
                <option value="2">High</option>
                <option value="3">Medium</option>
                <option value="4">Low</option>
              </select>
              <input
                type="text"
                placeholder="Assigned Person"
                value={newTicket.assigned_person}
                onChange={(e) => setNewTicket({ ...newTicket, assigned_person: e.target.value })}
                required
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Adaugă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
