import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Loader2, Download } from 'lucide-react';
import StatsCards from './StatsCards';
import TicketList from './TicketList';

export default function Dashboard() {
  const [period, setPeriod] = useState('day');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, closed: 0, avgTime: 0 });
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPages, setExportPages] = useState(1);
  const role = localStorage.getItem('role');

  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    project: '',
    assigned_person: '',
    dateFrom: '',
    dateTo: '',
    ticket_id: '',
    created_by: '',
  });

  const typingTimeoutRef = useRef(null);
  const fetchController = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);

    if (fetchController.current) {
      fetchController.current.abort();
    }

    const controller = new AbortController();
    fetchController.current = controller;
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Fetch statistics
    fetch(`http://localhost/tickets-api/dashboard_stats.php?period=${period}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((statsData) => {
        setStats(statsData.stats || { total: 0, closed: 0, avgTime: 0 });

        // Build query parameters for tickets
        const query = {
          page: currentPage,
          limit: ticketsPerPage,
          period,
        };

        // Add only non-empty filters
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key].trim() !== '') {
            query[key] = filters[key];
          }
        });

        const queryParams = new URLSearchParams(query).toString();

        // Fetch tickets
        return fetch(`http://localhost/tickets-api/tickets.php?${queryParams}`, {
          signal: controller.signal,
          headers,
        });
      })
      .then((res) => {
        if (!res.ok) {
          console.warn('⚠️ tickets.php responded with status', res.status);
          return { tickets: [], totalCount: 0 };
        }
        return res.json();
      })
      .then((ticketsData) => {
        setTickets(ticketsData.tickets || []);
        setTotalPages(Math.ceil((ticketsData.totalCount || 0) / ticketsPerPage));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('❌ Fetch error:', err);
        }
      })
      .finally(() => setLoading(false));
  }, [period, currentPage, ticketsPerPage, filters]);

  // Debounced fetch when filters change
  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(fetchData, 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [filters, period, ticketsPerPage, currentPage, fetchData]);

  const handleDeleteTicket = (ticketId) => {
    if (!window.confirm('Sigur dorești să ștergi acest ticket?')) return;
    
    const token = localStorage.getItem('token');
    fetch(`http://localhost/tickets-api/delete_ticket.php?id=${ticketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
        console.error('Eroare ștergere:', err);
        alert('Eroare server!');
      });
  };

const handleExportTickets = () => {
  const visibleIds = tickets.map(t => t.ticket_id);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'http://localhost/tickets-api/export_tickets.php';
  form.target = '_blank';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'ticket_ids';
  input.value = JSON.stringify(visibleIds);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

    const handleDelete = async (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest ticket?")) return;
    try {
      const response = await fetch(`http://localhost/tickets-api/delete_ticket.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!data.error) {
        fetchData();
      } else {
        alert("Eroare: " + data.error);
      }
    } catch (error) {
      console.error("Eroare la ștergere:", error);
    }
  };

  const handleAdd = async (ticketData) => {
    try {
      const response = await fetch(`http://localhost/tickets-api/create_ticket.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      const data = await response.json();
      if (!data.error) {
        fetchData();
      } else {
        alert("Eroare la creare: " + data.error);
      }
    } catch (error) {
      console.error("Eroare la creare ticket:", error);
    }
  };

  // Generate smart pagination with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) range.push(i);
        range.push('...');
        range.push(totalPages);
      }
    }
    
    return range;
  };

  const pageNumbers = getPageNumbers();

  const periodLabels = {
    day: 'Azi',
    week: 'Săptămână',
    month: 'Lună',
    year: 'An'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Period Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Perioada selectată
            </h2>
          </div>
          
          <div className="flex justify-center gap-2">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  period === p
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {role === 'super_admin' ? (
          <StatsCards stats={stats} />
        ) : null}

        {/* Tickets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Section Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lista Tickete
              </h2>
              {loading && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin ml-2" />
              )}
            </div>

            {/* Export Controls */}
            {tickets.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Export pagini:
                  </label>
                  <select
                    value={exportPages}
                    onChange={(e) => setExportPages(Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-colors duration-200 cursor-pointer min-w-[70px]"
                  >
                    {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleExportTickets}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                           text-white text-sm font-medium rounded-lg transition-all duration-200 
                           hover:shadow-lg hover:shadow-green-600/25 disabled:opacity-50 
                           disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isExporting ? 'Exportând...' : 'Export Excel'}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Se încarcă ticketele...
                  </p>
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nu există tickete
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Nu au fost găsite tickete pentru perioada și filtrele selectate.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <TicketList
                tickets={tickets}
                onDelete={handleDelete}
                fetchData={fetchData}
                onAdd={handleAdd}
                filters={filters}
                setFilters={setFilters}
                currentPage={currentPage}
                ticketsPerPage={ticketsPerPage}
                period={period}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                setTicketsPerPage={setTicketsPerPage}
                />
                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Per page selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tickete pe pagină:
                    </label>
                    <select
                      value={ticketsPerPage}
                      onChange={(e) => {
                        setTicketsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               hover:border-gray-400 dark:hover:border-gray-500
                               transition-colors duration-200 cursor-pointer min-w-[70px]"
                    >
                      {[5, 10, 20, 50, 100].map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Previous button */}
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-200 group"
                        aria-label="Pagina precedentă"
                      >
                        <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1 mx-2">
                        {pageNumbers.map((pageNum, index) => (
                          pageNum === '...' ? (
                            <div key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10">
                              <span className="text-gray-400 dark:text-gray-500">...</span>
                            </div>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium
                                        transition-all duration-200 hover:scale-105 ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}
                              aria-label={`Mergi la pagina ${pageNum}`}
                              aria-current={currentPage === pageNum ? 'page' : undefined}
                            >
                              {pageNum}
                            </button>
                          )
                        ))}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-200 group"
                        aria-label="Pagina următoare"
                      >
                        <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Results info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pagina {currentPage} din {totalPages}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}