import React, { useState, useEffect } from 'react';
import AuditTable from '../../components/AuditTable';
import Pagination from '../../components/ui/Pagination';
import Navbar from '../../components/Navbar';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const res = await fetch('http://localhost/get_audit_stare.php', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const mapped = data.rows.map((row, i) => ({
            id: i + 1,
            timestamp: typeof row.timp === 'object' ? row.timp.date : row.timp,
            user: row.nume_utilizator,
            entity: row.incident_title ?? `Ticket #${row.id_ticket}`,
            actiune: row.actiune,
            previousValue: row.stare_trecuta ?? '-',
            newValue: row.stare_curenta ?? '-',
          }));

          setLogs(mapped);
        } else {
          console.error('Eroare la încărcare audit:', data.error);
        }
      } catch (err) {
        console.error('Network error:', err);
      }
    };

    fetchAuditData();
  }, []);

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const startIdx = (currentPage - 1) * logsPerPage;
  const currentLogs = logs.slice(startIdx, startIdx + logsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 p-4">
        <AuditTable logs={currentLogs} />
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