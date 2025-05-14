// src/components/AverageTimePerTeamChart.js
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AverageTimePerTeamChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="team_assigned_person" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="openTickets" stackId="a" fill="#3b82f6" name="Tickete Deschise" />
        <Bar dataKey="closedTickets" stackId="a" fill="#10b981" name="Tickete Închise" />
      </BarChart>
    </ResponsiveContainer>
  );
}
