import { useState, useEffect } from "react";

function DateTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get day names and month names
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const dayNumber = time.getDate();
  const year = time.getFullYear();

  // Format time: 12-hour with minutes and seconds
  const hoursMinutes = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="text-white/80 text-sm text-center">
      <div>{dayName}, {monthName} {dayNumber}, {year}</div>
      <div>{hoursMinutes}</div>
    </div>
  );
}

export default DateTime;
