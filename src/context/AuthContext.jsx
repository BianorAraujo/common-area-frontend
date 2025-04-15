import { createContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Erro 401 é esperado quando o usuário não está autenticado, não logar no console
        setUser(null);
      } else {
        console.error("Erro ao buscar usuário:", err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  const logout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, { withCredentials: true });
      setUser(null);
      window.location.href = "/";
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