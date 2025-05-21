// ✅ UPDATED AdminPanel.js
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    incident_title: "",
    project: "",
    priority_id: "",
    assigned_person: ""
  });

  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    status: "",
    project: "",
    assigned_person: ""
  });

  const [visibleCount, setVisibleCount] = useState(20);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    fetch("http://localhost/tickets-api/tickets.php")
      .then((res) => res.json())
      .then((data) => setTickets(data || []))
      .catch((err) => console.error("Eroare la fetch tickete:", err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = (ticketId) => {
    if (!newStatus) return;

    fetch("http://localhost/tickets-api/update_ticket.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status: newStatus })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Status actualizat!");
          fetchTickets();
          setSelectedTicket(null);
          setNewStatus("");
        } else {
          alert("Eroare la actualizare status.");
        }
      })
      .catch((err) => {
        console.error("Eroare update:", err);
        alert("Eroare server!");
      });
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
          fetchTickets();
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Ticket adăugat!");
          fetchTickets();
          setShowAddForm(false);
          setNewTicket({
            incident_title: "",
            project: "",
            priority_id: "",
            assigned_person: ""
          });
        } else {
          alert("Eroare la adăugare ticket.");
        }
      })
      .catch((err) => {
        console.error("Eroare adăugare:", err);
        alert("Eroare server!");
      });
  };

  const filteredTickets = tickets.filter((t) => {
    const term = filters.search.toLowerCase();
    return (
      (filters.search === "" ||
        t.incident_title?.toLowerCase().includes(term) ||
        t.ticket_id?.toLowerCase().includes(term)) &&
      (filters.priority === "" || t.priority_name === filters.priority) &&
      (filters.status === "" || t.status === filters.status) &&
      (filters.project === "" || t.project?.toLowerCase().includes(filters.project.toLowerCase())) &&
      (filters.assigned_person === "" || t.assigned_person?.toLowerCase().includes(filters.assigned_person.toLowerCase()))
    );
  });

  const currentTickets = filteredTickets.slice(0, visibleCount);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Admin Panel - Management Tickete
      </h1>

      {/* update displayed ID column: */}
      {/* <td>#{ticket.ticket_id}</td> */}
    </div>
  );
}
