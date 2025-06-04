import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import AuditTable from '../../components/AuditTable';
import Pagination from '../../components/ui/Pagination';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 7;

  const [teamId, setTeamId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [ticketId, setTicketId] = useState('');

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch('http://localhost/get_projects.php', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.rows);
        else setProjects([]);
      })
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const qs = projectId ? `?project_id=${projectId}` : '';

    fetch(`http://localhost/get_teams.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTeams(data.rows);
          setTeamId('');
        } else {
          setTeams([]);
        }
      })
      .catch(() => setTeams([]));
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const qs = projectId ? `?project_id=${projectId}` : '';

    fetch(`http://localhost/get_users.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.rows);
        else setUsers([]);
      })
      .catch(() => setUsers([]));

    fetch(`http://localhost/get_tickets.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.rows);
        else setTickets([]);
      })
      .catch(() => setTickets([]));
  }, [projectId]);

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
          const mapped = data.rows.map((row) => ({
            id: row.row_number,
            timestamp: typeof row.timp === 'object' ? row.timp.date : row.timp,
            user: row.nume_utilizator,
            project: row.provider,
            echipa: row.echipa,
            entity: row.ticket_id ?? `Tichet #${row.id_ticket}`,
            actiune: row.actiune,
            previousValue: row.stare_trecuta ?? '-',
            newValue: row.stare_curenta ?? '-',
          }));
          setLogs(mapped);
          setTotalRows(data.total || 0);
        } else {
          setLogs([]);
          setTotalRows(0);
        }
      })
      .catch(() => {
        setLogs([]);
        setTotalRows(0);
      });
  }, [currentPage, teamId, startDate, endDate, projectId, userId, ticketId]);

  const exportToExcel = () => {
    const params = new URLSearchParams({
      page: 1,
      per_page: totalRows || 1,
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
        if (!data.success) {
          throw new Error(data.error || 'Nu s-au putut prelua logurile');
        }
        const allRows = data.rows.map((row) => ({
          '#': row.row_number,
          'Data/Ora': typeof row.timp === 'object' ? row.timp.date : row.timp,
          'Utilizator': row.nume_utilizator,
          'Echipă': row.echipa,
          'Proiect': row.provider,
          'Entitate': row.ticket_id ?? `Tichet #${row.id_ticket}`,
          'Acțiune': row.actiune,
          'Valoare anterioară': row.stare_trecuta ?? '-',
          'Valoare nouă': row.stare_curenta ?? '-',
        }));

        const ws = XLSX.utils.json_to_sheet(allRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Loguri Audit');
        XLSX.writeFile(wb, 'loguri_audit.xlsx');
      })
      .catch((err) => {
        console.error('Eroare export:', err);
        alert(err.message || 'Exportul a eșuat');
      });
  };

  const totalPages = Math.ceil(totalRows / logsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap justify-center gap-4 items-end">
            <div>
              <label className="block text-sm font-medium">Echipă</label>
              <select
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Toate</option>
                {teams.map((t) => (
                  <option key={t.id_team} value={t.id_team}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Data început</label>
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
              <label className="block text-sm font-medium">Data sfârșit</label>
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
              <label className="block text-sm font-medium">Proiect</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Toate</option>
                {projects.map((p) => (
                  <option key={p.id_project} value={p.id_project}>
                    {p.provider}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Utilizator</label>
              <select
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Toți</option>
                {users.map((u) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nume}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Tichet</label>
              <select
                value={ticketId}
                onChange={(e) => {
                  setTicketId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Toate</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ticket_id}
                  </option>
                ))}
              </select>
            </div>

            <div className="self-center">
              <button
                onClick={exportToExcel}
                className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700"
              >
                Generează Excel
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
}
