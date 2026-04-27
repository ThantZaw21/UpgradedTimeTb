import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, get } from "firebase/database"; 
import { db } from "./firebase"; 
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Bell, ChevronRight, User, Calendar, Layout } from 'lucide-react';
import { Preferences } from "@capacitor/preferences";

// Memoized to prevent refreshing every time the clock ticks
const MobileWidgets = React.memo(({ isDark, currentSub, nextSub, timeRemaining }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-10 lg:hidden">
      {/* Current Class Widget */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`p-6 rounded-[32px] border flex flex-col justify-between h-40 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#7C74EE]/10 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#B4F02D] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Now</span>
          </div>
          <h3 className="text-lg font-black italic tracking-tighter leading-tight line-clamp-2">
            {currentSub || "Free Time"}
          </h3>
        </div>
        <p className="text-[11px] font-bold text-[#7C74EE] uppercase tracking-tighter">{timeRemaining}</p>
      </motion.div>

      {/* Next Class Widget */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-[32px] bg-[#7C74EE] text-white shadow-lg shadow-[#7C74EE]/20 flex flex-col justify-between h-40"
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Up Next</span>
          <h3 className="text-lg font-black italic tracking-tighter leading-tight line-clamp-2 mt-3">
            {nextSub || "End of Day"}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-80">
          <span className="text-[10px] font-bold uppercase tracking-tighter">View Info</span>
          <ChevronRight size={14} />
        </div>
      </motion.div>
    </div>
  );
});

const App = () => {

  
  // --- 1. CORE DATA ---
  const daysArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const scheduleData = {
    Monday: ["Parallel Computing", "AI", "Cloud Computing", "Lunch", "Database(Lab)", "Maths", "Maths"],
    Tuesday: ["Maths", "Maths", "OODD(Lab)", "Lunch", "Parallel Computing", "E-Commerce", "AI"],
    Wednesday: ["OODD", "OODD", "Parallel Computing", "Lunch", "Cloud (Lab)", "Database", "E-Commerce"],
    Thursday: ["Database", "Cloud Computing", "AI(Lab)", "Lunch", "Self-study", "E-Commerce", "OODD(Lab)"],
    Friday: ["AI", "Cloud Computing", "Parallel Computing", "Lunch", "Library", "E-Commerce", "Database(Lab)"]
  };

  const courseInfo = {
    "Parallel Computing": { teacher: "Theint Thu San" },
    "Maths": { teacher: "Myint Myint Toe" },
    "OODD": { teacher: "Khin Htay" },
    "OODD(Lab)": { teacher: "Khin Htay" },
    "AI": { teacher: "Thidar Win" },
    "AI(Lab)": { teacher: "Thidar Win" },
    "Database": { teacher: "Zin Mar Naing" },
    "Database(Lab)": { teacher: "Zin Mar Naing" },
    "Cloud Computing": { teacher: "Ei Ei Mon" },
    "Cloud (Lab)": { teacher: "Ei Ei Mon" },
    "E-Commerce": { teacher: "Ni Ni Khaing" },
    "Self-study": { teacher: "Focus", isNonFaculty: true},
    "Library": { teacher: "Deep Work", isNonFaculty: true },
    "Lunch": { teacher: "Recharge", isNonFaculty: true }
  };

  // Fixed image paths: Ensure these files are in your /public folder
  const slides = [
    { image: "/football.jpg", title: "Football Finals", desc: "The intensity and brotherhood on the pitch." },
    { image: "/htamanal.jpg", title: "Hta Ma Ne Pwl", desc: "Stirring traditions and community spirit." },
    { image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000", title: "Freshers' Night", desc: "Lights and music under the Meiktila stars." }
  ];

  const timeLabels = ["08:30-9:30", "09:35-10:35", "10:40-11:40", "11:40-12:40", "12:40-01:40", "01:45-02:45", "02:50-03:50"];
  const timeSlots = [[510, 570], [575, 635], [640, 700], [700, 760], [760, 820], [825, 885], [890, 950]];

  // --- 2. STATE ---
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState("dark");
  const [currentTab, setCurrentTab] = useState("schedule");
  
  const realDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][time.getDay()];

  const [viewDay, setViewDay] = useState(() => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return daysArr.includes(todayName) ? todayName : "Monday";
  });

  const [activeSlot, setActiveSlot] = useState(-1);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [announcement, setAnnouncement] = useState("");
  const [adminInput, setAdminInput] = useState("");
  const [showNoti, setShowNoti] = useState(false);
  const notiTimer = useRef(null);

  // --- 3. LOGIC ---
  const paginate = (newDirection) => {
    setSlide(([prevSlide]) => {
      let nextIndex = prevSlide + newDirection;
      if (nextIndex < 0) nextIndex = slides.length - 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  };

  const triggerNoti = (text) => {
    setAnnouncement(text);
    setShowNoti(true);
    if (notiTimer.current) clearTimeout(notiTimer.current);
    notiTimer.current = setTimeout(() => setShowNoti(false), 6000);
  };

  const handleDayChange = (day) => {
    setViewDay(day);
    if (currentTab !== "schedule") setCurrentTab("schedule");
  };

  const getGroupedFaculty = () => {
    const groups = {};
    Object.entries(courseInfo).forEach(([subject, info]) => {
      if (info.isNonFaculty) return;
      if (!groups[info.teacher]) groups[info.teacher] = [];
      groups[info.teacher].push(subject);
    });
    return groups;
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  useEffect(() => {
    const loadTimeout = setTimeout(() => setLoading(false), 2000);
    const announcementRef = ref(db, 'globalAnnouncement');
    
    const unsubscribe = onValue(announcementRef, (snapshot) => {
      const data = snapshot.val();
      if (data) triggerNoti(data);
    });

    get(announcementRef).then((snapshot) => {
      if (snapshot.exists()) triggerNoti(snapshot.val());
    });

    return () => { clearTimeout(loadTimeout); unsubscribe(); };
  }, []); 

  useEffect(() => {
    const slideInterval = setInterval(() => paginate(1), 6000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      const mins = now.getHours() * 60 + now.getMinutes();
      const slot = timeSlots.findIndex(s => mins >= s[0] && mins < s[1]);
      setActiveSlot(slot);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    return { h: hours.toString().padStart(2, '0'), m: minutes, ampm, day };
  };

  const t12 = formatTime(time);
  const isDark = theme === "dark";
  const groupedFaculty = getGroupedFaculty();

  // 1. Logic to get the data
const todaySchedule = scheduleData[realDay] || [];
const currentSub = activeSlot !== -1 ? todaySchedule[activeSlot] : null;
const nextSub = activeSlot !== -1 && activeSlot < todaySchedule.length - 1 ? todaySchedule[activeSlot + 1] : null;

const getTimeRemaining = () => {
  if (activeSlot === -1) return "System Standby";
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const endMins = timeSlots[activeSlot][1];
  const diff = endMins - mins;
  return diff > 0 ? `${diff} mins left` : "Wrapping up";
};

// 2. Optimized Timer (Crucial for performance)
useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date();
    setTime(now); // Clock updates every second
    
    const mins = now.getHours() * 60 + now.getMinutes();
    const slot = timeSlots.findIndex(s => mins >= s[0] && mins < s[1]);
    
    // ONLY update state if the class slot actually changes
    // This stops the widget from refreshing every 1s
    setActiveSlot(prev => (prev !== slot ? slot : prev));
  }, 1000);
  return () => clearInterval(timer);
}, []);

useEffect(() => {
  const syncWidgetPayload = async () => {
    const widgetPayload = {
      day: realDay,
      currentSub: currentSub || "Free Time",
      nextSub: nextSub || "End of Day",
      status: activeSlot === -1 ? "No active class" : timeLabels[activeSlot],
      updatedAt: new Date().toISOString()
    };

    try {
      await Preferences.set({
        key: "home_widget_payload",
        value: JSON.stringify(widgetPayload)
      });
    } catch (error) {
      // Keep app UI running even if native widget storage fails.
      console.error("Failed to sync home widget payload", error);
    }
  };

  syncWidgetPayload();
}, [realDay, currentSub, nextSub, activeSlot]);

  return (
    <>
    
      {/* PRELOADER */}
{/* PRELOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-[#050510] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Soft Ambient Pulse */}
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[500px] h-[500px] bg-[#7C74EE]/10 blur-[120px] rounded-full" 
            />
            
            <div className="relative flex items-center justify-center">
              {/* Outer "Flexing" Ring with Spring Physics */}
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.15, 0.95, 1],
                  borderRadius: ["38%", "50%", "45%", "38%"]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  borderRadius: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-28 h-28 lg:w-40 lg:h-40 border-[1.5px] border-[#7C74EE]/20 border-t-[#B4F02D] shadow-[0_0_60px_rgba(124,116,238,0.15)]"
              />

              {/* Inner "Bouncing" Core */}
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 0.9, 1],
                  rotateY: [0, 180, 360]
                }}
                transition={{ 
                  y: { duration: 2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
                className="absolute"
              >
                <img 
                  src="Meiktila2.png" 
                  className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-[0_0_20px_rgba(180,240,45,0.4)]" 
                  alt="UCSM" 
                />
              </motion.div>
              
              {/* Orbital Glow Dot */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 lg:w-48 lg:h-48"
              >
                <div className="w-2 h-2 rounded-full bg-[#B4F02D] shadow-[0_0_15px_#B4F02D]" />
              </motion.div>
            </div>

            {/* Staggered Status Text */}
            <div className="mt-16 flex flex-col items-center">
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scaleY: [1, 2.5, 1],
                      backgroundColor: ["#7C74EE", "#B4F02D", "#7C74EE"]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      delay: i * 0.15,
                      ease: "easeInOut" 
                    }}
                    className="w-[2px] h-3 rounded-full opacity-60"
                  />
                ))}
              </div>
              
              <motion.div className="flex overflow-hidden">
                {"INITIALIZING_SYSTEM".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.05, 
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 2
                    }}
                    className="text-[#B4F02D] font-mono text-[9px] lg:text-[11px] font-black tracking-[0.3em]"
                  >
                    {char === "_" ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION */}
      <AnimatePresence>
        {showNoti && (
          <motion.div 
            initial={{ y: -100, opacity: 0, scale: 0.8, filter: "blur(20px)" }} 
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }} 
            exit={{ y: -40, opacity: 0, scale: 0.9, filter: "blur(15px)" }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-4 lg:top-8 left-0 right-0 z-[5000] flex justify-center px-4 lg:px-6"
          >
            <div className={`relative w-full max-w-[550px] overflow-hidden rounded-[25px] lg:rounded-[35px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl border ${isDark ? 'bg-[#0A0A1B]/80 border-white/10 text-white' : 'bg-white/95 border-[#7C74EE]/20 text-[#0A0A1B]'}`}>
              <div className="p-5 lg:p-7 flex items-center gap-4 lg:gap-6">
                <div className="relative shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#7C74EE] to-[#6A5FE0] flex items-center justify-center shadow-lg">
                   <img src="Meiktila2.png" className="w-7 h-7 lg:w-9 lg:h-9 brightness-0 invert" alt="Logo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-[#7C74EE]">Campus Broadcast</span>
                  </div>
                  <h4 className="text-[13px] lg:text-[16px] font-black leading-tight tracking-tight truncate lg:whitespace-normal">{announcement}</h4>
                </div>
              </div>
              <motion.div 
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} 
                transition={{ duration: 6, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[3px] w-full bg-[#B4F02D] origin-left opacity-60" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed inset-0 z-[-1] transition-colors duration-1000 ${isDark ? 'bg-[#050510]' : 'bg-[#F8F9FD]'}`}>
        <div className={`absolute top-0 left-0 w-full h-full opacity-30 ${isDark ? 'bg-[radial-gradient(circle_at_50%_-20%,#7C74EE_0%,transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_-20%,#7C74EE_0%,transparent_40%)]'}`} />
      </div>

      <div className={`min-h-screen transition-all duration-700 font-['Plus_Jakarta_Sans',sans-serif] ${isDark ? 'text-white' : 'text-[#1B1B32]'} ${loading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* NAVBAR */}
        <header className="fixed top-0 left-0 right-0 z-[1000] px-3 py-3 lg:px-10 lg:py-6">
          <nav className={`mx-auto max-w-7xl h-20 lg:h-28 px-5 lg:px-8 flex items-center justify-between rounded-[25px] lg:rounded-[35px] border transition-all ${isDark ? 'bg-[#050510]/40 border-white/10 backdrop-blur-3xl' : 'bg-white/70 border-[#7C74EE]/10 shadow-[0_8px_30px_rgb(124,116,238,0.08)] backdrop-blur-xl'}`}>
            <div className="flex items-center gap-3 lg:gap-5">
              <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center border shadow-inner ${isDark ? 'bg-white border-white/20' : 'bg-white border-[#7C74EE]/10 shadow-sm'}`}>
                <img src="Meiktila2.png" alt="Logo" className="w-7 h-7 lg:w-10 lg:h-10" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em]">UCS Meiktila</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B4F02D] animate-pulse" />
                  <span className="text-[8px] lg:text-[9px] font-bold opacity-30 uppercase">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <div className={`flex items-center gap-3 lg:gap-6 px-4 lg:px-8 py-2 lg:py-3 rounded-[20px] lg:rounded-[28px] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white shadow-sm border-[#7C74EE]/10'}`}>
                <div className="flex flex-col items-end pr-3 lg:pr-5 border-r border-black/5">
                  <span className="text-[7px] lg:text-[9px] font-black uppercase text-[#7C74EE] tracking-widest leading-none mb-1">{t12.day}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-[#B4F02D] animate-ping" />
                    <span className="text-[8px] lg:text-[10px] font-bold opacity-40 uppercase tracking-tighter">Live</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 lg:gap-1.5">
                  <span className="text-2xl lg:text-5xl font-black italic tracking-tighter leading-none">{t12.h}:{t12.m}</span>
                  <span className="text-[9px] lg:text-[11px] font-bold opacity-40 italic">{t12.ampm}</span>
                </div>
              </div>

              <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full border flex items-center justify-center transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-[#7C74EE]/20 bg-white shadow-sm hover:shadow-md'}`}>
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </nav>
        </header>

        <main className="pt-28 lg:pt-48 p-4 lg:p-16 max-w-7xl mx-auto">
          <header className="mb-10 lg:mb-16">
            <div className="flex flex-wrap items-center">
              <h1 className="text-5xl sm:text-7xl lg:text-[11rem] tracking-[-0.06em] leading-[0.9] flex flex-wrap drop-shadow-2xl">
                {["U", "C", "S", " ", "M", "T", "L", "A"].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 100, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? -2 : 2, transition: { type: "spring", stiffness: 400 } }}
                    transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`cursor-default px-0.5 lg:px-1 font-serif select-none ${char === "M" || char === "T" || char === "L" || char === "A" 
                      ? "text-transparent bg-clip-text bg-gradient-to-tr from-[#7C74EE] via-[#B4F02D] to-[#7C74EE] bg-[length:200%_200%] animate-[gradient_4s_ease_infinite] font-black" 
                      : isDark ? "text-white font-light" : "text-[#1B1B32] font-light"}`}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </h1>
            </div>
            <div className="flex items-center gap-4 lg:gap-6 mt-4 lg:mt-6">
              <motion.div initial={{ width: 0 }} animate={{ width: 60 }} className="h-[2px] bg-gradient-to-r from-[#7C74EE] to-transparent" />
              <p className="text-[8px] lg:text-[12px] font-medium uppercase tracking-[0.4em] lg:tracking-[0.8em] opacity-40 italic">
                Fifth Year <span className="text-[#B4F02D] opacity-100">●</span> Academic Timetable
              </p>
            </div>
          </header>

          <section className="mb-12 lg:mb-20">
            <div className="relative aspect-[16/10] lg:h-[550px] rounded-[30px] lg:rounded-[50px] overflow-hidden border border-white/5 shadow-2xl bg-black">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div key={currentSlide} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="absolute inset-0">
                  <img src={slides[currentSlide].image} className="w-full h-full object-cover opacity-80" alt="Slide" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 lg:bottom-16 lg:left-16 pr-6">
                    <h3 className="text-xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">{slides[currentSlide].title}</h3>
                    <p className="text-[8px] lg:text-lg font-bold text-white/40 uppercase tracking-[0.2em] mt-2 lg:mt-4">{slides[currentSlide].desc}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4 space-y-6 lg:space-y-10">
              <button onClick={() => setIsAdminOpen(true)} className={`group relative w-full p-6 lg:p-8 rounded-[25px] lg:rounded-[35px] flex items-center justify-between transition-all duration-500 active:scale-[0.98] overflow-hidden ${isDark ? 'bg-white text-black shadow-2xl shadow-[#7C74EE]/20' : 'bg-gradient-to-br from-[#7C74EE] to-[#6A5FE0] text-white shadow-xl shadow-[#7C74EE]/30 hover:shadow-2xl hover:translate-y-[-2px]'}`}>
                <div className="relative z-10 flex items-center gap-4 lg:gap-5">
                  <div className="flex items-end gap-[3px] lg:gap-[4px] h-5 lg:h-7 w-8 lg:w-10">
                    {[0.6, 1.0, 0.7, 0.9, 0.5].map((height, i) => (
                      <div key={i} className={`w-[4px] lg:w-[5px] rounded-full animate-pulse ${isDark ? 'bg-[#7C74EE]' : 'bg-white'}`} style={{ height: `${height * 100}%` }} />
                    ))}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <h3 className={`text-sm lg:text-lg font-black tracking-tighter uppercase italic leading-none ${isDark ? 'text-black' : 'text-white'}`}>Notify All</h3>
                    <span className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.1em] mt-1 ${isDark ? 'text-[#7C74EE]' : 'text-white/60'}`}>Live Broadcast</span>
                  </div>
                </div>
                <div className={`relative z-10 w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-[#050510]' : 'bg-white/20 backdrop-blur-md'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="animate-pulse">
                      <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z" />
                      <path d="M22 12c-1.5-1-1.5-1-3-1v2c1.5 0 1.5 0 3-1Z" />
                    </svg>
                </div>
              </button>

              <div className="flex lg:flex-col overflow-x-auto gap-3 no-scrollbar pb-2 lg:pb-4">
                {daysArr.map(d => (
                  <button key={d} onClick={() => handleDayChange(d)} className={`shrink-0 lg:w-full px-8 lg:px-10 py-4 lg:py-6 rounded-[20px] lg:rounded-[30px] border transition-all ${viewDay === d ? 'bg-[#B4F02D] border-[#B4F02D] text-black font-black scale-[1.02] shadow-xl shadow-[#B4F02D]/10' : isDark ? 'bg-white/5 border-white/5 opacity-30 hover:opacity-60' : 'bg-white border-[#7C74EE]/5 text-[#7C74EE] font-bold shadow-[0_4px_15px_rgba(124,116,238,0.05)] hover:border-[#7C74EE]/20 hover:text-[#7C74EE]'}`}>
                    <span className="text-[10px] lg:text-[11px] uppercase tracking-[0.2em]">{d === realDay ? "Today" : d}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className={`flex gap-8 lg:gap-12 mb-8 lg:mb-12 border-b transition-colors ${isDark ? 'border-white/10' : 'border-[#7C74EE]/10'}`}>
                {['schedule', 'faculty'].map((tab) => (
                  <button key={tab} onClick={() => setCurrentTab(tab)} className={`pb-4 lg:pb-6 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] relative transition-all ${currentTab === tab ? 'text-[#7C74EE]' : 'opacity-20 hover:opacity-50'}`}>
                    {tab}
                    {currentTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#7C74EE]" />}
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div key={currentTab + viewDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 lg:space-y-6">
                  {currentTab === 'schedule' ? (
                    scheduleData[viewDay].map((sub, idx) => {
                      const isLive = viewDay === realDay && activeSlot === idx;
                      const info = courseInfo[sub];
                      return (
                        <div key={idx} className={`group relative flex items-center p-6 lg:p-10 rounded-[25px] lg:rounded-[45px] border transition-all duration-500 ${isLive ? 'bg-[#7C74EE]/5 border-[#7C74EE]/40 scale-[1.02]' : isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-white border-[#7C74EE]/5 shadow-[0_10px_30px_rgba(124,116,238,0.04)] hover:shadow-xl hover:border-[#7C74EE]/20 hover:translate-x-1'}`}>
                          <div className={`w-20 lg:w-32 border-r mr-4 lg:mr-8 font-mono ${isDark ? 'border-white/10 opacity-30' : 'border-[#7C74EE]/10 opacity-60'}`}>
                            <p className={`text-[10px] lg:text-[13px] font-black italic tracking-tight ${isLive ? 'text-[#7C74EE] opacity-100' : ''}`}>{timeLabels[idx]}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base lg:text-3xl font-black uppercase italic tracking-tighter leading-none truncate ${isLive ? 'text-[#7C74EE]' : ''}`}>{sub}</h4>
                            <p className="text-[8px] lg:text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mt-2 lg:mt-3">
                              {info?.isNonFaculty ? "" : "Daw "}{info?.teacher || '-'}
                            </p>
                          </div>
                          {isLive && (
                            <div className="relative flex items-center justify-center shrink-0 ml-2">
                                <div className="absolute w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[#B4F02D] animate-ping opacity-60" />
                                <div className="relative w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-[#B4F02D] shadow-[0_0_10px_#B4F02D]" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {Object.entries(groupedFaculty).map(([teacher, subjects], i) => (
                        <div key={i} className={`p-6 lg:p-10 rounded-[25px] lg:rounded-[45px] transition-all hover:scale-[1.02] ${isDark ? 'bg-white/[0.05]' : 'bg-white border border-[#7C74EE]/5 shadow-[0_10px_30px_rgba(124,116,238,0.04)] hover:shadow-xl hover:border-[#7C74EE]/10'}`}>
                          <h4 className="text-lg lg:text-2xl font-black italic uppercase leading-none mb-4 lg:mb-6">Daw {teacher}</h4>
                          <div className="flex flex-wrap gap-2">
                            {subjects.map((s, idx) => (
                              <span key={idx} className={`text-[8px] lg:text-[9px] font-black uppercase px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl lg:rounded-2xl tracking-widest ${isDark ? 'bg-[#7C74EE]/10 text-[#7C74EE]' : 'bg-[#7C74EE] text-white shadow-sm'}`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <footer className="mt-20 lg:mt-32 pb-10 flex justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group w-full max-w-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] overflow-hidden pointer-events-none">
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#7C74EE] to-transparent opacity-40" />
              </div>
              <div className={`relative px-5 lg:px-8 py-4 rounded-2xl flex flex-col lg:flex-row items-center gap-6 lg:gap-10 border transition-all duration-700 ${isDark ? 'bg-[#050508]/40 border-white/[0.05] backdrop-blur-3xl shadow-2xl' : 'bg-white border-[#7C74EE]/10 shadow-lg backdrop-blur-xl'}`}>
                <div className="flex items-center gap-4 lg:pr-10 lg:border-r border-black/[0.05] dark:border-white/[0.05]">
                  <div className="relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B4F02D] shadow-[0_0_8px_#B4F02D]" />
                    <motion.div animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute w-1.5 h-1.5 rounded-full bg-[#B4F02D]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#7C74EE] tracking-[0.2em] font-mono leading-none">Status</span>
                    <span className="text-[8px] font-bold opacity-30 uppercase mt-1">System online</span>
                  </div>
                </div>
                <div className="flex flex-col items-center cursor-default">
                  <span className="text-[7px] font-black opacity-20 uppercase tracking-[0.5em] mb-1.5">Dev</span>
                  <h4 className="text-[10px] font-black tracking-tighter uppercase text-center leading-none">THANT <span className={isDark ? 'text-white' : 'text-[#1B1B32]'}>ZAW</span></h4>
                </div>
                <div className="flex items-center gap-6 lg:pl-10 lg:border-l border-black/[0.05] dark:border-white/[0.05]">
                  <motion.a whileHover={{ y: -1 }} href="mailto:thantzaw215204@gmail.com" className="flex items-center gap-3 group/mail">
                    <span className="text-[9px] lg:text-[11px] font-bold tracking-tight opacity-40 group-hover/mail:opacity-100 transition-all font-mono truncate max-w-[150px] lg:max-w-none">thantzaw215204@gmail.com</span>
                    <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl flex items-center justify-center transition-all border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/5 text-black/40'} group-hover/mail:bg-[#7C74EE] group-hover/mail:text-white group-hover/mail:border-[#7C74EE]`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </motion.a>
                </div>
              </div>
              <div className="flex justify-between px-4 mt-5 opacity-[0.08] font-mono pointer-events-none">
                <span className="text-[6px] lg:text-[7px] font-black uppercase tracking-[0.4em] lg:tracking-[0.8em]">Built with React</span>
                <span className="text-[6px] lg:text-[7px] font-black uppercase tracking-[0.4em] lg:tracking-[0.8em]">V-01 Stable</span>
              </div>
            </motion.div>
          </footer>
        </main>

        <AnimatePresence>
          {isAdminOpen && (
            <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 lg:p-6 bg-black/90 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-xl overflow-hidden rounded-[30px] lg:rounded-[50px] border p-8 lg:p-12 ${isDark ? 'bg-[#0A0A1B] border-white/10' : 'bg-white border-black/10'}`}>
                <div className="flex justify-between items-center mb-8 lg:mb-10">
                    <h3 className={`text-xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-[#1B1B32]'}`}>Students <span className="text-[#7C74EE]">Alert</span></h3>
                    <button onClick={() => setIsAdminOpen(false)} className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-lg hover:bg-black/10 transition-colors ${isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-[#1B1B32]'}`}>✕</button>
                </div>
                <textarea className={`w-full border rounded-[25px] lg:rounded-[35px] p-6 lg:p-8 text-base lg:text-lg min-h-[150px] lg:min-h-[200px] outline-none focus:border-[#7C74EE] transition-all ${isDark ? 'bg-black/50 border-white/10' : 'bg-[#F8F9FD] border-[#7C74EE]/10'}`} placeholder="Message to all students..." onChange={(e) => setAdminInput(e.target.value)} value={adminInput} />
                <button onClick={() => {
                  set(ref(db, 'globalAnnouncement'), adminInput).then(() => { setIsAdminOpen(false); setAdminInput(""); });
                }} className="w-full mt-6 lg:mt-8 py-5 lg:py-7 bg-[#7C74EE] text-white rounded-[20px] lg:rounded-[30px] font-black uppercase text-[10px] lg:text-xs tracking-[0.4em] shadow-2xl shadow-[#7C74EE]/30 hover:translate-y-[-2px] transition-all">Notify All</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400;1,900&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          h1 { font-family: 'Playfair Display', serif; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
          ::-webkit-scrollbar { display: none; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </>
  );
};

export default App;