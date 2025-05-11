const ReservationHeader = ({ building, isDayFullyBooked, handleAddButtonClick }) => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-vesta-text">
          {building || "Unknown"}
        </h1>
        <button
          onClick={handleAddButtonClick}
          disabled={isDayFullyBooked}
          className={`py-2 px-4 rounded-xl transition-all duration-300 ${
            isDayFullyBooked
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-vesta-dark text-white hover:bg-vesta-dark-hover hover:scale-105"
          }`}
        >
          + Add
        </button>
      </div>
    );
  };
  
  export default ReservationHeader;