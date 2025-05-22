function CustomHorizontalContainer({ components }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4" // Responsive grid for charts
    >
      {components.map((component, index) => (
        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          {component}
        </div>
      ))}
    </div>
  );
}

export default CustomHorizontalContainer;