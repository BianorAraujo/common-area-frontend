import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosConfig";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState("8:00 AM");
  const [endTime, setEndTime] = useState("9:00 AM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [error, setError] = useState("");

  const building = new URLSearchParams(location.search).get("building") || null;

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated, redirecting to /");
      navigate("/");
    } else if (!building) {
      console.log("No building specified, redirecting to building selection");
      navigate("/building-selection");
    } else {
      fetchReservations();
    }
  }, [user, building, navigate]);

  const fetchReservations = async () => {
    try {
      const url = `/reservations/${encodeURIComponent(building)}`;
      console.log("Fetching reservations:", url);
      const res = await axios.get(url);
      console.log("Reservations received:", res.data);
      setReservations(res.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Failed to load reservations. Please try again.");
    }
  };

  // Filtrar reservas por selectedDate
  useEffect(() => {
    const filterReservationsByDate = () => {
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      const filtered = reservations.filter((reservation) => {
        const reservationDateStr = new Date(reservation.start).toISOString().split("T")[0];
        return reservationDateStr === selectedDateStr;
      });
      setFilteredReservations(filtered);
    };
    filterReservationsByDate();
  }, [reservations, selectedDate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddButtonClick = () => {
    setIsModalOpen(true);
    setSelectedDate(new Date());
    setStartTime("8:00 AM");
    setEndTime("9:00 AM");
    setIsAllDay(false);
    setEditingReservationId(null);
    setError("");
  };

  const handleEditReservation = (reservation) => {
    const start = new Date(reservation.start);
    const end = new Date(reservation.end);
    const isAllDayReservation =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 23 &&
      end.getMinutes() === 59;

    setIsModalOpen(true);
    setSelectedDate(start);
    setIsAllDay(isAllDayReservation);
    if (!isAllDayReservation) {
      setStartTime(
        start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      );
      setEndTime(
        end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      );
    } else {
      setStartTime("12:00 AM");
      setEndTime("11:59 PM");
    }
    setEditingReservationId(reservation.id);
    setError("");
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) {
      return;
    }
    try {
      const reservation = filteredReservations.find((r) => r.id === id);
      if (!reservation) {
        setError("Reservation not found.");
        return;
      }
      console.log(`Deleting reservation ID: ${id}`);
      await axios.delete(`/reservations/${id}`, {
        data: {
          userName: user.name,
          building,
          start: reservation.start,
          end: reservation.end,
        },
      });
      fetchReservations();
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setError(err.response?.data?.error || "Failed to delete reservation.");
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddOrUpdateReservation = async () => {
    try {
      const startDateTime = new Date(selectedDate);
      let startHours, endHours;

      if (isAllDay) {
        startHours = 0;
        endHours = 23;
        startDateTime.setHours(0, 0, 0, 0);
        const endDateTime = new Date(selectedDate);
        endDateTime.setHours(23, 59, 0, 0);
        if (endDateTime <= startDateTime) {
          setError("Invalid time range");
          return;
        }
        const reservation = {
          building,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          userId: user.id,
          userName: user.name,
        };
        if (editingReservationId) {
          console.log("Updating reservation:", { id: editingReservationId, ...reservation });
          await axios.put(`/reservations/${editingReservationId}`, reservation);
        } else {
          console.log("Adding reservation:", reservation);
          await axios.post("/reservations", reservation);
        }
      } else {
        const parseTime = (timeStr) => {
          const [time, period] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
          if (period === "PM" && hours !== 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          return { hours, minutes };
        };
        ({ hours: startHours } = parseTime(startTime));
        const { hours: endHours, minutes: endMinutes } = parseTime(endTime);
        startDateTime.setHours(startHours, 0, 0, 0);
        const endDateTime = new Date(selectedDate);
        endDateTime.setHours(endHours, endMinutes || 0, 0, 0);
        if (endDateTime <= startDateTime) {
          setError("End time must be after start time");
          return;
        }
        const reservation = {
          building,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          userId: user.id,
          userName: user.name,
        };
        if (editingReservationId) {
          console.log("Updating reservation:", { id: editingReservationId, ...reservation });
          await axios.put(`/reservations/${editingReservationId}`, reservation);
        } else {
          console.log("Adding reservation:", reservation);
          await axios.post("/reservations", reservation);
        }
      }

      setIsModalOpen(false);
      setStartTime("8:00 AM");
      setEndTime("9:00 AM");
      setIsAllDay(false);
      setEditingReservationId(null);
      setError("");
      fetchReservations();
    } catch (err) {
      console.error("Error adding/updating reservation:", err);
      setError(err.response?.data?.error || "Failed to add or update reservation.");
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour <= 12 ? hour : hour - 12;
      const time = `${displayHour}:00 ${period}`;
      times.push(time);
    }
    return times;
  };

  // Formatar data para input type="date" (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Estilizar dias no calendário
  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const dateStr = date.toISOString().split("T")[0];
    const dayReservations = reservations.filter((reservation) => {
      const reservationDateStr = new Date(reservation.start).toISOString().split("T")[0];
      return reservationDateStr === dateStr;
    });

    // Verificar se o dia está totalmente reservado (00:00 a 23:59)
    const isFullyBooked = dayReservations.some((reservation) => {
      const start = new Date(reservation.start);
      const end = new Date(reservation.end);
      return (
        start.getHours() === 0 &&
        start.getMinutes() === 0 &&
        end.getHours() === 23 &&
        end.getMinutes() === 59
      );
    });

    // Verificar se o dia tem alguma reserva
    const hasReservations = dayReservations.length > 0;

    // Estilos
    if (selectedDate.toDateString() === date.toDateString()) {
      return "bg-vesta-dark text-white rounded-lg";
    }
    if (isFullyBooked) {
      return "bg-red-100 rounded-lg";
    }
    if (hasReservations) {
      return "bg-yellow-100 rounded-lg";
    }
    return "bg-white rounded-lg hover:bg-vesta-light/20";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-50 shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-vesta-text hover:text-vesta-light transition-colors duration-300"
          title="Back to building selection"
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
        <div className="text-lg font-medium text-vesta-text">
          Hi, {user?.name || "User"}
        </div>
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
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-vesta-text">
              {building || "Unknown"}
            </h1>
            <button
              onClick={handleAddButtonClick}
              className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
            >
              Add Reservation
            </button>
          </div>

          {/* Calendário */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl shadow-md p-4">
              <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
                className="border-none bg-transparent w-full"
                tileClassName={getTileClassName}
              />
            </div>
          </div>

          {/* Lista de Reservas */}
          <div className="bg-gray-50 rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-vesta-dark shadow-inner">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation, index) => (
                    <tr
                      key={reservation.id}
                      className={`transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-vesta-light/20`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{reservation.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{reservation.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                        {new Date(reservation.start).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                        {new Date(reservation.end).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="text-vesta-text hover:text-vesta-dark"
                            title="Edit"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="text-vesta-text hover:text-red-600"
                            title="Delete"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No reservations for this day
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Adicionar ou Editar Reserva */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-50 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-vesta-text mb-4">
              {editingReservationId ? "Edit Reservation" : "Add Reservation"}
            </h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="mb-4">
              <label htmlFor="reservation-date" className="block text-sm font-medium text-gray-500 mb-2">
                Date
              </label>
              <input
                type="date"
                id="reservation-date"
                value={formatDateForInput(selectedDate)}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="h-5 w-5 text-vesta-dark focus:ring-vesta-light border-gray-200 rounded"
                />
                <span className="ml-2 text-sm font-medium text-vesta-text">All Day</span>
              </label>
            </div>
            <div className="mb-4">
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-500 mb-2">
                Start Time
              </label>
              <select
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isAllDay}
                className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300 appearance-none custom-select"
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-500 mb-2">
                End Time
              </label>
              <select
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isAllDay}
                className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300 appearance-none custom-select"
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingReservationId(null);
                }}
                className="bg-gray-300 text-vesta-text py-2 px-4 rounded-xl hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateReservation}
                className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
              >
                {editingReservationId ? "Update" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;