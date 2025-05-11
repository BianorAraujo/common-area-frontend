const ReservationModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedDate,
  setSelectedDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  isAllDay,
  setIsAllDay,
  editingReservationId,
  setEditingReservationId,
  error,
  setError,
  handleAddOrUpdateReservation,
  generateTimeOptions,
  formatDateForInput,
  user,
  ownerName,
  setOwnerName,
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-vesta-text mb-4">
          {editingReservationId ? "Edit Reservation" : "Add Reservation"}
        </h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="owner-name" className="block text-sm font-medium text-gray-500 mb-2">
            Owner
          </label>
          <input
            type="text"
            id="owner-name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300"
            placeholder="Enter owner's name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="reservation-date" className="block text-sm font-medium text-gray-500 mb-2">
            Date
          </label>
          <input
            type="date"
            id="reservation-date"
            value={formatDateForInput(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value + "T00:00:00"))}
            className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-5 w-5 text-vesta-dark focus:ring-vesta-light border-gray-200 rounded"
            />
            <span className="ml-2 text-sm font-medium text-vesta-text">All Day</span>
          </label>
        </div>
        <div className="mb-4">
          <label htmlFor="start-time" className="block text-sm font-medium text-gray-500 mb-2">
            Start Time
          </label>
          <select
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isAllDay}
            className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300 appearance-none custom-select"
          >
            {generateTimeOptions().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="end-time" className="block text-sm font-medium text-gray-500 mb-2">
            End Time
          </label>
          <select
            id="end-time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isAllDay}
            className="p-3 rounded-xl border border-gray-200 w-full bg-white focus:ring-2 focus:ring-vesta-light focus:border-vesta-dark transition-all duration-300 appearance-none custom-select"
          >
            {generateTimeOptions().map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsModalOpen(false);
              setEditingReservationId(null);
              setOwnerName(user.name); // Resetar ownerName ao cancelar
            }}
            className="bg-gray-300 text-vesta-text py-2 px-4 rounded-xl hover:bg-gray-400 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddOrUpdateReservation(ownerName)}
            className="bg-vesta-dark text-white py-2 px-4 rounded-xl hover:bg-vesta-dark-hover transition-all duration-300 hover:scale-105"
          >
            {editingReservationId ? "Update" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;