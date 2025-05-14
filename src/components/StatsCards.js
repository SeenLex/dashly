import { FaTicketAlt, FaFolderOpen, FaCheckCircle, FaClock } from "react-icons/fa";

export default function StatsCards({ stats = { total: 0, closed: 0, avgTime: 0, teamCount: 0 } }) {
  const open = stats.total - stats.closed;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {/* Total Tickets */}
      <div className="bg-white p-6 rounded-lg shadow text-center border-l-4 border-blue-500">
        <FaTicketAlt className="mx-auto mb-2 text-2xl text-blue-600" />
        <h2 className="text-sm text-gray-500">Total Tickete</h2>
        <p className="text-2xl font-semibold text-gray-800">{stats.total}</p>
      </div>
      {/* Open Tickets */}
      <div className="bg-white p-6 rounded-lg shadow text-center border-l-4 border-purple-500">
        <FaFolderOpen className="mx-auto mb-2 text-2xl text-purple-600" />
        <h2 className="text-sm text-gray-500">Tickete Deschise</h2>
        <p className="text-2xl font-semibold text-gray-800">{open}</p>
      </div>
      {/* Closed Tickets */}
      <div className="bg-white p-6 rounded-lg shadow text-center border-l-4 border-green-500">
        <FaCheckCircle className="mx-auto mb-2 text-2xl text-green-600" />
        <h2 className="text-sm text-gray-500">Tickete Închise</h2>
        <p className="text-2xl font-semibold text-gray-800">{stats.closed}</p>
      </div>
      {/* Avg Time */}
      <div className="bg-white p-6 rounded-lg shadow text-center border-l-4 border-yellow-500">
        <FaClock className="mx-auto mb-2 text-2xl text-yellow-600" />
        <h2 className="text-sm text-gray-500">Timp Mediu Rezolvare (h)</h2>
        <p className="text-2xl font-semibold text-gray-800">{stats.avgTime.toFixed(1)}</p>
      </div>
    </div>
  );
}
