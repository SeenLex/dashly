import React from "react";

function Filter({
  labelTitle,
  value,
  onChangeCallback,
  allValues,
  type = "select",
}) {
  const safeValues = Array.isArray(allValues) ? allValues : [];

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-300 mb-2">
        {labelTitle}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={onChangeCallback}
          className="custom-select-field"
        >
          <option value="">All</option>
          {safeValues.map((v) => (
            <option key={v} value={v} className="bg-gray-700 text-white">
              {v}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={onChangeCallback}
          className="custom-input-field"
        />
      )}
    </div>
  );
}

export default Filter;
