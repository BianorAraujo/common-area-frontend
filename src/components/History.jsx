import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import Navbar from "./dashboard/Navbar";
import MobileMenu from "./dashboard/MobileMenu";
import toast, { Toaster } from "react-hot-toast";

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
      toast.error(err.response?.data?.error || "Failed to load history. Please try again.", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          fontSize: "14px",
          padding: "12px",
          borderRadius: "8px",
        },
      });
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
        return action || "N/A";
    }
  };

  const formatTimeDisplay = (eventDetails) => {
    try {
      const { start, end } = JSON.parse(eventDetails);
      const startDate = new Date(start);
      const endDate = new Date(end);
      const isAllDayReservation =
        startDate.getHours() === 8 &&
        startDate.getMinutes() === 0 &&
        endDate.getHours() === 23 &&
        endDate.getMinutes() === 0;
      return isAllDayReservation
        ? "All Day"
        : `${startDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })} - ${endDate.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}`;
    } catch (err) {
      console.error("Error parsing eventDetails:", err);
      return "Invalid Time";
    }
  };

  const formatDate = (eventDetails) => {
    try {
      const { start } = JSON.parse(eventDetails);
      return new Date(start).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (err) {
      console.error("Error parsing eventDetails for date:", err);
      return "N/A";
    }
  };

  const onExportError = (errorMessage) => {
    toast.error(errorMessage, {
      style: {
        background: "#FEE2E2",
        color: "#991B1B",
        fontSize: "14px",
        padding: "12px",
        borderRadius: "8px",
      },
    });
  };

  const onExportSuccess = () => {
    toast.success("Worksheet exported successfully.", {
      style: {
        background: "#DCFCE7",
        color: "#166534",
        fontSize: "14px",
        padding: "12px",
        borderRadius: "8px",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Navbar
        user={user}
        logout={logout}
        toggleMenu={toggleMenu}
        formatAction={formatAction}
        formatDate={formatDate}
        formatTimeDisplay={formatTimeDisplay}
        onExportError={onExportError}
        onExportSuccess={onExportSuccess}
      />
      <MobileMenu
        isMenuOpen={isMenuOpen}
        navigate={navigate}
        logout={logout}
        setIsMenuOpen={setIsMenuOpen}
        formatAction={formatAction}
        formatDate={formatDate}
        formatTimeDisplay={formatTimeDisplay}
        onExportError={onExportError}
        onExportSuccess={onExportSuccess}
      />
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Building</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Scheduled By</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {formatAction(entry.action)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {details.ownerName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {details.building || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {formatDate(entry.eventDetails)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {formatTimeDisplay(entry.eventDetails)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                          {entry.userName || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
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