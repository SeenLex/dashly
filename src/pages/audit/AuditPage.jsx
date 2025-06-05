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
  const [ticketId, setTicketId] = useState(''); // This will now be the search string

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]); // This will remain, as requested

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
          // If the currently selected teamId is not in the new list of teams, reset it.
          // This can happen if the project changes and the old team is not part of the new project.
          if (teamId && !data.rows.some((t) => t.id_team === teamId)) {
            setTeamId('');
          }
        } else {
          setTeams([]);
          setTeamId(''); // Clear teamId if fetch fails or no teams
        }
      })
      .catch(() => {
        setTeams([]);
        setTeamId('');
      });
  }, [projectId, teamId]); // Added teamId to ensure it's re-evaluated if it becomes invalid

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const qs = projectId ? `?project_id=${projectId}` : '';

    fetch(`http://localhost/get_users.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.rows);
          // If the currently selected userId is not in the new list of users, reset it.
          if (userId && !data.rows.some((u) => u.id_user === userId)) {
            setUserId('');
          }
        } else {
          setUsers([]);
          setUserId('');
        }
      })
      .catch(() => {
        setUsers([]);
        setUserId('');
      });

    // This fetch for tickets remains as per your request to not change basic structure,
    // even though the 'tickets' array is not used for the new search bar.
    fetch(`http://localhost/get_tickets.php${qs}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.rows);
        else setTickets([]);
      })
      .catch(() => setTickets([]));
  }, [projectId, userId]); // Added userId to ensure it's re-evaluated

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLogs([]);
      setTotalRows(0);
      return;
    }
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: logsPerPage.toString(),
    });

    if (teamId) params.append('team_id', teamId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (projectId) params.append('project_id', projectId);
    if (userId) params.append('user_id', userId);
    // Use ticketId directly; backend needs to handle it as a search term if it's not an exact ID
    if (ticketId.trim()) params.append('ticket_id', ticketId.trim());

    fetch(`http://localhost/get_audit_stare.php?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          // Attempt to parse error from backend
          return res
            .json()
            .then((errData) => {
              throw new Error(
                errData.error || `HTTP error! status: ${res.status}`
              );
            })
            .catch(() => {
              // Fallback if response is not JSON
              throw new Error(`HTTP error! status: ${res.status}`);
            });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.rows)) {
          const mapped = data.rows.map((row, index) => ({
            id:
              row.id_audit_stare ||
              row.row_number ||
              `log-${currentPage}-${index}`,
            timestamp:
              typeof row.timp === 'object' && row.timp?.date
                ? row.timp.date
                : row.timp,
            user: row.nume_utilizator,
            project: row.provider,
            echipa: row.echipa,
            entity:
              row.ticket_id ||
              (row.id_ticket ? `Tichet #${row.id_ticket}` : 'N/A'),
            actiune: row.actiune,
            previousValue: row.stare_trecuta ?? '-',
            newValue: row.stare_curenta ?? '-',
          }));
          setLogs(mapped);
          setTotalRows(data.total || 0);
        } else {
          setLogs([]);
          setTotalRows(0);
          console.warn(
            'Audit log fetch not successful or data format incorrect:',
            data.error
          );
        }
      })
      .catch((err) => {
        setLogs([]);
        setTotalRows(0);
        console.error('Error fetching audit logs:', err);
        // alert(`Error loading audit logs: ${err.message}`);
      });
  }, [
    currentPage,
    teamId,
    startDate,
    endDate,
    projectId,
    userId,
    ticketId,
    logsPerPage,
  ]); // Added logsPerPage and token

  const exportToExcel = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found.');
      return;
    }
    const params = new URLSearchParams({
      page: '1', // Fetch all data from the first page for Excel
      per_page: (totalRows > 0 ? totalRows : '1000').toString(), // Fetch all rows or a large number
    });
    if (teamId) params.append('team_id', teamId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (projectId) params.append('project_id', projectId);
    if (userId) params.append('user_id', userId);
    if (ticketId.trim()) params.append('ticket_id', ticketId.trim());

    fetch(`http://localhost/get_audit_stare.php?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((errData) => {
              throw new Error(
                errData.error ||
                  `HTTP error! status: ${res.status} for Excel export`
              );
            })
            .catch(() => {
              throw new Error(
                `HTTP error! status: ${res.status} for Excel export`
              );
            });
        }
        return res.json();
      })
      .then((data) => {
        if (
          !data.success ||
          !Array.isArray(data.rows) ||
          data.rows.length === 0
        ) {
          alert(
            data.error ||
              'Nu s-au putut prelua logurile pentru export sau nu există date.'
          );
          return;
        }
        const allRows = data.rows.map((row) => ({
          '#': row.row_number,
          'Data/Ora':
            typeof row.timp === 'object' && row.timp?.date
              ? row.timp.date
              : row.timp,
          Utilizator: row.nume_utilizator,
          Echipă: row.echipa,
          Proiect: row.provider,
          Entitate:
            row.ticket_id_display ||
            (row.id_ticket ? `Tichet #${row.id_ticket}` : 'N/A'),
          Acțiune: row.actiune,
          'Valoare anterioară': row.stare_trecuta ?? '-',
          'Valoare nouă': row.stare_curenta ?? '-',
        }));

        const ws = XLSX.utils.json_to_sheet(allRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Loguri Audit');
        XLSX.writeFile(wb, 'loguri_audit.xlsx');
      })
      .catch((err) => {
        console.error('Eroare export Excel:', err);
        alert(err.message || 'Exportul Excel a eșuat');
      });
  };

  const totalPages = Math.ceil(totalRows / logsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-full xl:max-w-7xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center sm:text-left">
            Jurnal de Audit Stare Tichete
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            {/* Team Filter */}
            <div>
              <label
                htmlFor="teamFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Echipă
              </label>
              <select
                id="teamFilter"
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                disabled={teams.length === 0 && !projectId} // Disable if no project selected and no global teams
              >
                <option value="">Toate Echipele</option>
                {teams.map((t) => (
                  <option key={t.id_team} value={t.id_team}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label
                htmlFor="startDateFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data început
              </label>
              <input
                id="startDateFilter"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label
                htmlFor="endDateFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data sfârșit
              </label>
              <input
                id="endDateFilter"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
            </div>

            {/* Project Filter */}
            <div>
              <label
                htmlFor="projectFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Proiect
              </label>
              <select
                id="projectFilter"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  // Reset dependent filters when project changes
                  setTeamId('');
                  setUserId('');
                  // ticketId is a search input, so it doesn't need to be reset based on project list
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              >
                <option value="">Toate Proiectele</option>
                {projects.map((p) => (
                  <option key={p.id_project} value={p.id_project}>
                    {p.provider}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label
                htmlFor="userFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Utilizator
              </label>
              <select
                id="userFilter"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                disabled={users.length === 0 && !projectId}
              >
                <option value="">Toți Utilizatorii</option>
                {users.map((u) => (
                  <option key={u.id_user} value={u.id_user}>
                    {u.nume} ({u.rol || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket ID Search Bar - THIS IS THE CHANGED PART */}
            <div>
              <label
                htmlFor="ticketIdSearch"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                ID Tichet
              </label>
              <input
                id="ticketIdSearch"
                type="text"
                value={ticketId}
                onChange={(e) => {
                  setTicketId(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Caută ID tichet..."
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              />
            </div>

            {/* Export Button */}
            <div className="w-full sm:col-span-2 lg:col-span-1 xl:col-span-2 flex items-end justify-center sm:justify-start pt-4 sm:pt-0">
              <button
                onClick={exportToExcel}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150"
              >
                Generează Excel
              </button>
            </div>
          </div>
        </div>

        <AuditTable logs={logs} />
        {totalRows > logsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
        {totalRows === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Nu s-au găsit înregistrări pentru filtrele selectate.
          </div>
        )}
      </div>
    </div>
  );
}
