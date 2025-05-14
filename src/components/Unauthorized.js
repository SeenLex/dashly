export default function Unauthorized() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-500">
        <div className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h1 className="text-4xl font-bold text-red-600 mb-4 animate-pulse">Acces interzis</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Nu ai permisiunea de a vizualiza această pagină.
          </p>
        </div>
      </div>
    );
  }
  