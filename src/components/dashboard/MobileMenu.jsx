import ExportExcel from "../ExportExcel";

const MobileMenu = ({
  isMenuOpen,
  navigate,
  logout,
  setIsMenuOpen,
  history,
  formatAction,
  formatDate,
  formatTimeDisplay,
  onExportError,
  onExportSuccess,
}) => {
  if (!isMenuOpen) return null;

  return (
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
      <ExportExcel
        formatAction={formatAction}
        formatDate={formatDate}
        formatTimeDisplay={formatTimeDisplay}
        onError={onExportError}
        onSuccess={onExportSuccess}
        mobile
      />
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
  );
};

export default MobileMenu;