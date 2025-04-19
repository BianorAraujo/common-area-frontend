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
      // Limpar o parâmetro token da URL
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

  if (loading) return <div>Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};