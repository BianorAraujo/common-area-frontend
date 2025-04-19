import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    console.log("Iniciando login com Google...");
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Login com Google</button>
    </div>
  );
};

export default Login;