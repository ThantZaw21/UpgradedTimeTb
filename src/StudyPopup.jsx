import React , {useState,useEffect} from "react";

const timetable = {
    Monday: [
        {start:8*60 + 30, end:9*60 + 30,subject: 'Parallel Computing'},
        {start:9*60 + 35, end:10*60 + 35,subject: 'AI'},
        {start:10*60 + 40, end:11*60 + 40,subject: 'Cloud Computing'},
        {start:12*60 + 40, end:1*60 + 40,subject: 'Database'},
        {start:1*60 + 45, end:2*60 + 45,subject: 'Maths'},
        {start:2*60 + 50, end:3*60 + 50,subject: 'Maths'},
        
    ],
        Tuesday: [
        {start:8*60 + 30, end:9*60 + 30,subject: 'Maths'},
        {start:9*60 + 35, end:10*60 + 35,subject: 'Maths'},
        {start:10*60 + 40, end:11*60 + 40,subject: 'OODD'},
        {start:12*60 + 40, end:1*60 + 40,subject: 'Parallel Computing'},
        {start:1*60 + 45, end:2*60 + 45,subject: 'E-Commerce'},
        {start:2*60 + 50, end:3*60 + 50,subject: 'AI'},
        
    ],
        Wednesday: [
        {start:8*60 + 30, end:9*60 + 30,subject: 'OODD'},
        {start:9*60 + 35, end:10*60 + 35,subject: 'OODD'},
        {start:10*60 + 40, end:11*60 + 40,subject: 'Parallel Computing'},
        {start:12*60 + 40, end:1*60 + 40,subject: 'Cloud(Lab)'},
        {start:1*60 + 45, end:2*60 + 45,subject: 'Database'},
        {start:2*60 + 50, end:3*60 + 50,subject: 'E-Commerce'},
        
    ],
        Thursday: [
        {start:8*60 + 30, end:9*60 + 30,subject: 'Database'},
        {start:9*60 + 35, end:10*60 + 35,subject: 'Cloud Computing'},
        {start:10*60 + 40, end:11*60 + 40,subject: 'AI(lab)'},
        {start:12*60 + 40, end:1*60 + 40,subject: 'Self-Study'},
        {start:1*60 + 45, end:2*60 + 45,subject: 'E-Commerce'},
        {start:2*60 + 50, end:3*60 + 50,subject: 'OODD'},
        
    ],
        Friday: [
        {start:8*60 + 30, end:9*60 + 30,subject: 'AI'},
        {start:9*60 + 35, end:10*60 + 35,subject: 'Cloud Computing'},
        {start:10*60 + 40, end:11*60 + 40,subject: 'Parallel Computing'},
        {start:12*60 + 40, end:1*60 + 40,subject: 'Library'},
        {start:1*60 + 45, end:2*60 + 45,subject: 'ME-Commerce'},
        {start:2*60 + 50, end:3*60 + 50,subject: 'Database'},
        
    ]
};

function StudyPopup() {
  const [currentSubject, setCurrentSubject] = useState("Loading...");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = days[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const todaySchedule = timetable[today];

      if (!todaySchedule) {
        setCurrentSubject("No class"); // Weekend
        return;
      }

      const activeClass = todaySchedule.find(
        (cls) => currentMinutes >= cls.start && currentMinutes < cls.end
      );

      setCurrentSubject(activeClass ? activeClass.subject : "No class");
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
<div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-80">
  <div className="relative bg-white/30 backdrop-blur-lg border border-white/30 text-black rounded-xl shadow-lg px-6 py-4 flex flex-col items-center justify-center w-100 h-100">
    
    {/* Close button */}
    <button
      onClick={() => setVisible(false)}
      className="absolute top-2 right-2 text-white font-bold text-lg hover:bg-white/20 px-2 py-1 rounded"
    >
      ✕
    </button>

    {/* Centered text */}
    <p className="text-lg opacity-80"></p>
    <p className="text-xl font-semibold">{currentSubject}</p>
  </div>
</div>

  );
}

export default StudyPopup;