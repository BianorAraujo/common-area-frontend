import { useNavigate } from "react-router-dom";
import ExportExcel from "../ExportExcel";

const Navbar = ({
  user,
  logout,
  toggleMenu,
  history,
  formatAction,
  formatDate,
  formatTimeDisplay,
  onExportError,
  onExportSuccess,
}) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-50 shadow-sm p-4 flex justify-between items-center">
      <button
        onClick={() => navigate(-1)}
        className="text-vesta-text hover:text-vesta-light transition-colors duration-300"
        title="Back to building selection"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="text-lg font-medium text-vesta-text">
        Hi, {user?.name || "User"}
      </div>
      <div className="hidden sm:flex items-center space-x-3">
        <button
          onClick={() => navigate("/history")}
          className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
        >
          History
        </button>
        <ExportExcel
          formatAction={formatAction}
          formatDate={formatDate}
          formatTimeDisplay={formatTimeDisplay}
          onError={onExportError}
          onSuccess={onExportSuccess}
        />
        <button
          onClick={logout}
          className="bg-red-600 text-white py-2 px-4 rounded-xl border border-red-600/20 hover:bg-red-700 hover:border-red-700/20 transition-all duration-300 hover:scale-105"
        >
          Logout
        </button>
      </div>
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
  );
};

export default Navbar;