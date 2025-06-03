import { useState, useEffect } from "react";

export default function AddTicketForm({ token }) {
    const [priorities, setPriorities] = useState([]);
    const [priority, setPriority] = useState("");
    const [comment, setComment] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost/tickets-api/priorities.php")
            .then(res => res.json())
            .then(data => {
                setPriorities(data);
            })
            .catch(err => {
                console.error("Eroare la preluarea priorităților", err);
            });
    }, []);

    useEffect(() => {
        console.log("priorities", priorities)
    }, [priorities]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            priority_id: priority,
            comment,
            description,
        };

        try {
            const res = await fetch("http://localhost/tickets-api/create_ticket.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.ok) {
                setMessage(`✅ ${result.message} | ID: ${result.ticket_id}`);
                alert(`Ticket adăugat cu succes! ID: ${result.ticket_id}`);
                setPriority("");
                setComment("");
                setDescription("");
            } else {
                setMessage(`${result.error || "Eroare necunoscută"}`);
            }
        } catch (err) {
            setMessage("Eroare la conectare cu serverul.");
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-2/3 mx-auto p-4 bg-white rounded shadow space-y-4">
            <h2 className="text-xl font-semibold text-center">Adaugă</h2>
            <div>
                <label className="block mb-1 font-medium">Priority</label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                >
                    <option value="">Select priority...</option>
                    {priorities.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.priority}
                        </option>
                    ))}

                </select>
            </div>

            <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>

            <div className="flex justify-center">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Trimite
                </button>
            </div>

            {message && <p className="text-center mt-2">{message}</p>}
        </form>
    );
}
