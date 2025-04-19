import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "../axiosConfig"; // Use a instância configurada

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [building, setBuilding] = useState("Bloco A");
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ date: "", start: "", end: "" });

  useEffect(() => {
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para /");
      navigate("/");
    } else {
      fetchEvents();
    }
  }, [user, building, navigate]);

  const fetchEvents = async () => {
    try {
      console.log(`Buscando reservas para o prédio: ${building}`);
      const res = await axios.get(`/reservations/${building}`);
      console.log("Reservas recebidas:", res.data);
      setEvents(res.data);
    } catch (err) {
      console.error("Erro ao buscar reservas:", err);
      alert("Erro ao buscar reservas: " + (err.response?.data?.error || err.message));
    }
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
      try {
        console.log("Enviando reserva:", event);
        const res = await axios.post("/reservations", event);
        console.log("Reserva criada:", res.data);
        fetchEvents();
        setNewEvent({ date: "", start: "", end: "" });
        alert("Reserva criada com sucesso! ID: " + res.data.id);
      } catch (err) {
        console.error("Erro ao salvar reserva:", err);
        alert("Erro ao salvar reserva: " + (err.response?.data?.error || err.message));
      }
    } else {
      console.log("Campos obrigatórios ausentes:", newEvent);
      alert("Por favor, preencha todos os campos.");
    }
  };

  const handleUpdateEvent = async (eventId, updatedEvent) => {
    try {
      console.log(`Atualizando reserva ${eventId}:`, updatedEvent);
      await axios.put(`/reservations/${eventId}`, {
        ...updatedEvent,
        userName: user.name,
      });
      console.log("Reserva atualizada com sucesso");
      fetchEvents();
    } catch (err) {
      console.error("Erro ao atualizar reserva:", err);
      alert("Erro ao atualizar reserva: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      console.log(`Deletando reserva ${eventId}`);
      await axios.delete(`/reservations/${eventId}`, {
        data: { userName: user.name },
      });
      console.log("Reserva deletada com sucesso");
      fetchEvents();
    } catch (err) {
      console.error("Erro ao deletar reserva:", err);
      alert("Erro ao deletar reserva: " + (err.response?.data?.error || err.message));
    }
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