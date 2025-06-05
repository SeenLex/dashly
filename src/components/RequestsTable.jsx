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
      if (!token) return;
      try {
        console.log('Fetching metadata (teams/projects)...');
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
        } else {
          console.error(
            'Failed to fetch teams:',
            resTeams.status,
            await resTeams.text()
          );
        }
        if (resProjs.ok) {
          const projData = await resProjs.json();
          if (projData.success) setProjects(projData.rows);
        } else {
          console.error(
            'Failed to fetch projects:',
            resProjs.status,
            await resProjs.text()
          );
        }
      } catch (err) {
        console.error('Failed to load teams/projects metadata:', err);
      }
    };
    fetchMeta();
  }, [token]);

  const executeFetchRequests = async (pageToFetch) => {
    if (!token) {
      console.log('No token found, skipping fetchRequests.');
      setRequests([]);
      setTotalRows(0);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      if (filterTeam) params.append('team_id', filterTeam);
      if (filterProject) params.append('project_id', filterProject);
      params.append('page', pageToFetch.toString());
      params.append('per_page', perPage.toString());

      const url = `http://localhost/get_requests.php?${params.toString()}`;

      console.log('Attempting to fetch requests from URL:', url);
      console.log('With headers:', {
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Cache-Control': 'no-cache', // Removed
        },
      });

      if (!res.ok) {
        let errorMsg = `Failed to fetch requests (status: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMsg =
            errorData.message ||
            errorData.error ||
            `Server error: ${res.status}`;
        } catch (e) {
          errorMsg = `Failed to fetch requests: ${
            res.statusText || res.status
          }`;
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setRequests(data.requests || []);
      setTotalRows(data.total || 0);
    } catch (err) {
      console.error('Error in executeFetchRequests:', err);
      setRequests([]);
      setTotalRows(0);
      alert(`Error loading requests: ${err.message}`);
    }
  };

  useEffect(() => {
    executeFetchRequests(currentPage);
  }, [
    token,
    filterStartDate,
    filterEndDate,
    filterRole,
    filterStatus,
    filterTeam,
    filterProject,
    currentPage,
    perPage,
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
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }

    const processSuccess = () => {
      setSelectedFor((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        executeFetchRequests(1);
      }
    };

    const checkApiResponse = async (response, defaultErrorMsg) => {
      if (!response.ok) {
        let errorDetail = defaultErrorMsg;
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorData.message || defaultErrorMsg;
        } catch (e) {
          errorDetail = `${defaultErrorMsg} (Status: ${response.status} ${response.statusText})`;
        }
        throw new Error(errorDetail);
      }
    };

    const actionUrl =
      action === 'accept'
        ? 'http://localhost/aprove_request.php'
        : 'http://localhost/refuse_request.php';
    const payload = { id_cerere: id };

    if (action === 'accept') {
      const sel = selectedFor[id] || {};
      if (rol === 'user') {
        const chosenTeam = sel.team;
        if (!chosenTeam) {
          alert('Please select a team to accept this user.');
          return;
        }
        payload.id_team = chosenTeam;
      } else if (rol === 'admin') {
        const chosenProj = sel.project;
        if (!chosenProj) {
          alert('Please select a project to accept this admin.');
          return;
        }
        payload.id_project = chosenProj;
      } else {
        alert('Invalid role specified for acceptance.');
        return;
      }
    }

    try {
      console.log(
        `Attempting action '${action}' on ID ${id} to URL: ${actionUrl}`
      );
      console.log('Payload:', payload);
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      await checkApiResponse(
        res,
        `Failed to ${action} request for ${rol || ''}`
      );
      processSuccess();
    } catch (err) {
      console.error(`Error during '${action}' action:`, err);
      alert(err.message || `Server error during ${action}.`);
    }
  };

  const totalPages = Math.ceil(totalRows / perPage);

  const generateExcel = async () => {
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      if (filterTeam) params.append('team_id', filterTeam);
      if (filterProject) params.append('project_id', filterProject);
      params.append('page', '1');
      params.append(
        'per_page',
        (totalRows > 0 ? totalRows : perPage).toString()
      );

      const url = `http://localhost/get_requests.php?${params.toString()}`;
      console.log('Attempting to fetch all requests for Excel from URL:', url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Cache-Control': 'no-cache', // Removed
        },
      });
      if (!res.ok) {
        let errorMsg = 'Failed to fetch all requests for Excel';
        try {
          const errorData = await res.json();
          errorMsg =
            errorData.message ||
            errorData.error ||
            `Server error: ${res.status}`;
        } catch (e) {
          errorMsg = `Failed to fetch all requests for Excel: ${
            res.statusText || res.status
          }`;
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      const allRequests = data.requests || [];

      if (allRequests.length === 0) {
        alert('No data available to export for the current filters.');
        return;
      }

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
      alert(`Failed to generate Excel: ${err.message}`);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">Cereri de Înregistrare</h2>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium">Data de început</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data de sfârșit</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Generează Excel
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium">Echipă</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={teams.length === 0}
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={projects.length === 0}
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

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="flex bg-gray-200 text-gray-600 uppercase text-sm border border-gray-300 rounded-t-lg">
          <div className="w-12 py-3 px-2 border-r border-gray-300 font-semibold text-center">
            #
          </div>
          <div className="flex-1 py-3 px-4 border-r border-gray-300 font-semibold">
            Data cererii
          </div>
          <div className="flex-1 py-3 px-4 border-r border-gray-300 font-semibold">
            Nume complet
          </div>
          <div className="flex-1 py-3 px-4 border-r border-gray-300 font-semibold">
            Email
          </div>
          <div className="flex-1 py-3 px-4 border-r border-gray-300 font-semibold">
            Rol
          </div>
          <div className="flex-1 py-3 px-4 border-r border-gray-300 font-semibold">
            Atribuire
          </div>
          <div
            className="py-3 px-4 text-center font-semibold"
            style={{ width: '200px' }}
          >
            Stare / Acțiuni
          </div>
        </div>

        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex items-stretch bg-white hover:bg-gray-50 border-b border-l border-r border-gray-300 last:rounded-b-lg"
            >
              <div className="w-12 py-3 px-2 border-r border-gray-300 text-center flex items-center justify-center">
                {req.rowNumber}
              </div>
              <div className="flex-1 py-3 px-4 border-r border-gray-300 flex items-center">
                {req.requestDate}
              </div>
              <div className="flex-1 py-3 px-4 border-r border-gray-300 flex items-center">
                {req.fullName}
              </div>
              <div className="flex-1 py-3 px-4 border-r border-gray-300 flex items-center">
                {req.email}
              </div>
              <div className="flex-1 py-3 px-4 border-r border-gray-300 flex items-center">
                {req.rol === 'user' ? 'Utilizator' : 'Administrator'}
              </div>

              <div className="flex-1 py-3 px-4 border-r border-gray-300 flex items-center">
                {req.status === 'pending' ? (
                  req.rol === 'user' ? (
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm p-1 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      value={selectedFor[req.id]?.team || ''}
                      onChange={(e) =>
                        onSelect(req.id, Number(e.target.value), 'team')
                      }
                      disabled={teams.length === 0}
                    >
                      <option value="" disabled>
                        {teams.length > 0
                          ? 'Selectează echipa…'
                          : 'Loading teams...'}
                      </option>
                      {teams.map((t) => (
                        <option key={t.id_team} value={t.id_team}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm p-1 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      value={selectedFor[req.id]?.project || ''}
                      onChange={(e) =>
                        onSelect(req.id, Number(e.target.value), 'project')
                      }
                      disabled={projects.length === 0}
                    >
                      <option value="" disabled>
                        {projects.length > 0
                          ? 'Selectează proiectul…'
                          : 'Loading projects...'}
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
                className="py-3 px-4 flex flex-col items-center justify-center space-y-2"
                style={{ width: '200px' }}
              >
                {req.status === 'pending' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAction(req.id, 'accept', req.rol)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                      Acceptă
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'decline', req.rol)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Refuză
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      req.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'refused'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
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
          <div className="flex justify-center items-center py-10 border border-gray-300 rounded-b-lg text-gray-500 bg-white">
            Nu există cereri de înregistrare care să corespundă filtrelor
            selectate.
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              disabled={currentPage === i + 1}
              className={`px-4 py-2 rounded text-sm font-medium ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
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
