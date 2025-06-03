import { useEffect, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get initial theme preference
  const getInitialTheme = useCallback(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme === "dark";
    }
    
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((isDark) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const initialDarkMode = getInitialTheme();
    setDarkMode(initialDarkMode);
    applyTheme(initialDarkMode);
    setIsLoaded(true);
  }, [getInitialTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        const newDarkMode = e.matches;
        setDarkMode(newDarkMode);
        applyTheme(newDarkMode);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  // Toggle theme handler
  const toggleTheme = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
  }, [darkMode, applyTheme]);

  // Keyboard accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  }, [toggleTheme]);

  // Prevent flash of wrong theme
  if (!isLoaded) {
    return (
      <div className="p-2 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      className="group relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      title={darkMode ? "Comută la tema deschisă" : "Comută la tema închisă"}
      aria-label={darkMode ? "Comută la tema deschisă" : "Comută la tema închisă"}
      aria-pressed={darkMode}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 text-yellow-500 transition-all duration-300 transform ${
            darkMode 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`} 
          size={20}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 text-slate-700 dark:text-slate-300 transition-all duration-300 transform ${
            darkMode 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
          size={20}
        />
      </div>
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {darkMode ? "Tema deschisă" : "Tema închisă"}
      </span>
    </button>
  );
}