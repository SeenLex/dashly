import ChartSwitcher from "./filters/ChartSwitcher";

function Statistics() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 shadow text-white">
      <div className="container mx-auto p-8">
        <div className="bg-blue-50 dark:border-gray-700 dark:bg-gray-800 border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Statistici</h2>
          <ChartSwitcher />
        </div>
      </div>
    </div>
  );
}

export default Statistics;