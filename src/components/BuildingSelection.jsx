import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BuildingSelection = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectBuilding = (building) => {
    console.log(`Building selected: ${building}`);
    navigate(`/dashboard?building=${encodeURIComponent(building)}`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-50 shadow-sm p-4 flex justify-between items-center">
        {/* Nome do Usuário */}
        <div className="text-lg font-medium text-vesta-text">
          Hi, {user?.name || "User"}
        </div>

        {/* Botões em Desktop */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => navigate("/history")}
            className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
          >
            History
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white py-2 px-4 rounded-xl border border-red-600/20 hover:bg-red-700 hover:border-red-700/20 transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Botão Sanduíche em Mobile */}
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-vesta-text hover:text-vesta-light transition-colors duration-300">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Menu Dropdown em Mobile */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gray-50 shadow-lg p-4 absolute top-16 right-4 rounded-xl z-10">
          <button
            onClick={() => {
              navigate("/history");
              setIsMenuOpen(false);
            }}
            className="block w-full text-left text-vesta-text py-2 px-4 hover:bg-vesta-light/20 rounded transition-colors duration-300"
          >
            History
          </button>
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left text-red-600 py-2 px-4 hover:bg-vesta-light/20 rounded transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-vesta-text mb-6">
            Choose a Building
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSelectBuilding("One Three North")}
              className="bg-vesta-dark text-white py-4 px-8 rounded-xl shadow-md hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105 text-lg"
            >
              One Three North
            </button>
            <button
              onClick={() => handleSelectBuilding("Two Three North")}
              className="bg-vesta-dark text-white py-4 px-8 rounded-xl shadow-md hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105 text-lg"
            >
              Two Three North
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingSelection;