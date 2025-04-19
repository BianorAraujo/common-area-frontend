import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    console.log("Iniciando login com Google...");
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  // return (
  //   <div>
  //     <button onClick={handleGoogleLogin}>Login com Google</button>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Welcome to Vesta's Common Area
      </h1>
      <button
        onClick={handleGoogleLogin}
        className="flex items-center bg-[#FFFFFF] text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-200 transition-colors"
      >
        <svg
          className="w-6 h-6 mr-3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-1.02 2.53-2.17 3.31v2.75h3.52c2.06-1.9 3.27-4.7 3.27-8.32z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.52-2.75c-.99.66-2.25 1.05-3.76 1.05-2.88 0-5.32-1.94-6.19-4.55H2.18v2.86C4.01 20.72 7.77 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.81 14.22c-.22-.66-.35-1.37-.35-2.12s.13-1.46.35-2.12V7.12H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.88l3.63-2.66z"
          />
          <path
            fill="#EB4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4.01 3.28 2.18 7.12l3.63 2.66c.87-2.61 3.31-4.4 6.19-4.4z"
          />
        </svg>
        Login with Google
      </button>
    </div>
  );
};

export default Login;