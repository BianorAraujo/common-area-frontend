const ReservationTable = ({ filteredReservations, handleEditReservation, handleDeleteReservation }) => {
  return (
    <div className="bg-gray-50 rounded-xl shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-vesta-dark shadow-inner">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation, index) => {
              const start = new Date(reservation.start);
              const end = new Date(reservation.end);
              const isAllDayReservation =
                start.getHours() === 8 &&
                start.getMinutes() === 0 &&
                end.getHours() === 23 &&
                end.getMinutes() === 0;
              const timeDisplay = isAllDayReservation
                ? "All Day"
                : `${start.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })} - ${end.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}`;
              return (
                <tr
                  key={reservation.id}
                  className={`transition-colors duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-vesta-light/20`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{reservation.ownerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">{timeDisplay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vesta-text">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReservation(reservation)}
                        className="text-vesta-text hover:text-vesta-dark"
                        title="Edit"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="text-vesta-text hover:text-red-600"
                        title="Delete"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                No reservations for this day
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;