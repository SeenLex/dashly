import React from 'react';

const CustomTooltip = ({ active, payload, label, labelName="" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white shadow">
      {/* Label = X-axis value (e.g. Day, Month, etc.) */}
      <p className="font-semibold text-sm">
        {typeof label === 'string' || typeof label === 'number' ? `${labelName}: ${label}` : ''}
      </p>

      {/* Show each payload entry (e.g. count, secondDataKey) */}
      {payload.map((item, index) => (
        <p key={index} className="text-sm">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

export default CustomTooltip;
