function CustomHorizontalContainer({ components }) {
  return (
    <div
      className="bg-blue-50 dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 p-4" // Responsive grid for charts
    >
      {components.map((component, index) => (
        <div key={index} className="bg-blue-50 dark:bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
          {component}
        </div>
      ))}
    </div>
  );
}

export default CustomHorizontalContainer;