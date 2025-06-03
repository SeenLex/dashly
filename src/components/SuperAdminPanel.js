import { useEffect, useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";

export default function SuperAdminPanel() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  const [teamsForView, setTeamsForView] = useState([]);
  const [usersForView, setUsersForView] = useState([]);

  const [newProject, setNewProject] = useState("");
  const [newTeam, setNewTeam] = useState("");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [viewProjectId, setViewProjectId] = useState("");
  const [viewTeamId, setViewTeamId] = useState("");
  const [selectedUserForTeam, setSelectedUserForTeam] = useState("");
  const [selectedTeamForUser, setSelectedTeamForUser] = useState("");

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Get initial theme preference
  const getInitialTheme = useCallback(() => {
    // Since we can't use localStorage in artifacts, we'll use system preference
    return window.matchMedia("(prefers-color-scheme: white)").matches;
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((isDark) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const initialDarkMode = getInitialTheme();
    setDarkMode(initialDarkMode);
    applyTheme(initialDarkMode);
    setIsThemeLoaded(true);
  }, [getInitialTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      const newDarkMode = e.matches;
      setDarkMode(newDarkMode);
      applyTheme(newDarkMode);
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

  // Keyboard accessibility for theme toggle
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme();
    }
  }, [toggleTheme]);

  useEffect(() => {
    fetch("http://localhost/tickets-api/get_projects.php")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Eroare proiecte:", err));

    fetch("http://localhost/tickets-api/get_all_teams.php")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Eroare echipe:", err));

    fetch("http://localhost/tickets-api/get_all_users.php")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Eroare utilizatori:", err));
  }, []);

  useEffect(() => {
    if (viewProjectId) {
      fetch(`http://localhost/tickets-api/get_teams_by_project.php?id_project=${viewProjectId}`)
        .then(res => res.json())
        .then(data => setTeamsForView(data))
        .catch(err => console.error("Eroare la fetch teams:", err));
    } else {
      setTeamsForView([]);
    }
  }, [viewProjectId]);

  useEffect(() => {
    if (viewTeamId) {
      fetch(`http://localhost/tickets-api/get_users_by_team.php?id_team=${viewTeamId}`)
        .then(res => res.json())
        .then(data => setUsersForView(data))
        .catch(err => console.error("Eroare la fetch users:", err));
    } else {
      setUsersForView([]);
    }
  }, [viewTeamId]);

  const createProject = () => {
    if (!newProject.trim()) return alert("Introduceți numele proiectului.");
    fetch("http://localhost/tickets-api/create_project.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: newProject })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Proiect creat cu succes!");
          setNewProject("");
        } else {
          alert("Eroare: " + data.message);
        }
      })
      .catch((err) => console.error("Eroare creare proiect:", err));
  };

  const createTeam = () => {
    if (!newTeam.trim()) return alert("Introduceți numele echipei.");
    if (!selectedProject) return alert("Selectați un proiect pentru echipă.");
    fetch("http://localhost/tickets-api/create_team.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeam, id_project: selectedProject })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Echipă creată cu succes!");
          setNewTeam("");
        } else {
          alert("Eroare: " + data.message);
        }
      })
      .catch((err) => console.error("Eroare creare echipă:", err));
  };

  const assignAdminToProject = () => {
    if (!selectedProject || !selectedAdmin) return alert("Selectați un proiect și un administrator.");
    fetch("http://localhost/tickets-api/assign_admin_to_project.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject, adminId: selectedAdmin })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Admin asignat la proiect.");
        }
      });
  };

  const assignProjectToTeam = () => {
    if (!selectedProject || !selectedTeam) return alert("Selectați un proiect și o echipă.");
    fetch("http://localhost/tickets-api/assign_project_to_team.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject, teamId: selectedTeam })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Proiect asignat echipei.");
        }
      });
  };

  const assignUserToTeam = () => {
    if (!selectedUserForTeam || !selectedTeamForUser) {
      alert("Selectează utilizator și echipă.");
      return;
    }
    fetch("http://localhost/tickets-api/assign_user_to_team.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_user: selectedUserForTeam,
        id_team: selectedTeamForUser
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Utilizatorul a fost asignat echipei.");
        } else {
          alert("Eroare: " + data.message);
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Create Project */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creare Proiect</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nume Proiect"
              />
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                onClick={createProject}
              >
                Creează Proiect
              </button>
            </div>
          </div>

          {/* Create Team */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creare Echipă</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nume Echipă"
              />
              <select 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Selectează Proiect</option>
                {projects.map((proj) => (
                  <option key={proj.id_project} value={proj.id_project}>{proj.provider}</option>
                ))}
              </select>
              <button 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                onClick={createTeam}
              >
                Creează Echipă
              </button>
            </div>
          </div>
        </div>

        {/* Assignment Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Assign Admin to Project */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin → Proiect</h2>
            </div>
            <div className="space-y-4">
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">Proiect</option>
                {projects.map((proj) => (
                  <option key={proj.id_project} value={proj.id_project}>{proj.provider}</option>
                ))}
              </select>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={selectedAdmin} onChange={(e) => setSelectedAdmin(e.target.value)}>
                {users.filter((u) => u.rol === "admin").map((user) => (
                  <option key={user.id_user} value={user.id_user}>{user.nume}</option>
                ))}
              </select>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg" onClick={assignAdminToProject}>
                Asignează
              </button>
            </div>
          </div>

          {/* Assign Project to Team */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Proiect → Echipă</h2>
            </div>
            <div className="space-y-4">
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
                <option value="">Proiect</option>
                {projects.map((proj) => (
                  <option key={proj.id_project} value={proj.id_project}>{proj.provider}</option>
                ))}
              </select>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                <option value="">Echipă</option>
                {teams.map((team) => (
                  <option key={team.id_team} value={team.id_team}>{team.team_name}</option>
                ))}
              </select>
              <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg" onClick={assignProjectToTeam}>
                Asignează
              </button>
            </div>
          </div>

          {/* Assign User to Team */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User → Echipă</h2>
            </div>
            <div className="space-y-4">
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedUserForTeam}
                onChange={(e) => setSelectedUserForTeam(e.target.value)}
              >
                <option value="">Utilizator</option>
                {users.map((user) => (
                  <option key={user.id_user} value={user.id_user}>
                    {user.nume}
                  </option>
                ))}
              </select>
              <select
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedTeamForUser}
                onChange={(e) => setSelectedTeamForUser(e.target.value)}
              >
                <option value="">Echipă</option>
                {teams.map((team) => (
                  <option key={team.id_team} value={team.id_team}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <button
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
                onClick={assignUserToTeam}
              >
                Asignează
              </button>
            </div>
          </div>
        </div>

        {/* View Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Teams by Project */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Echipe din Proiect</h2>
            </div>
            <select 
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 mb-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
              onChange={(e) => setViewProjectId(e.target.value)} 
              value={viewProjectId}
            >
              <option value="">Selectează Proiect</option>
              {projects.map((proj) => (
                <option key={proj.id_project} value={proj.id_project}>{proj.provider}</option>
              ))}
            </select>
            {viewProjectId && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Nume Echipă</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {teamsForView.map((team, index) => (
                      <tr key={team.id_team} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{team.id_team}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{team.team_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Users by Team */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Utilizatori din Echipă</h2>
            </div>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 mb-6" 
              onChange={(e) => setViewTeamId(e.target.value)} 
              value={viewTeamId}
            >
              <option value="">Selectează Echipă</option>
              {teams.map((team) => (
                <option key={team.id_team} value={team.id_team}>{team.team_name}</option>
              ))}
            </select>
            {viewTeamId && (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-50 to-pink-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nume</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usersForView.map((user, index) => (
                      <tr key={user.id_user} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.id_user}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.nume}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.mail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* All Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Toți Utilizatorii</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-teal-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nume</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Echipă</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.id_user} className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.id_user}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.nume}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.mail}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.team_name ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>
                        {user.team_name ?? "N/A"}
                      </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}