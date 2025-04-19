import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  console.log("ProtectedRoute - Estado:", { user, loading });

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    console.log("Usuário não autenticado, redirecionando para /");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;