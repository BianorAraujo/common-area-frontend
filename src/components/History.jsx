import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";

const History = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [filterBuilding, setFilterBuilding] = useState("All");

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to /");
      navigate("/");
    } else {
      fetchHistory();
    }
  }, [user, filterBuilding, navigate]);

  const fetchHistory = async () => {
    try {
      console.log(`Fetching history${filterBuilding !== "All" ? ` for building: ${filterBuilding}` : ""}`);
      const url = filterBuilding === "All" ? "/history" : `/history?building=${encodeURIComponent(filterBuilding)}`;
      console.log("Request URL:", url);
      const res = await axios.get(url);
      console.log("History received:", res.data);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      alert("Error fetching history: " + (err.response?.data?.error || err.message));
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAction = (action) => {
    switch (action) {
      case "create":
        return "Created";
      case "update":
        return "Updated";
      case "delete":
        return "Deleted";
      default:
        return action;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-50 shadow-sm p-4 flex justify-between items-center">
        {/* Botão de Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="text-vesta-text hover:text-vesta-light transition-colors duration-300"
          title="Back to previous page"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Nome do Usuário */}
        <div className="text-lg font-medium text-vesta-text">
          Hi, {user?.name || "User"}
        </div>

        {/* Botões em Desktop */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => navigate("/history")}
            className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
          >
            History
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white py-2 px-4 rounded-xl border border-red-600/20 hover:bg-red-700 hover:border-red-700/20 transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Botão Sanduíche em Mobile */}
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-vesta-text hover:text-vesta-light transition-colors duration-300">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Menu Dropdown em Mobile */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gray-50 shadow-lg p-4 absolute top-16 right-4 rounded-xl z-10">
          <button
            onClick={() => {
              navigate("/history");
              setIsMenuOpen(false);
            }}
            className="block w-full text-left text-vesta-text py-2 px-4 hover:bg-vesta-light/20 rounded transition-colors duration-300"
          >
            History
          </button>
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left text-red-600 py-2 px-4 hover:bg-vesta-light/20 rounded transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-grow p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-vesta-text mb-6">Reservation History</h1>
          <div className="mb-6 relative">
            <label htmlFor="building-filter" className="block text-sm font-medium text-gray-500 mb-2">
              Filter by Building
            </label>
            <div className="relative w-full sm:w-64">
              <select
                id="building-filter"
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="p-3 pr-10 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300 appearance-none"
              >
                <option value="All">All Buildings</option>
                <option value="One Three North">One Three North</option>
                <option value="Two Three North">Two Three North</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vesta-text pointer-events-none z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-vesta-dark shadow-inner">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Building</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.length > 0 ? (
                  history.map((entry, index) => {
                    const details = JSON.parse(entry.eventDetails || "{}");
                    return (
                      <tr
                        key={`${entry.eventId}-${entry.timestamp}`}
                        className={`transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-vesta-light/20`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{entry.eventId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{details.building || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {details.start ? new Date(details.start).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {details.start
                            ? new Date(details.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {details.end
                            ? new Date(details.end).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{entry.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {formatAction(entry.action)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;