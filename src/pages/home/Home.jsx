//full AI, mockup page -  i made it as a model
import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, Search, User, Users, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample data for the charts
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 6000 },
  { name: "May", revenue: 4500 },
  { name: "Jun", revenue: 5500 },
  { name: "Jul", revenue: 7000 },
  { name: "Aug", revenue: 6500 },
  { name: "Sep", revenue: 8000 },
  { name: "Oct", revenue: 7500 },
  { name: "Nov", revenue: 9000 },
  { name: "Dec", revenue: 10000 },
];

const subscriptionData = [
  { name: "Jan", subscriptions: 120 },
  { name: "Feb", subscriptions: 100 },
  { name: "Mar", subscriptions: 150 },
  { name: "Apr", subscriptions: 180 },
  { name: "May", subscriptions: 160 },
  { name: "Jun", subscriptions: 200 },
  { name: "Jul", subscriptions: 250 },
  { name: "Aug", subscriptions: 230 },
  { name: "Sep", subscriptions: 280 },
  { name: "Oct", subscriptions: 260 },
  { name: "Nov", subscriptions: 300 },
  { name: "Dec", subscriptions: 320 },
];

// Sample data for the table
const latestUsers = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia.martin@example.com",
    joined: "2023-01-01",
    status: "Active",
  },
  {
    id: 2,
    name: "Jackson Lee",
    email: "jackson.lee@example.com",
    joined: "2023-02-15",
    status: "Active",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    email: "isabella.nguyen@example.com",
    joined: "2023-03-20",
    status: "Inactive",
  },
  {
    id: 4,
    name: "William Kim",
    email: "william.kim@example.com",
    joined: "2023-04-10",
    status: "Active",
  },
  {
    id: 5,
    name: "Sofia Davis",
    email: "sofia.davis@example.com",
    joined: "2023-05-05",
    status: "Pending",
  },
];

// Dummy components for UI elements
const StatCard = ({ title, value, icon: Icon, description }) => (
  <div className="shadow-lg border-0 rounded-lg bg-white">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {Icon && <Icon className="h-5 w-5 text-gray-400" />}
    </div>
    <div className="p-4">
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  </div>
);

const RevenueChart = () => (
  <div className="shadow-lg border-0 rounded-lg bg-white">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Revenue</h3>
      <p className="text-sm text-gray-500">Monthly revenue overview</p>
    </div>
    <div className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const SubscriptionChart = () => (
  <div className="shadow-lg border-0 rounded-lg bg-white">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Subscriptions</h3>
      <p className="text-sm text-gray-500">Monthly subscription growth</p>
    </div>
    <div className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={subscriptionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="subscriptions"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const LatestUsersTable = () => (
  <div className="shadow-lg border-0 rounded-lg bg-white">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Latest Users</h3>
      <p className="text-sm text-gray-500">New users who joined recently</p>
    </div>
    <div className="p-4">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {latestUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.joined}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={
                    (user.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : user.status === "Inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800") + " px-2 py-1 rounded"
                  }
                >
                  {user.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1), // Example: Start of the year
    to: new Date(), // Today
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4 md:mb-6 lg:mb-8">Dashboard</h1>

      {/* Top Bar with Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={Zap}
          description="+20.1% from last month"
        />
        <StatCard
          title="Subscriptions"
          value="12,345"
          icon={Users}
          description="+5.7% from last month"
        />
        <StatCard
          title="Sales"
          value="$1,234"
          icon={CheckCircle}
          description="+10% from last month"
        />
        <StatCard
          title="Active Users"
          value="5,678"
          icon={User}
          description="+2.3% from last month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart />
        <SubscriptionChart />
      </div>

      {/* Latest Users Table */}
      <LatestUsersTable />
    </div>
  );
};

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading data
  const fetchData = () => {
    setIsLoading(true);
    // Simulate an async operation (e.g., fetching data from an API)
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate a 2-second delay
  };

  // Simulate initial data load on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Hidden on small screens, visible on larger) */}
      <aside
        className={
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " bg-white w-64 transition-transform duration-300 ease-in-out md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 border-r border-gray-200"
        }
      >
        <div className="p-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center justify-start px-4 py-2 rounded-md hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h8a1 1 0 001-1v-4m-9 4h4"
              />
            </svg>
            Home
          </button>
          <button className="w-full flex items-center justify-start px-4 py-2 rounded-md hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-4m0 0H3m6 0h6m-6 0a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Analytics
          </button>
          <button className="w-full flex items-center justify-start px-4 py-2 rounded-md hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Hamburger button for mobile */}
            <button
              className="md:hidden mr-2 px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <h2 className="text-lg font-semibold">Welcome, Admin</h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0116 13v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1a2.032 2.032 0 01-1.595 2.595L4 17h5m0 0v-6a2 0 012-2h2a2 0 012 2v6m0 0l-3-3L12 15l-3-3z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0116 13v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1a2.032 2.032 0 01-1.595 2.595L4 17h5m0 0v-6a2 0 012-2h2a2 0 012 2v6m0 0l-3-3L12 15l-3-3z"
                />
              </svg>
            </button>
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <Dashboard />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
