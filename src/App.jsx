import React, { useState, useEffect } from 'react';
// --- 1. IMPORT FIREBASE ---
import { db } from './firebase'; 
import { ref, onValue, set } from "firebase/database";

// --- INTEGRATED DYNAMIC DATE TIME (12 HOUR FORMAT) ---
const DateTime = ({ isDark }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-1 transition-colors duration-700">
      <p className="text-blue-600 font-[1000] text-3xl tracking-tighter uppercase italic leading-none">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </p>
      <p className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${isDark ? 'text-slate-400' : 'text-slate-900'}`}>
        {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

const App = () => {
  const scheduleData = {
    Monday: ["Parallel Computing", "AI", "Cloud Computing", "Lunch", "Database(Lab)", "Maths", "Maths"],
    Tuesday: ["Maths", "Maths", "OODD(Lab)", "Lunch", "Parallel Computing", "E-Commerce", "AI"],
    Wednesday: ["OODD", "OODD", "Parallel Computing", "Lunch", "Cloud (Lab)", "Database", "E-Commerce"],
    Thursday: ["Database", "Cloud Computing", "AI(Lab)", "Lunch", "Self-study", "E-Commerce", "OODD(Lab)"],
    Friday: ["AI", "Cloud Computing", "Parallel Computing", "Lunch", "Library", "E-Commerce", "Database(Lab)"]
  };

  const courseInfo = {
    "Parallel Computing": { teacher: "Theint Thu San" }, "Maths": { teacher: "Myint Myint Toe" },
    "OODD": { teacher: "Khin Htay" }, "OODD(Lab)": { teacher: "Khin Htay" },
    "AI": { teacher: "Thidar Win" }, "AI(Lab)": { teacher: "Thidar Win" },
    "Database": { teacher: "Zin Mar Naing" }, "Database(Lab)": { teacher: "Zin Mar Naing" },
    "Cloud Computing": { teacher: "Ei Ei Mon" }, "Cloud (Lab)": { teacher: "Ei Ei Mon" },
    "E-Commerce": { teacher: "Ni Ni Khaing" }, "Self-study": { teacher: "Focus", isNonFaculty: true },
    "Library": { teacher: "Deep Work", isNonFaculty: true }, "Lunch": { teacher: "Recharge", isNonFaculty: true }
  };

  const timeSlots = [[510, 570], [575, 635], [640, 700], [700, 760], [760, 820], [825, 885], [890, 950]];

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0); 
  const [showContent, setShowContent] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [today, setToday] = useState("");
  const [selectedDay, setSelectedDay] = useState(""); 
  const [theme, setTheme] = useState("dark");
  const [currentTab, setCurrentTab] = useState("schedule");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [notiMessage, setNotiMessage] = useState(""); 
  const [inputMessage, setInputMessage] = useState(""); 

  useEffect(() => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now = new Date();
    const initialDay = days[now.getDay()];
    setToday(initialDay);
    setSelectedDay(initialDay === "Sunday" || initialDay === "Saturday" ? "Monday" : initialDay);
    
    const progressInterval = setInterval(() => {
        setLoadProgress(prev => (prev >= 100 ? 100 : prev + 1));
    }, 30);

    const checkSlot = () => {
      const d = new Date();
      const mins = d.getHours() * 60 + d.getMinutes();
      const curDay = days[d.getDay()];
      const idx = timeSlots.findIndex(s => mins >= s[0] && mins < s[1]);
      return idx !== -1 && scheduleData[curDay] ? idx : null;
    };
    
    setActiveSlot(checkSlot());

    const notiRef = ref(db, 'global_noti');
    const unsubscribeFirebase = onValue(notiRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp && Date.now() - data.timestamp < 3600000) { 
        setNotiMessage(data.message || "New Update!");
        setShowAutoPopup(true);
        // TIMEOUT REMOVED: ALERT STAYS UNTIL CLOSED MANUALLY
      }
    });

    const entranceTimer = setTimeout(() => {
        setLoading(false); 
        setTimeout(() => setShowContent(true), 100);
    }, 4000);
    
    const updateInterval = setInterval(() => setActiveSlot(checkSlot()), 10000);

    return () => { 
      clearTimeout(entranceTimer); 
      clearInterval(updateInterval); 
      clearInterval(progressInterval); 
      unsubscribeFirebase();
    };
  }, []); 

  const sendClassNotification = () => {
    if (!inputMessage.trim()) return;
    set(ref(db, 'global_noti'), {
      timestamp: Date.now(),
      message: inputMessage
    }).then(() => {
      setInputMessage(""); 
      setIsInfoOpen(false); 
    });
  };

  const isDark = theme === "dark";
  const activeTheme = isDark ? {
    bg: "bg-[#050a18]", card: "bg-[#0f172a]", border: "border-white/10", text: "text-slate-100", nav: "bg-[#050a18]/95"
  } : {
    bg: "bg-[#f1f5f9]", card: "bg-white", border: "border-slate-300", text: "text-slate-900", nav: "bg-[#f1f5f9]/95"
  };

  if (loading) return (
    <div className="fixed inset-0 z-[9999] bg-[#050a18] flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-blue-600/10" />
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="2" fill="transparent"
            strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * loadProgress) / 100}
            className="text-blue-600 transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
            <span className="text-white text-4xl font-[1000] italic tracking-tighter animate-pulse">UCSM</span>
            <span className="text-blue-600 font-mono text-[10px] tracking-[0.3em] font-bold">{loadProgress}%</span>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center gap-2">
        <div className="flex gap-1"><div className="w-1 h-1 bg-blue-600 animate-bounce" style={{animationDelay: '0s'}}></div><div className="w-1 h-1 bg-blue-600 animate-bounce" style={{animationDelay: '0.1s'}}></div><div className="w-1 h-1 bg-blue-600 animate-bounce" style={{animationDelay: '0.2s'}}></div></div>
        <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.5em] ml-2">Initialising Terminal</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-700 ${activeTheme.bg} ${activeTheme.text}`}>
      
      {/* POPUP VIEW */}
      {showContent && showAutoPopup && (
        <div className="fixed top-24 left-6 right-6 md:left-auto md:right-10 md:w-96 z-[5000] animate-card-entrance">
          <div className={`p-6 rounded-[2.5rem] border shadow-2xl backdrop-blur-2xl ${isDark ? 'bg-[#0f172a]/90 border-blue-500/30' : 'bg-white/90 border-blue-200'}`}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-red-600/20">📡</div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0f172a] animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Live Update</p>
                <h5 className={`font-black italic uppercase text-lg leading-tight ${activeTheme.text}`}>{notiMessage}</h5>
              </div>
              <button onClick={() => setShowAutoPopup(false)} className="text-slate-400 p-2 text-xl">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAV (MOBILE TABS) */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] border-b backdrop-blur-xl ${activeTheme.nav} ${activeTheme.border}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 w-full">
            {Object.keys(scheduleData).map((day) => (
              <button key={day} onClick={() => setSelectedDay(day)} className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedDay === day ? "bg-blue-600 text-white shadow-lg" : "text-slate-500"}`}>
                {day === today ? "Today" : day}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* BOTTOM NAV */}
      <nav className={`fixed bottom-0 left-0 right-0 z-[1000] p-6 border-t backdrop-blur-2xl ${activeTheme.nav} ${activeTheme.border}`}>
        <div className="max-w-xl mx-auto flex gap-3">
          <button onClick={() => setCurrentTab("schedule")} className={`flex-[2] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${currentTab === "schedule" ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>📅 Schedule</button>
          <button onClick={() => setCurrentTab("faculty")} className={`flex-[2] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${currentTab === "faculty" ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>👨‍🏫 Faculty</button>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`flex-1 flex items-center justify-center rounded-2xl border transition-all duration-500 text-xl shadow-inner ${activeTheme.card} ${activeTheme.border}`}>{isDark ? "🌑" : "☀️"}</button>
          <button onClick={() => setIsInfoOpen(true)} className={`w-14 py-4 rounded-2xl text-lg flex items-center justify-center ${activeTheme.card} border ${activeTheme.border} text-blue-600 transition-all`}>ℹ️</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={`transition-all duration-1000 ${showContent ? 'animate-pop-up-entry' : 'opacity-0'}`}>
        <main className="max-w-[1400px] mx-auto pt-32 pb-44 px-6">
          <header className="mb-16">
            <h1 className="text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-6">
              {currentTab === "schedule" ? (selectedDay === today ? "UCS Meiktila" : selectedDay) : "Faculty"} <span className="text-blue-600">.</span>
            </h1>
            <DateTime isDark={isDark} />
          </header>

          <div key={currentTab + selectedDay} className="animate-page-fade">
            {currentTab === "schedule" ? (
              /* LAPTOP: Show 5-day grid | MOBILE: Show selected day cards */
              <div className="grid grid-cols-1 md:hidden gap-4">
                {/* Mobile View Card List */}
                {scheduleData[selectedDay]?.map((sub, i) => (
                  <div key={i} className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative animate-card-entrance ${today === selectedDay && i === activeSlot ? "bg-blue-600 border-transparent shadow-2xl scale-105 text-white z-10" : `${activeTheme.card} ${activeTheme.border}`}`}>
                    <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${today === selectedDay && i === activeSlot ? 'text-white/60' : 'text-blue-600'}`}>P-{i + 1}</p>
                    <h3 className="text-xl font-black italic uppercase mb-2 tracking-tight">{sub}</h3>
                    <p className={`text-[12px] font-bold uppercase tracking-wider`}>{courseInfo[sub]?.teacher}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* Faculty Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(courseInfo).filter(([_, d]) => !d.isNonFaculty).map(([course, data], i) => (
                  <div key={i} className={`p-8 rounded-[2rem] border animate-card-entrance ${activeTheme.card} ${activeTheme.border}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black italic text-xl">{data.teacher.charAt(0)}</div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter">{data.teacher}</h3>
                    </div>
                    <p className="font-black italic text-lg uppercase tracking-tight pt-4 border-t border-white/5">{course}</p>
                  </div>
                ))}
              </div>
            )}

            {/* LAPTOP ONLY VIEW: Full Week Grid */}
            {currentTab === "schedule" && (
              <div className="hidden md:grid grid-cols-5 gap-4">
                {Object.keys(scheduleData).map((day) => (
                  <div key={day} className="flex flex-col gap-4">
                    <h4 className={`text-center py-3 rounded-2xl font-black uppercase text-xs tracking-widest mb-2 ${today === day ? 'bg-blue-600 text-white' : 'bg-slate-500/10 text-slate-500'}`}>{day}</h4>
                    {scheduleData[day].map((sub, i) => (
                      <div key={i} className={`p-6 rounded-[2rem] border h-32 flex flex-col justify-center transition-all ${today === day && i === activeSlot ? 'bg-blue-600 border-transparent text-white scale-[1.03] shadow-xl' : `${activeTheme.card} ${activeTheme.border}`}`}>
                         <p className={`text-[8px] font-black uppercase mb-1 ${today === day && i === activeSlot ? 'text-white/50' : 'text-blue-600'}`}>P-{i + 1}</p>
                         <h5 className="text-[13px] font-black italic uppercase leading-tight mb-1 truncate">{sub}</h5>
                         <p className="text-[10px] opacity-70 font-bold truncate">{courseInfo[sub]?.teacher}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* INFO MODAL */}
      <div className={`fixed inset-0 z-[2000] flex items-end transition-all duration-500 ${isInfoOpen ? 'bg-black/60 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsInfoOpen(false)}>
          <div className={`w-full max-w-2xl mx-auto p-10 rounded-t-[3rem] border-t transition-transform duration-500 ${activeTheme.card} ${activeTheme.border} ${isInfoOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
            <h4 className="font-black italic uppercase text-2xl mb-6 text-center">Admin Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-6 rounded-3xl border border-white/10 bg-black/20 text-center"><p className="text-blue-600 text-[10px] font-black">DEV</p><p className="font-black italic text-xl uppercase leading-none mt-1">Thant Zaw</p></div>
              <div className="p-6 rounded-3xl border border-white/10 bg-black/20 text-center"><p className="text-blue-600 text-[10px] font-black">CALL</p><p className="font-black italic text-xl uppercase leading-none mt-1">09982268184</p></div>
            </div>
            <div className="p-4 rounded-3xl border border-red-600/20 bg-red-600/5">
              <p className="text-red-600 text-[10px] font-black mb-3 uppercase tracking-widest text-center">Broadcast Alert</p>
              <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type update here..." className={`w-full p-4 rounded-xl mb-3 border bg-transparent font-bold outline-none focus:border-red-600 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} />
              <button onClick={sendClassNotification} className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all">🚨 Send to all Students</button>
            </div>
            <button onClick={() => setIsInfoOpen(false)} className="w-full mt-4 py-5 bg-blue-600 text-white font-black uppercase rounded-2xl active:scale-95">Close</button>
          </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,800;1,800&family=Space+Grotesk:wght@300;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; margin: 0; background: #050a18; }
        h1, h2, h3, h4, h5, button { font-family: 'Plus Jakarta Sans', sans-serif; font-style: italic; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes popUpEntry { 0% { transform: scale(0.95) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-pop-up-entry { animation: popUpEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes pageFade { from { opacity: 0; } to { opacity: 1; } }
        .animate-page-fade { animation: pageFade 0.4s ease-out forwards; }
        @keyframes cardEntrance { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-card-entrance { animation: cardEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;