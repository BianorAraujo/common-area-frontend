import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const ReservationCalendar = ({ selectedDate, reservations, handleDateClick, getTileClassName }) => {
  return (
    <div className="mb-8">
      <div className="bg-gray-50 rounded-xl shadow-md p-4">
        <Calendar
          onClickDay={handleDateClick}
          value={selectedDate}
          className="border-none bg-transparent w-full"
          tileClassName={getTileClassName}
        />
      </div>
    </div>
  );
};

export default ReservationCalendar;