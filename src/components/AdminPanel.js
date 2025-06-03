import { useState, useEffect, useRef, useCallback } from "react";

const TicketList = ({ tickets, onDelete, onEdit }) => (
  <div className="space-y-4">
    {tickets.map((ticket, index) => (
      <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ticket #{index + 1}</h3>
            <p className="text-gray-600">Sample ticket data</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(index, 'resolved')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(index)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RequestsTable = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <p className="text-gray-600">Requests table component placeholder</p>
  </div>
);

const AddTicketForm = ({ token, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    priority_id: '',
    description: '',
    comment: '',
    assigned_person: '',
    team_assigned_person: '',
    status: 'Open'
  });
  
  const [priorities, setPriorities] = useState([
    { id: 4, priority: 'Low' },
    { id: 3, priority: 'Medium' },
    { id: 2, priority: 'High' },
    { id: 1, priority: 'Critical' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.priority_id) {
      setMessage({ type: 'error', text: 'Priority is required' });
      return;
    }

    if (!token || token === "sample-token") {
      setMessage({ type: 'error', text: 'Authentication token not found. Please refresh and try again.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Sending ticket data:', formData);
      console.log('Using token:', token);

      const response = await fetch('http://localhost/tickets-api/create_ticket.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: `${data.message} Ticket ID: ${data.ticket_id}` 
        });
        
        setFormData({
          priority_id: '',
          description: '',
          comment: '',
          assigned_person: '',
          status: 'Open'
        });

        if (onTicketCreated) {
          onTicketCreated();
        }
      } else {
        if (response.status === 403) {
          setMessage({ 
            type: 'error', 
            text: 'You do not have permission to create tickets. Only admins and super admins can create tickets.' 
          });
        } else if (response.status === 401) {
          setMessage({ 
            type: 'error', 
            text: 'Authentication failed. Please log out and log back in.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: data.error || `Failed to create ticket (Status: ${response.status})` 
          });
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioritate <span className="text-red-500">*</span>
          </label>
          <select 
            name="priority_id"
            value={formData.priority_id}
            onChange={handleInputChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select priority</option>
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>
                {priority.priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Persoana responsabilă (Email)</label>
          <input 
            type="email"
            name="assigned_person"
            value={formData.assigned_person}
            onChange={handleInputChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="user@example.com (optional)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descriere</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Describe the issue or request"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comentariu</label>
        <textarea 
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          rows="3"
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Additional comments (optional)"
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creare Ticket...</span>
          </div>
        ) : (
          'Create Ticket'
        )}
      </button>
    </form>
  );
};

export default function AdminPanel() {
  const [token, setToken] = useState(null);
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

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', authToken ? 'Token found' : 'No token found');
    setToken(authToken);
  }, []);

  const fetchData = useCallback(() => {
    if (!token) {
      console.log('No token available, skipping fetch');
      setLoading(false);
      return;
    }

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
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched tickets data:', data);
        setTickets(data.tickets || []);
        setTotalPages(Math.ceil((data.totalCount || 0) / ticketsPerPage));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ Error fetching tickets:", err);
        }
      })
      .finally(() => setLoading(false));
  }, [filters, currentPage, ticketsPerPage, token]);

  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(fetchData, 500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [filters, currentPage, ticketsPerPage, fetchData]);

  const handleDeleteTicket = (id) => {
    if (!window.confirm('Sigur dorești să ștergi acest ticket?')) return;

    fetch(`http://localhost/tickets-api/delete_ticket.php?id=${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
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

  const handleTicketCreated = () => {
    console.log('Ticket created, refreshing list...');
    fetchData();
  };
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/3 dark:bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-10">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Creaza ticket nou</h2>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-700/50">
                <AddTicketForm token={token} onTicketCreated={handleTicketCreated} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}