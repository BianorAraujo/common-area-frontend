import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Login() {
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.pathname === "/dashboard" && !user) {
      fetchUser();
    }
  }, [location, user, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Vesta - Common Area</h1>
        <a
          href={`${API_URL}/auth/google`}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-center block"
        >
          Login with Google
        </a>
      </div>
    </div>
  );
}

export default Login;