import { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "./../axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUser = async (token) => {
    try {
      if (!token) {
        console.log("Nenhum token fornecido para fetchUser.");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("Fazendo requisição para /auth/user com token:", token);
      const res = await axios.get("/auth/user");
      console.log("Resposta de /auth/user:", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Verificando URL:", location.pathname + location.search);
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");

    if (token) {
      console.log("Token encontrado na URL:", token);
      localStorage.setItem("jwt", token);
      console.log("Limpando parâmetro token da URL, redirecionando para: /select-building");
      navigate("/select-building", { replace: true });
      fetchUser(token);
    } else {
      const storedToken = localStorage.getItem("jwt");
      console.log("Token no localStorage:", storedToken || "Nenhum");
      fetchUser(storedToken);
    }
  }, [location.search, navigate]);

  const logout = async () => {
    try {
      await axios.get("/auth/logout");
      localStorage.removeItem("jwt");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-vesta-text">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-vesta-dark"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-semibold">Loading... wait a moment!</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};