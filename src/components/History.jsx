import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function History() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) navigate("/");
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const res = await axios.get("http://localhost:3000/history", {
      withCredentials: true,
    });
    setHistory(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Histórico de Alterações</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Voltar
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          {history.map((entry) => (
            <div key={entry.id} className="border-b py-2">
              <p>
                <strong>{entry.userName}</strong>{" "}
                {entry.action === "create"
                  ? "criou"
                  : entry.action === "update"
                  ? "alterou"
                  : "deletou"}{" "}
                uma reserva em {new Date(entry.timestamp).toLocaleString()}.
              </p>
              {entry.eventDetails && (
                <p>Detalhes: {entry.eventDetails}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;