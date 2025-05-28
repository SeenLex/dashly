import React, { useState, useEffect } from 'react';
import AuditTable from '../../components/AuditTable';
import Pagination from '../../components/ui/Pagination';
import Navbar from '../../components/Navbar';

const AuditPage = () => {
  // table data & pagination
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  // filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [ticketId, setTicketId] = useState('');

  // filter options
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  // fetch filter option lists on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const [projRes, userRes, ticketRes] = await Promise.all([
          fetch('http://localhost/get_projects.php', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost/get_users.php', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost/get_tickets.php', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [projData, userData, ticketData] = await Promise.all([
          projRes.json(),
          userRes.json(),
          ticketRes.json(),
        ]);
        if (projData.success) setProjects(projData.rows);
        if (userData.success) setUsers(userData.rows);
        if (ticketData.success) setTickets(ticketData.rows);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // fetch audits when filters or page change
  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage,
          per_page: logsPerPage,
        });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (projectId) params.append('project_id', projectId);
        if (userId) params.append('user_id', userId);
        if (ticketId) params.append('ticket_id', ticketId);

        const res = await fetch(
          `http://localhost/get_audit_stare.php?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          setLogs(
            data.rows.map((row) => ({
              id: row.row_number,
              timestamp:
                typeof row.timp === 'object' ? row.timp.date : row.timp,
              user: row.nume_utilizator,
              project: row.provider,
              entity: row.id ?? `Ticket #${row.id_ticket}`,
              actiune: row.actiune,
              previousValue: row.stare_trecuta ?? '-',
              newValue: row.stare_curenta ?? '-',
            }))
          );
        } else {
          console.error('Eroare la încărcare audit:', data.error);
        }
      } catch (err) {
        console.error('Network error:', err);
      }
    };
    fetchAuditData();
  }, [currentPage, startDate, endDate, projectId, userId, ticketId]);

  const totalPages = Math.ceil(logs.length / logsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4">
        {/* Filters Container */}
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap justify-center gap-4 items-end">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">All</option>
                {projects.map((p) => (
                  <option key={p.id_project} value={p.id_project}>
                    {p.provider}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">User</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">All</option>
                {users.map((u) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nume}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ticket</label>
              <select
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">All</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id || `#${t.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <AuditTable logs={logs} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AuditPage;
