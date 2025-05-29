import { useState, useEffect, useRef, useCallback } from 'react';
import TicketList from './TicketList';
import RequestsTable from './RequestsTable';

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    project: '',
    assigned_person: '',
    dateFrom: '',
    dateTo: '',
    ticket_id: '',
    created_by: '',
  });

  const fetchController = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    if (fetchController.current) fetchController.current.abort();

    const controller = new AbortController();
    fetchController.current = controller;

    const query = {
      page: currentPage,
      limit: ticketsPerPage,
    };

    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const queryParams = new URLSearchParams(query).toString();

    fetch(`http://localhost/tickets-api/tickets.php?${queryParams}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets || []);
        setTotalPages(Math.ceil((data.totalCount || 0) / ticketsPerPage));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('❌ Error:', err);
      })
      .finally(() => setLoading(false));
  }, [filters, currentPage, ticketsPerPage]);

  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(fetchData, 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [filters, currentPage, ticketsPerPage, fetchData]);

  const handleDeleteTicket = (id) => {
    if (!window.confirm('Sigur dorești să ștergi acest ticket?')) return;

    fetch(`http://localhost/tickets-api/delete_ticket.php?id=${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Ticket șters!');
          fetchData();
        } else {
          alert('Eroare la ștergere.');
        }
      })
      .catch((err) => {
        console.error('Eroare la ștergere:', err);
        alert('Eroare server!');
      });
  };

  const handleEditTicket = (id, newStatus) => {
    fetch(`http://localhost/tickets-api/update_ticket.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Ticket actualizat!');
          fetchData();
        } else {
          alert('Eroare la actualizare.');
        }
      })
      .catch((err) => {
        console.error('Eroare actualizare:', err);
        alert('Eroare server edit ticket!');
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Panel - Tickete</h1>
      <div className="mt-12">
        <RequestsTable />
      </div>

      {loading ? (
        <p>Se încarcă...</p>
      ) : (
        <TicketList
          tickets={tickets}
          filters={filters}
          setFilters={(f) => {
            setCurrentPage(1);
            setFilters(f);
          }}
          onDelete={handleDeleteTicket}
          onEdit={handleEditTicket}
          currentPage={currentPage}
          ticketsPerPage={ticketsPerPage}
          fetchData={fetchData}
        />
      )}

      {/* Per Page Selector */}
      <div className="flex justify-end my-4">
        <label className="mr-2">Tickete pe pagină:</label>
        <select
          value={ticketsPerPage}
          onChange={(e) => {
            setTicketsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border p-2 rounded"
        >
          {[5, 10, 20, 50].map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
