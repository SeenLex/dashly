import ChartSwitcher from "./filters/ChartSwitcher";

function Statistics() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 shadow text-white">
      <div className="container mx-auto p-8">
        {/* Charts Section */}
        <div className="bg-gray-800 border  dark:border-gray-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Statistics Overview</h2>
          <ChartSwitcher />
        </div>
      </div>
    </div>
  );
}

export default Statistics;