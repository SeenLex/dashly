import { useEffect, useState } from "react";
import TicketList from "./TicketList";

export default function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost/tickets-api/tickets.php")
      .then((res) => res.json())
      .then((data) => {
        const closedTickets = (data || []).filter((ticket) => ticket.status === "Closed");
        setTickets(closedTickets);
      })
      .catch((err) => console.error("Eroare la fetch istoric:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-10 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          Istoric Tickete Închise
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Se încarcă ticketele...</p>
        ) : tickets.length > 0 ? (
          <TicketList tickets={tickets} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">Nu există tickete închise în baza de date.</p>
        )}
      </div>
    </div>
  );
}
