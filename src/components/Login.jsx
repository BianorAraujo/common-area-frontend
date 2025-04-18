import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosConfig"; // Sua instância do Axios

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

//function Login() {
const Login = () => {
  useEffect(() => {
  // const { user, fetchUser } = useContext(AuthContext);
  // const navigate = useNavigate();
  // const location = useLocation();

  // Verificar se há um código de callback do Google na URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  if (code) {
      // Fazer a requisição para /auth/google/callback
      axios
      .get(`/auth/google/callback${window.location.search}`)
      .then((response) => {
        console.log("Resposta de /auth/google/callback:", response.data);
        // Redirecionar para a URL retornada
        window.location.href = response.data.redirectUrl;
      })
      .catch((err) => {
        console.error("Erro no callback do Google:", err);
      });
    }
  
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "https://common-area-api.onrender.com/auth/google";
  };

  // useEffect(() => {
  //   if (user) {
  //     navigate("/dashboard", { replace: true });
  //   }
  // }, [user, navigate]);

  // useEffect(() => {
  //   if (location.pathname === "/dashboard" && !user) {
  //     fetchUser();
  //   }
  // }, [location, user, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Vesta - Common Area</h1>
        {/* <a
          href={`${API_URL}/auth/google`}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center block"
        >
          Login with Google
        </a> */}
        <button onClick={handleGoogleLogin}>Login com Google</button>
      </div>
    </div>
  );
}

export default Login;