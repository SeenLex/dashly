import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TopAssignedChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="assigned_person" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_assigned" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
