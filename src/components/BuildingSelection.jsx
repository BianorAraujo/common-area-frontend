import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import Navbar from "./dashboard/Navbar";
import MobileMenu from "./dashboard/MobileMenu";
import toast, { Toaster } from "react-hot-toast";

const BuildingSelection = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to /");
      navigate("/");
    } else {
      fetchHistory();
    }
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      console.log("Fetching history");
      const res = await axios.get("/history");
      console.log("History received:", res.data);
      setHistory(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.response?.data?.error || "Failed to load history. Please try again.");
    }
  };

  const handleSelectBuilding = (building) => {
    console.log(`Building selected: ${building}`);
    navigate(`/dashboard?building=${encodeURIComponent(building)}`);
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
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
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-vesta-text mb-6">
            Choose a Building
          </h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSelectBuilding("One Three North")}
              className="bg-vesta-dark text-white py-4 px-8 rounded-xl shadow-md hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105 text-lg"
            >
              One Three North
            </button>
            <button
              onClick={() => handleSelectBuilding("Two Three North")}
              className="bg-vesta-dark text-white py-4 px-8 rounded-xl shadow-md hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105 text-lg"
            >
              Two Three North
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingSelection;