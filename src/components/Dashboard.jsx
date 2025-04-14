import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [building, setBuilding] = useState("Bloco A");
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: "", start: "", end: "" });

  useEffect(() => {
    if (!user) navigate("/");
    fetchEvents();
  }, [user, building]);

  const fetchEvents = async () => {
    const res = await axios.get(`http://localhost:3000/reservations/${building}`, {
      withCredentials: true,
    });
    setEvents(res.data);
  };

  const handleAddEvent = async () => {
    if (newEvent.date && newEvent.start && newEvent.end) {
      const event = {
        title: `Reserva de ${user.name}`,
        start: `${newEvent.date}T${newEvent.start}`,
        end: `${newEvent.date}T${newEvent.end}`,
        building,
        userId: user.id,
        userName: user.name,
      };
      await axios.post("http://localhost:3000/reservations", event, {
        withCredentials: true,
      });
      fetchEvents();
      setNewEvent({ date: "", start: "", end: "" });
    }
  };

  const handleUpdateEvent = async (eventId, updatedEvent) => {
    await axios.put(
      `http://localhost:3000/reservations/${eventId}`,
      { ...updatedEvent, userName: user.name },
      { withCredentials: true }
    );
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    await axios.delete(`http://localhost:3000/reservations/${eventId}`, {
      data: { userName: user.name },
      withCredentials: true,
    });
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Reserva de Salão - {building}</h1>
          <div>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="mr-2 p-2 rounded"
            >
              <option>Bloco A</option>
              <option>Bloco B</option>
              <option>Bloco C</option>
            </select>
            <button
              onClick={() => navigate("/history")}
              className="mr-2 bg-gray-500 text-white py-2 px-4 rounded"
            >
              Histórico
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white py-2 px-4 rounded"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md mb-4">
          <h2 className="text-lg font-semibold mb-2">Nova Reserva</h2>
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            className="p-2 mb-2 w-full rounded border"
          />
          <input
            type="time"
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            className="p-2 mb-2 w-full rounded border"
          />
          <input
            type="time"
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            className="p-2 mb-2 w-full rounded border"
          />
          <button
            onClick={handleAddEvent}
            className="w-full bg-green-500 text-white py-2 rounded"
          >
            Adicionar Reserva
          </button>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          eventClick={(info) => {
            if (confirm("Deseja deletar esta reserva?")) {
              handleDeleteEvent(info.event.id);
            }
          }}
          editable
          eventDrop={(info) => {
            handleUpdateEvent(info.event.id, {
              start: info.event.start.toISOString(),
              end: info.event.end.toISOString(),
            });
          }}
          slotMinTime="08:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />
      </div>
    </div>
  );
}

export default Dashboard;