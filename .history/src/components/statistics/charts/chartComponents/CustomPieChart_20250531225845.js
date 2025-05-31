import React, { useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

function CustomPieChart({ title, data, nameKey, dataKey, colors }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState(null);
  const tooltipRef = useRef(null);

  // La click pe o sectiune
  const onSliceClick = (data, index, e) => {
    setActiveIndex(index);
    setTooltipData(data);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  // Eticheta sectiunii - afișăm numărul de elemente în loc de procent
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${data[index][dataKey]} ${data[index][nameKey]}`}
      </text>
    );
  };

  // Tooltip custom care afișează detalii proiecte + ticketuri
  const CustomTooltip = () => {
    if (!tooltipData) return null;

    const tickets = tooltipData.tickets || [];

    return (
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          top: tooltipPos.y + 10,
          left: tooltipPos.x + 10,
          width: 400,
          maxHeight: 300,
          overflowY: "auto",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          zIndex: 10000,
        }}
      >
        <h4 style={{ margin: "0 0 8px 0" }}>{tooltipData[nameKey]}</h4>
        <p><b>Total tickets:</b> {tooltipData[dataKey]}</p>
        {tickets.length > 0 ? (
          <div style={{ fontSize: 12 }}>
            <p><b>Tickets:</b></p>
            <ul style={{ paddingLeft: 20, maxHeight: 200, overflowY: "auto" }}>
              {tickets.map(t => (
                <li key={t.id}>
                  <b>ID:</b> {t.id} — <b>Project:</b> {t.project || "N/A"} — <b>Team:</b> {t.team_assigned_person || "N/A"} — <b>Status:</b> {t.resolution || "Open"}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No tickets available</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Legend verticalAlign="bottom" align="center" />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={130}
            dataKey={dataKey}
            nameKey={nameKey}
            label={renderCustomizedLabel}
            labelLine={false}
            onClick={onSliceClick}
          >
            {data.map((entry, index) => (
              <Cell
                key={`slice-${index}`}
                fill={colors[index % colors.length]}
                cursor="pointer"
                stroke={index === activeIndex ? "#000" : ""}
                strokeWidth={index === activeIndex ? 3 : 1}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {activeIndex !== null && <CustomTooltip />}
    </div>
  );
}

export default CustomPieChart;
