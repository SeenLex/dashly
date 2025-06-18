import { useState } from 'react';
import { useEffect, useRef } from 'react';

export default function TicketList({
  tickets,
  onDelete,
  fetchData,
  onAdd,
  filters,
  setFilters,
  currentPage,
  ticketsPerPage,
  period,
  totalPages,
}) {
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [expandedStartId, setExpandedStartId] = useState(null);
  const [expandedAssignedDate, setexpandedAssignedDate] = useState(null);
  const [expandedModifiedId, setExpandedModifiedId] = useState(null);
  const [expandedClosedId, setExpandedClosedId] = useState(null);
  const [exportPages, setExportPages] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [newResolution, setNewResolution] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);
  const [newAssignedPerson, setNewAssignedPerson] = useState('');

  const formatTime = (datetime) => {
    if (!datetime) return 'N/A';
    const dateObj = new Date(datetime);
    if (isNaN(dateObj)) return datetime;
    return dateObj.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const tableRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (tableRef.current) {
        const tableTop = tableRef.current.offsetTop;
        const tableHeight = tableRef.current.offsetHeight;
        window.scrollTo({
          top: tableTop + tableHeight / 2,
          behavior: 'smooth',
        });
      }
    }, 300); // scurt delay ca să aștepți randarea
  }, []);

  const getTicketId = (ticket) => {
    return ticket?.ticket_id || ticket?.id || 'N/A';
  };

  const handleClearFilters = () => {
    setFilters({
      priority: '',
      status: '',
      project: '',
      assigned_person: '',
      dateFrom: '',
      dateTo: '',
      ticket_id: '',
      created_by: '',
    });
  };

  const formatResponseTime = (responseTime, status) => {
    // If ticket is closed or response_time is null/undefined, show dash
    if (
      status === 'Closed' ||
      responseTime === null ||
      responseTime === undefined
    ) {
      return '—';
    }

    // If response_time is 0, it means it was assigned immediately when created
    if (responseTime === 0) {
      return '0 h';
    }

    // For positive values, show the hours
    if (responseTime > 0) {
      return `${responseTime} h`;
    }

    // Default case
    return '—';
  };

  // Also add this function to calculate response time on the frontend if needed
  const calculateResponseTime = (startDate, assignedDate) => {
    if (!startDate || !assignedDate) return null;

    const start = new Date(startDate);
    const assigned = new Date(assignedDate);

    if (isNaN(start) || isNaN(assigned)) return null;

    const diffInMs = assigned - start;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    return diffInHours >= 0 ? diffInHours : null;
  };

  const handleAssignPerson = async (ticketId, assignedPerson) => {
    const token = localStorage.getItem('token');

    // Get the actual ticket ID - handle both ticket.id and ticket.ticket_id
    const actualTicketId =
      ticketId ||
      selectedTicketForAssign?.id ||
      selectedTicketForAssign?.ticket_id;

    console.log('Assigning person:', {
      originalTicketId: ticketId,
      actualTicketId,
      assignedPerson,
      selectedTicket: selectedTicketForAssign,
    });

    if (!actualTicketId) {
      alert('❌ Eroare: ID-ul ticket-ului nu a fost găsit');
      return;
    }

    if (!assignedPerson || assignedPerson.trim() === '') {
      alert('⚠️ Te rog să introduci adresa de email a persoanei responsabile');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(assignedPerson.trim())) {
      alert(
        '⚠️ Te rog să introduci o adresă de email validă (ex: nume@domeniu.com)'
      );
      return;
    }

    try {
      const requestBody = {
        ticket_id: actualTicketId,
        assigned_person: assignedPerson.trim(),
      };

      console.log('Request body:', requestBody);

      const response = await fetch(
        `http://localhost/tickets-api/assignPerson.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      // Get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Check if response starts with expected characters (not HTML error page)
      if (
        responseText.startsWith('<!DOCTYPE') ||
        responseText.startsWith('<html')
      ) {
        console.error('Received HTML instead of JSON - possible PHP error');
        alert(
          '❌ Eroare server: S-a primit o pagină HTML în loc de răspuns JSON. Verifică logurile serverului.'
        );
        return;
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        alert(
          '❌ Server returned invalid response: ' +
            responseText.substring(0, 200)
        );
        return;
      }

      console.log('Parsed response:', data);

      if (response.ok && data.success) {
        alert('✅ Persoană asignată cu succes!');

        // Refresh the data
        if (typeof fetchData === 'function') {
          await fetchData();
        }

        // Close modal and reset state
        setShowAssignModal(false);
        setSelectedTicketForAssign(null);
        setNewAssignedPerson('');
      } else {
        console.error('Assignment failed:', data);

        // Handle specific error cases with user-friendly messages
        let errorMessage = '';

        if (response.status === 404) {
          errorMessage =
            '❌ Adresa de email introdusă nu există în baza de date.\n\nTe rog să verifici:\n• Corectitudinea adresei de email\n• Dacă utilizatorul este înregistrat în sistem';
        } else if (response.status === 400) {
          if (data.error && data.error.includes('Invalid ticket ID')) {
            errorMessage = '❌ ID-ul ticket-ului nu este valid';
          } else if (
            data.error &&
            data.error.includes('Missing required fields')
          ) {
            errorMessage = '❌ Câmpuri obligatorii lipsesc';
          } else {
            errorMessage =
              '❌ Eroare de validare: ' + (data.error || 'Date invalide');
          }
        } else if (response.status === 500) {
          errorMessage =
            '❌ Eroare internă a serverului. Te rog să contactezi administratorul.';
        } else {
          errorMessage =
            '❌ Eroare la asignare: ' + (data.error || 'Eroare necunoscută');
        }

        // Add additional details if available
        if (data.details) {
          errorMessage += '\n\nDetalii tehnice: ' + data.details;
        }

        if (data.debug_info) {
          console.log('Debug info:', data.debug_info);
        }

        alert(errorMessage);
      }
    } catch (err) {
      console.error('Network or other error:', err);

      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        alert(
          '❌ Eroare de conexiune: Nu se poate conecta la server. Verifică dacă serverul rulează.'
        );
      } else {
        alert('❌ Eroare de rețea: ' + err.message);
      }
    }
  };

  const handleExport = () => {
    const exportParams = {
      ...filters,
      period,
      ticketsPerPage,
      exportPages,
    };

    const queryString = new URLSearchParams(exportParams).toString();
    const downloadUrl = `http://localhost/tickets-api/export_tickets.php?${queryString}`;
    window.open(downloadUrl, '_blank');
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value && value.trim() !== '');
  };

  const role = localStorage.getItem('role');

  const [newTicket, setNewTicket] = useState({
    incident_title: '',
    project: '',
    priority_id: '',
    assigned_person: '',
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTicket = (e) => {
    e.preventDefault();
    if (
      !newTicket.incident_title ||
      !newTicket.project ||
      !newTicket.priority_id
    ) {
      alert('Completează toate câmpurile!');
      return;
    }
    onAdd(newTicket);
    setNewTicket({
      incident_title: '',
      project: '',
      priority_id: '',
      assigned_person: '',
    });
  };

  const token = localStorage.getItem('token');

  const handleEditTicket = async (ticket_id, status, comment, resolution) => {
    console.log('handleaddtocket', ticket_id, status, comment, resolution);
    try {
      const response = await fetch(
        `http://localhost/tickets-api/userUpdateTicket.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ticket_id, status, comment, resolution }),
        }
      );

      const data = await response.json();

      if (!data.error) {
        alert('Ticket actualizat!');
        fetchData();
      } else {
        alert('Eroare la actualizare: ' + data.error);
      }
    } catch (err) {
      console.error('Eroare actualizare:', err);
      alert('Eroare server edit!');
    }
  };

  const handleUpdateStatus = async (ticketId) => {
    await handleEditTicket(ticketId, newStatus, newComment, newResolution);
    setSelectedTicket(null);
    setNewStatus('');
    setNewComment('');
    setNewResolution('');
  };

  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setNewComment(ticket.comment || '');
    setNewResolution(ticket.resolution || '');
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (priority) {
      case 'Critical':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'High':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Low':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    switch (status) {
      case 'Open':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'In Progress':
        return `${baseClasses} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200`;
      case 'Pending':
        return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200`;
      case 'Closed':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  return (
    <div className=" dark:bg-gray-900 min-h-screen">
      {/* Enhanced Filters Section */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Filtrare Avansată
            </h2>
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Șterge
              </button>
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-8 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Prioritate
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toate</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toate</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Proiect
              </label>
              <input
                type="text"
                placeholder="Proiect..."
                value={filters.project || ''}
                onChange={(e) =>
                  setFilters({ ...filters, project: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Responsabil
              </label>
              <input
                type="text"
                placeholder="Persoana..."
                value={filters.assigned_person || ''}
                onChange={(e) =>
                  setFilters({ ...filters, assigned_person: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                De la
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Până la
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Ticket ID
              </label>
              <input
                type="text"
                placeholder="ID..."
                value={filters.ticket_id || ''}
                onChange={(e) =>
                  setFilters({ ...filters, ticket_id: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Creat De
              </label>
              <input
                type="text"
                placeholder="Creator..."
                value={filters.created_by || ''}
                onChange={(e) =>
                  setFilters({ ...filters, created_by: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters() && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1 mb-1">
                <svg
                  className="w-3 h-3 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Filtre Active:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value.trim() === '') return null;

                  const labelMap = {
                    priority: 'Prioritate',
                    status: 'Status',
                    project: 'Proiect',
                    assigned_person: 'Asignat',
                    dateFrom: 'De la',
                    dateTo: 'Până la',
                    ticket_id: 'Ticket ID',
                    created_by: 'Creat de',
                  };

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded"
                    >
                      <strong>{labelMap[key]}:</strong> {value}
                      <button
                        onClick={() => setFilters({ ...filters, [key]: '' })}
                        className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded p-0.5"
                      >
                        <svg
                          className="w-2 h-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg">
        <div className="w-full overflow-x-visible">
          <table ref={tableRef} className="min-w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Nr
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Ticket
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Prioritate
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  SLA
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  IN/OUT
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Proiect
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Start
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Atribuire
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Modificare
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Închidere
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Descriere
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Comentariu
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Responsabil
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Echipa
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Creat de
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  Răspuns
                </th>
                {role === 'superuser' && onDelete && (
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    Acțiuni
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 font-medium">
                    {(currentPage - 1) * ticketsPerPage + index + 1}
                  </td>
                  <td className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 font-mono">
                    {getTicketId(ticket)}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getStatusBadge(
                        ticket.status
                      ).replace('px-3 py-1', 'px-2 py-0.5')}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadge(
                        ticket.priority_name
                      ).replace('px-3 py-1', 'px-2 py-0.5')}`}
                    >
                      {ticket.priority_name}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100">
                    {ticket.duration_hours || '-'}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ticket.sla_status === 'IN SLA'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {ticket.sla_status}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 max-w-20 truncate"
                    title={ticket.project}
                  >
                    {ticket.project}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    onClick={() =>
                      setExpandedStartId(
                        expandedStartId === ticket.id ? null : ticket.id
                      )
                    }
                    title={ticket.start_date}
                  >
                    {expandedStartId === ticket.id
                      ? ticket.start_date
                      : formatTime(ticket.start_date)}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    onClick={() =>
                      setexpandedAssignedDate(
                        expandedAssignedDate === ticket.id ? null : ticket.id
                      )
                    }
                    title={ticket.assigned_date}
                  >
                    {expandedAssignedDate === ticket.id
                      ? ticket.assigned_date
                      : formatTime(ticket.assigned_date)}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    onClick={() =>
                      setExpandedModifiedId(
                        expandedModifiedId === ticket.id ? null : ticket.id
                      )
                    }
                    title={ticket.last_modified_date || 'N/A'}
                  >
                    {expandedModifiedId === ticket.id
                      ? ticket.last_modified_date || 'N/A'
                      : formatTime(ticket.last_modified_date)}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    onClick={() =>
                      setExpandedClosedId(
                        expandedClosedId === ticket.id ? null : ticket.id
                      )
                    }
                    title={ticket.closed_date || 'N/A'}
                  >
                    {expandedClosedId === ticket.id
                      ? ticket.closed_date || 'N/A'
                      : formatTime(ticket.closed_date)}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 max-w-32 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    title={ticket.description}
                    onClick={() =>
                      setExpandedDescriptionId(
                        expandedDescriptionId === String(ticket.id)
                          ? null
                          : String(ticket.id)
                      )
                    }
                  >
                    <div
                      className={
                        expandedDescriptionId !== String(ticket.id)
                          ? 'truncate'
                          : ''
                      }
                    >
                      {expandedDescriptionId === String(ticket.id)
                        ? ticket.description || '-'
                        : (ticket.description || '-').slice(0, 50) +
                          ((ticket.description?.length || 0) > 50 ? '...' : '')}
                    </div>
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 max-w-32 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors rounded"
                    title={ticket.comment}
                    onClick={() =>
                      setExpandedCommentId(
                        expandedCommentId === String(ticket.id)
                          ? null
                          : String(ticket.id)
                      )
                    }
                  >
                    <div
                      className={
                        expandedCommentId !== String(ticket.id)
                          ? 'truncate'
                          : ''
                      }
                    >
                      {expandedCommentId === String(ticket.id)
                        ? ticket.comment || '-'
                        : (ticket.comment || '-').slice(0, 50) +
                          ((ticket.comment?.length || 0) > 50 ? '...' : '')}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-1">
                      <span
                        className="max-w-24 truncate"
                        title={ticket.assigned_person || '-'}
                      >
                        {ticket.assigned_person || '-'}
                      </span>
                      {(role === 'admin' || role === 'superuser') && (
                        <button
                          onClick={() => {
                            setSelectedTicketForAssign(ticket);
                            setNewAssignedPerson(ticket.assigned_person || '');
                            setShowAssignModal(true);
                          }}
                          className="p-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                          title="Asignează persoană"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 max-w-24 truncate"
                    title={ticket.team_assigned_person || '-'}
                  >
                    {ticket.team_assigned_person || '-'}
                  </td>
                  <td
                    className="px-2 py-1 text-xs text-gray-900 dark:text-gray-100 max-w-24 truncate"
                    title={ticket.created_by || '-'}
                  >
                    {ticket.created_by || '-'}
                  </td>
                  <td className="px-2 py-1 text-center text-xs text-gray-900 dark:text-gray-100">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ticket.response_time === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : ticket.response_time > 0 &&
                            ticket.response_time <= 24
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : ticket.response_time > 24
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {formatResponseTime(ticket.response_time, ticket.status)}
                    </span>
                  </td>
                  {role === 'user' && (
                    <td className="px-2 py-1">
                      <button
                        className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded hover:from-blue-600 hover:to-blue-700 focus:ring-1 focus:ring-blue-500 transition-all duration-200 shadow-sm flex items-center justify-center"
                        onClick={() => openStatusModal(ticket)}
                        title="Modifică Status"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Status Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifică Status pentru #{selectedTicket.id}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Selectează un status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Comentariu
                </label>
                <textarea
                  placeholder="Adaugă un comentariu..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rezolvare
                </label>
                <textarea
                  placeholder="Descrierea rezolvării..."
                  value={newResolution}
                  onChange={(e) => setNewResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedTicket.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedTicketForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Asignează Persoană pentru Ticket #
                {getTicketId(selectedTicketForAssign)}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Persoană Responsabilă
                </label>
                <input
                  type="text"
                  placeholder="Introdu numele persoanei..."
                  value={newAssignedPerson}
                  onChange={(e) => setNewAssignedPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTicketForAssign(null);
                    setNewAssignedPerson('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Anulează
                </button>
                <button
                  onClick={() =>
                    handleAssignPerson(
                      selectedTicketForAssign.id,
                      newAssignedPerson
                    )
                  }
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
                >
                  Asignează
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
