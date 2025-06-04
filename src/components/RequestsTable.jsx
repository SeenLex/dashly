import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const RequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const [selectedFor, setSelectedFor] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [resTeams, resProjs] = await Promise.all([
          fetch('http://localhost/get_teams.php', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost/get_projects.php', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resTeams.ok) {
          const teamData = await resTeams.json();
          if (teamData.success) setTeams(teamData.rows);
        }
        if (resProjs.ok) {
          const projData = await resProjs.json();
          if (projData.success) setProjects(projData.rows);
        }
      } catch (err) {
        console.error('Failed to load teams/projects:', err);
      }
    };
    fetchMeta();
  }, [token]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params = new URLSearchParams();
        if (filterStartDate) params.append('start_date', filterStartDate);
        if (filterEndDate) params.append('end_date', filterEndDate);
        if (filterRole) params.append('role', filterRole);
        if (filterStatus) params.append('status', filterStatus);
        if (filterTeam) params.append('team_id', filterTeam);
        if (filterProject) params.append('project_id', filterProject);
        params.append('page', currentPage);
        params.append('per_page', perPage);

        const url = `http://localhost/get_requests.php?${params.toString()}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();
        setRequests(data.requests || []);
        setTotalRows(data.total || 0);
      } catch (err) {
        console.error('Error fetching requests:', err);
        alert('Error loading requests.');
      }
    };
    fetchRequests();
  }, [
    token,
    filterStartDate,
    filterEndDate,
    filterRole,
    filterStatus,
    filterTeam,
    filterProject,
    currentPage,
  ]);

  const onSelect = (requestId, value, type) => {
    setSelectedFor((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [type]: value,
      },
    }));
  };

  const handleAction = async (id, action, rol) => {
    if (action === 'accept') {
      const sel = selectedFor[id] || {};

      if (rol === 'user') {
        const chosenTeam = sel.team;
        if (!chosenTeam) {
          alert('Please select a team to accept this user.');
          return;
        }
        try {
          const res = await fetch('http://localhost/aprove_request.php', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_cerere: id,
              id_team: chosenTeam,
            }),
          });
          if (!res.ok)
            throw new Error((await res.json()).error || 'Action failed');
          setCurrentPage(1);
        } catch (err) {
          console.error('Accept user error:', err);
          alert(err.message || 'Server error.');
        }
      } else if (rol === 'admin') {
        const chosenProj = sel.project;
        if (!chosenProj) {
          alert('Please select a project to accept this admin.');
          return;
        }
        try {
          const res = await fetch('http://localhost/aprove_request.php', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_cerere: id,
              id_project: chosenProj,
            }),
          });
          if (!res.ok)
            throw new Error((await res.json()).error || 'Action failed');
          setCurrentPage(1);
        } catch (err) {
          console.error('Accept admin error:', err);
          alert(err.message || 'Server error.');
        }
      }
    } else {
      try {
        const res = await fetch('http://localhost/refuse_request.php', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_cerere: id }),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || 'Action failed');
        setCurrentPage(1);
      } catch (err) {
        console.error('Decline error:', err);
        alert(err.message || 'Server error.');
      }
    }
  };

  const totalPages = Math.ceil(totalRows / perPage);

  const generateExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      if (filterTeam) params.append('team_id', filterTeam);
      if (filterProject) params.append('project_id', filterProject);
      params.append('page', 1);
      params.append('per_page', totalRows || perPage);

      const url = `http://localhost/get_requests.php?${params.toString()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch all requests');
      const data = await res.json();
      const allRequests = data.requests || [];

      const wsData = allRequests.map((r) => ({
        '#': r.rowNumber,
        'Request Date': r.requestDate,
        'Full Name': r.fullName,
        Email: r.email,
        Role: r.rol,
        Status: r.status,
        Team: r.team ?? '',
        Project: r.project ?? '',
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Requests');
      XLSX.writeFile(wb, 'registration_requests.xlsx');
    } catch (err) {
      console.error('Generate Excel error:', err);
      alert('Failed to generate Excel.');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Cereri de Înregistrare</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium">Data de început</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data de sfârșit</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option value="">Toate</option>
              <option value="user">Utilizator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Stare</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option value="">Toate</option>
              <option value="pending">În așteptare</option>
              <option value="accepted">Acceptat</option>
              <option value="refused">Refuzat</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Generează Excel
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium">Echipă</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
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
            <label className="block text-sm font-medium">Proiect</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex bg-gray-200 text-gray-600 uppercase text-sm border border-gray-300 rounded-lg">
          <div className="w-12 py-2 px-1 border border-gray-300 font-semibold text-center">
            #
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Data cererii
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Nume complet
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Email
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Rol
          </div>
          <div className="flex-1 py-2 px-4 border border-gray-300 font-semibold">
            Atribuire
          </div>
          <div
            className="py-2 px-4 border border-gray-300 text-center font-semibold"
            style={{ width: '200px' }}
          >
            Stare / Acțiuni
          </div>
        </div>

        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex hover:bg-gray-50 border border-gray-300 rounded-lg"
            >
              <div className="w-12 py-2 px-1 border border-gray-300 text-center">
                {req.rowNumber}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {req.requestDate}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {req.fullName}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {req.email}
              </div>
              <div className="flex-1 py-2 px-4 border border-gray-300">
                {req.rol === 'user' ? 'Utilizator' : 'Administrator'}
              </div>

              <div className="flex-1 py-2 px-4 border border-gray-300">
                {req.status === 'pending' ? (
                  req.rol === 'user' ? (
                    <select
                      className="w-full border rounded p-1"
                      value={selectedFor[req.id]?.team || ''}
                      onChange={(e) =>
                        onSelect(req.id, Number(e.target.value), 'team')
                      }
                    >
                      <option value="" disabled>
                        Selectează echipa…
                      </option>
                      {teams.map((t) => (
                        <option key={t.id_team} value={t.id_team}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="w-full border rounded p-1"
                      value={selectedFor[req.id]?.project || ''}
                      onChange={(e) =>
                        onSelect(req.id, Number(e.target.value), 'project')
                      }
                    >
                      <option value="" disabled>
                        Selectează proiectul…
                      </option>
                      {projects.map((p) => (
                        <option key={p.id_project} value={p.id_project}>
                          {p.provider}
                        </option>
                      ))}
                    </select>
                  )
                ) : req.status === 'accepted' ? (
                  req.rol === 'user' ? (
                    <span>{req.team ?? '—'}</span>
                  ) : (
                    <span>{req.project ?? '—'}</span>
                  )
                ) : (
                  <span>—</span>
                )}
              </div>

              <div
                className="py-2 px-4 border border-gray-300 flex flex-col items-center justify-center space-y-1"
                style={{ width: '200px' }}
              >
                {req.status === 'pending' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAction(req.id, 'accept', req.rol)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Acceptă
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'decline')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Refuză
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-gray-700">
                    {req.status === 'pending'
                      ? 'În așteptare'
                      : req.status === 'accepted'
                      ? 'Acceptat'
                      : req.status === 'refused'
                      ? 'Refuzat'
                      : req.status}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center py-4 border border-gray-300 rounded-lg text-gray-500">
            Nu există cereri de înregistrare.
          </div>
        )}
      </div>

      {totalRows > perPage && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(totalRows / perPage) }, (_, i) => (
            <button
              key={i + 1}
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
      )}
    </div>
  );
};

export default RequestsTable;
