// src/pages/Audit/AuditPage.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import AuditTable from '../../components/AuditTable';
import Pagination from '../../components/ui/Pagination';
import Navbar from '../../components/Navbar';

const AuditPage = () => {
  // table data & pagination
  const [logs, setLogs] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 7;

  // filters
  const [teamId, setTeamId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [ticketId, setTicketId] = useState('');

  // filter options
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  // fetch projects and teams on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    // always fetch teams; endpoint returns only for super-admin
    fetch('http://localhost/get_teams.php', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTeams(data.rows);
      })
      .catch(() => setTeams([]));
    fetch('http://localhost/get_projects.php', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.rows);
      })
      .catch(() => setProjects([]));
  }, []);

  // fetch users & tickets when project filter changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const qs = projectId ? `?project_id=${projectId}` : '';
    fetch(`http://localhost/get_users.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.rows);
      })
      .catch(() => setUsers([]));
    fetch(`http://localhost/get_tickets.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.rows);
      })
      .catch(() => setTickets([]));
  }, [projectId]);

  // fetch audits when filters or page change
  useEffect(() => {
    const params = new URLSearchParams({
      page: currentPage,
      per_page: logsPerPage,
    });
    if (teamId) params.append('team_id', teamId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (projectId) params.append('project_id', projectId);
    if (userId) params.append('user_id', userId);
    if (ticketId) params.append('ticket_id', ticketId);

    const token = localStorage.getItem('token');
    fetch(`http://localhost/get_audit_stare.php?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(
            data.rows.map((row) => ({
              id: row.row_number,
              timestamp:
                typeof row.timp === 'object' ? row.timp.date : row.timp,
              user: row.nume_utilizator,
              project: row.provider,
              echipa: row.echipa,
              entity: row.id ?? `Ticket #${row.id_ticket}`,
              actiune: row.actiune,
              previousValue: row.stare_trecuta ?? '-',
              newValue: row.stare_curenta ?? '-',
            })),
            setTotalRows(data.total || 0)
          );
        }
      });
  }, [currentPage, teamId, startDate, endDate, projectId, userId, ticketId]);

  // generate Excel
  const exportToExcel = () => {
    const wsData = logs.map(
      ({
        id,
        timestamp,
        user,
        project,
        echipa,
        entity,
        actiune,
        previousValue,
        newValue,
      }) => ({
        '#': id,
        Timestamp: typeof timp === 'object' ? timestamp.date : timestamp,
        User: user,
        echipa: echipa,
        Project: project,
        entity: id,
        Action: actiune,
        'Previous Value': previousValue ?? '-',
        'New Value': newValue ?? '-',
      })
    );
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit');
    XLSX.writeFile(wb, 'audit_logs.xlsx');
  };

  const totalPages = Math.ceil(totalRows / logsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4">
        {/* Filters & Export */}
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap justify-center gap-4 items-end">
            {teams.length > 0 && (
              <div>
                <label className="block text-sm font-medium">Team</label>
                <select
                  value={teamId}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                >
                  <option value="">All</option>
                  {teams.map((t) => (
                    <option key={t.id_team} value={t.id_team}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Project</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setUserId(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setTicketId(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div className="self-center">
              <button
                onClick={exportToExcel}
                className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
              >
                Generate Excel
              </button>
            </div>
          </div>
        </div>

        <AuditTable logs={logs} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default AuditPage;
