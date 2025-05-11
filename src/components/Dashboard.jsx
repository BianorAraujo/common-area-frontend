import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosConfig";
import Navbar from "./dashboard/Navbar";
import MobileMenu from "./dashboard/MobileMenu";
import ReservationHeader from "./dashboard/ReservationHeader";
import ReservationCalendar from "./dashboard/ReservationCalendar";
import ReservationTable from "./dashboard/ReservationTable";
import ReservationModal from "./dashboard/ReservationModal";
import toast, { Toaster } from "react-hot-toast";

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
  const [endTime, setEndTime] = useState("11:00 PM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [isDayFullyBooked, setIsDayFullyBooked] = useState(false);

  const building = new URLSearchParams(location.search).get("building") || null;

  // Funções de formatação para ExportExcel
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeDisplay = (eventDetails) => {
    try {
      const details = typeof eventDetails === "string" ? JSON.parse(eventDetails) : eventDetails;
      const start = new Date(details.start);
      const end = new Date(details.end);
      const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      };
      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch (err) {
      console.error("Error formatting time:", err);
      return "N/A";
    }
  };

  // Handlers para exportação
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
      setError("");
    } catch (err) {
      console.error("Error fetching reservations:", err);
      toast.error("Failed to load reservations. Please try again.", {
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

  // Filtrar, ordenar reservas e verificar se o dia está completamente reservado
  useEffect(() => {
    const filterReservationsByDate = () => {
      const selectedDateStr = selectedDate.toLocaleDateString("en-CA"); // Formato YYYY-MM-DD
      const filtered = reservations
        .filter((reservation) => {
          const reservationDateStr = new Date(reservation.start).toLocaleDateString("en-CA");
          return reservationDateStr === selectedDateStr;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start));

      // Verificar se o dia está completamente reservado (8:00 AM a 11:00 PM sem lacunas)
      let fullyBooked = false;
      if (filtered.length > 0) {
        const firstReservation = filtered[0];
        const lastReservation = filtered[filtered.length - 1];
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(8, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 0, 0, 0);

        const startsAt8AM = new Date(firstReservation.start).getTime() === startOfDay.getTime();
        const endsAt11PM = new Date(lastReservation.end).getTime() === endOfDay.getTime();

        let noGaps = true;
        for (let i = 0; i < filtered.length - 1; i++) {
          const currentEnd = new Date(filtered[i].end).getTime();
          const nextStart = new Date(filtered[i + 1].start).getTime();
          if (currentEnd !== nextStart) {
            noGaps = false;
            break;
          }
        }

        fullyBooked = startsAt8AM && endsAt11PM && noGaps;
      }

      setFilteredReservations(filtered);
      setIsDayFullyBooked(fullyBooked);
    };
    filterReservationsByDate();
  }, [reservations, selectedDate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddButtonClick = () => {
    setIsModalOpen(true);
    setStartTime("8:00 AM");
    setEndTime("11:00 PM");
    setIsAllDay(true);
    setEditingReservationId(null);
    setOwnerName(user.name);
    setError("");
  };

  const handleEditReservation = (reservation) => {
    const start = new Date(reservation.start);
    const end = new Date(reservation.end);
    const isAllDayReservation =
      start.getHours() === 8 &&
      start.getMinutes() === 0 &&
      end.getHours() === 23 &&
      end.getMinutes() === 0;

    setIsModalOpen(true);
    setSelectedDate(new Date(reservation.start));
    setIsAllDay(isAllDayReservation);

    if (isAllDayReservation) {
      setStartTime("8:00 AM");
      setEndTime("11:00 PM");
    } else {
      const formatTime = (date) => {
        let hours = date.getHours();
        const period = hours < 12 ? "AM" : "PM";
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const minutes = date.getMinutes();
        return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
      };
      setStartTime(formatTime(start));
      setEndTime(formatTime(end));
    }
    setEditingReservationId(reservation.id);
    setOwnerName(reservation.ownerName);
    setError("");
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) {
      return;
    }
    try {
      const reservation = filteredReservations.find((r) => r.id === id);
      if (!reservation) {
        toast.error("Reservation not found.", {
          style: {
            background: "#FEE2E2",
            color: "#991B1B",
            fontSize: "14px",
            padding: "12px",
            borderRadius: "8px",
          },
        });
        return;
      }
      console.log(`Deleting reservation ID: ${id}`);
      await axios.delete(`/reservations/${id}`, {
        data: {
          userName: user.name,
          building,
          start: reservation.start,
          end: reservation.end,
          ownerName: reservation.ownerName,
        },
      });
      fetchReservations();
      setError("");
    } catch (err) {
      console.error("Error deleting reservation:", err);
      toast.error(err.response?.data?.error || "Failed to delete reservation.", {
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

  const handleDateClick = (date) => {
    setSelectedDate(new Date(date.setHours(0, 0, 0, 0)));
  };

  const handleAddOrUpdateReservation = async (ownerName) => {
    try {
      const startDateTime = new Date(selectedDate.getTime());
      startDateTime.setHours(0, 0, 0, 0);

      let startHours, endHours, endMinutes;

      if (isAllDay) {
        startHours = 8;
        endHours = 23;
        endMinutes = 0;
        startDateTime.setHours(8, 0, 0, 0);
        const endDateTime = new Date(startDateTime.getTime());
        endDateTime.setHours(23, 0, 0, 0);
        const reservation = {
          building,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          userId: user.id,
          userName: user.name,
          ownerName,
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
        ({ hours: endHours, minutes: endMinutes } = parseTime(endTime));
        if (startHours < 8 || endHours > 23 || (endHours === 23 && endMinutes > 0)) {
          setError("Reservations are only allowed between 8:00 AM and 11:00 PM.");
          toast.error("Reservations are only allowed between 8:00 AM and 11:00 PM.", {
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              fontSize: "14px",
              padding: "12px",
              borderRadius: "8px",
            },
          });
          return;
        }
        startDateTime.setHours(startHours, 0, 0, 0);
        const endDateTime = new Date(startDateTime.getTime());
        endDateTime.setHours(endHours, endMinutes || 0, 0, 0);
        if (endDateTime <= startDateTime) {
          setError("End time must be after start time.");
          toast.error("End time must be after start time.", {
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              fontSize: "14px",
              padding: "12px",
              borderRadius: "8px",
            },
          });
          return;
        }
        const reservation = {
          building,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          userId: user.id,
          userName: user.name,
          ownerName,
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
      setEndTime("11:00 PM");
      setIsAllDay(true);
      setEditingReservationId(null);
      setOwnerName(user.name);
      setError("");
      fetchReservations();
    } catch (err) {
      console.error("Error adding/updating reservation:", err);
      const errorMessage = err.response?.data?.error || "Failed to add or update reservation.";
      setError(errorMessage);
      toast.error(errorMessage, {
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

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 23; hour++) {
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour <= 12 ? hour : hour - 12;
      const time = `${displayHour}:00 ${period}`;
      times.push(time);
    }
    return times;
  };

  const formatDateForInput = (date) => {
    return date.toLocaleDateString("en-CA");
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const dateStr = date.toLocaleDateString("en-CA");
    const dayReservations = reservations
      .filter((reservation) => {
        const reservationDateStr = new Date(reservation.start).toLocaleDateString("en-CA");
        return reservationDateStr === dateStr;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    let isFullyBooked = false;
    if (dayReservations.length > 0) {
      const firstReservation = dayReservations[0];
      const lastReservation = dayReservations[dayReservations.length - 1];
      const startOfDay = new Date(date);
      startOfDay.setHours(8, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 0, 0, 0);

      const startsAt8AM = new Date(firstReservation.start).getTime() === startOfDay.getTime();
      const endsAt11PM = new Date(lastReservation.end).getTime() === endOfDay.getTime();

      let noGaps = true;
      for (let i = 0; i < dayReservations.length - 1; i++) {
        const currentEnd = new Date(dayReservations[i].end).getTime();
        const nextStart = new Date(dayReservations[i + 1].start).getTime();
        if (currentEnd !== nextStart) {
          noGaps = false;
          break;
        }
      }

      isFullyBooked = startsAt8AM && endsAt11PM && noGaps;
    }

    const hasReservations = dayReservations.length > 0;

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
          <ReservationHeader
            building={building}
            isDayFullyBooked={isDayFullyBooked}
            handleAddButtonClick={handleAddButtonClick}
          />
          <ReservationCalendar
            selectedDate={selectedDate}
            reservations={reservations}
            handleDateClick={handleDateClick}
            getTileClassName={getTileClassName}
          />
          <ReservationTable
            filteredReservations={filteredReservations}
            handleEditReservation={handleEditReservation}
            handleDeleteReservation={handleDeleteReservation}
          />
          <ReservationModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            isAllDay={isAllDay}
            setIsAllDay={setIsAllDay}
            editingReservationId={editingReservationId}
            setEditingReservationId={setEditingReservationId}
            error={error}
            setError={setError}
            handleAddOrUpdateReservation={handleAddOrUpdateReservation}
            generateTimeOptions={generateTimeOptions}
            formatDateForInput={formatDateForInput}
            user={user}
            ownerName={ownerName}
            setOwnerName={setOwnerName}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;