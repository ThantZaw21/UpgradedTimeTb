import React, { useState, useEffect, useRef } from 'react';
import DateTime from './DateTime';

const App = () => {
  // --- DATA ---
  const scheduleData = {
    Monday: ["Parallel Computing", "AI", "Cloud Computing", "Lunch", "Database(Lab)", "Maths", "Maths"],
    Tuesday: ["Maths", "Maths", "OODD(Lab)", "Lunch", "Parallel Computing", "E-Commerce", "AI"],
    Wednesday: ["OODD", "OODD", "Parallel Computing", "Lunch", "Cloud (Lab)", "Database", "E-Commerce"],
    Thursday: ["Database", "Cloud Computing", "AI(Lab)", "Lunch", "Self-study", "E-Commerce", "OODD(Lab)"],
    Friday: ["AI", "Cloud Computing", "Parallel Computing", "Lunch", "Library", "E-Commerce", "Database(Lab)"]
  };

  const courseInfo = {
    "Parallel Computing": { teacher: "Daw Theint Thu San" },
    "Maths": { teacher: "Daw Myint Myint Toe" },
    "OODD": { teacher: "Daw Khin Htay" },
    "OODD(Lab)": { teacher: "Daw Khin Htay" },
    "AI": { teacher: "Dr. Thidar Win" },
    "AI(Lab)": { teacher: "Dr. Thidar Win" },
    "Database": { teacher: "Daw Zin Mar Naing" },
    "Database(Lab)": { teacher: "Daw Zin Mar Naing" },
    "Cloud Computing": { teacher: "Daw Ei Ei Mon" },
    "Cloud (Lab)": { teacher: "Daw Ei Ei Mon" },
    "E-Commerce": { teacher: "Daw Ni Ni Khaing" },
    "Self-study": { teacher: "Independent" },
    "Library": { teacher: "Library Staff" },
    "Lunch": { teacher: "Break Time" }
  };

  const timeSlots = [[510, 570], [575, 635], [640, 700], [700, 760], [760, 820], [825, 885], [890, 950]];

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState(null);
  const [today, setToday] = useState("");
  const [selectedDay, setSelectedDay] = useState(""); 
  const [popup, setPopup] = useState(null);
  const lastSubjectRef = useRef(null);

  // --- LOGIC ---
  useEffect(() => {
    const loader = setTimeout(() => setLoading(false), 2000);

    const update = () => {
      const now = new Date();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const dayName = days[now.getDay()];
      setToday(dayName);

      if (!selectedDay) {
        setSelectedDay(dayName === "Sunday" || dayName === "Saturday" ? "Monday" : dayName);
      }

      const mins = now.getHours() * 60 + now.getMinutes();
      const index = timeSlots.findIndex(s => mins >= s[0] && mins < s[1]);

      if (index !== -1 && scheduleData[dayName]) {
        const subject = scheduleData[dayName][index];
        setActiveSlot(index);
        
        if (subject !== lastSubjectRef.current) {
          lastSubjectRef.current = subject;
          setPopup({ 
            name: subject, 
            teacher: courseInfo[subject]?.teacher,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setTimeout(() => setPopup(null), 5000);
        }
      } else {
        setActiveSlot(null);
      }
    };

    update();
    const interval = setInterval(update, 10000);
    return () => { clearInterval(interval); clearTimeout(loader); };
  }, [selectedDay]);

  const groupedByTeacher = {};
  Object.entries(courseInfo).filter(([s]) => !["Lunch", "Self-study", "Library"].includes(s)).forEach(([s, i]) => {
    if (!groupedByTeacher[i.teacher]) groupedByTeacher[i.teacher] = [];
    groupedByTeacher[i.teacher].push(s);
  });

  // --- 1. ENTRANCE ANIMATION (SPLASH SCREEN) ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#0b1220] flex flex-col items-center justify-center">
        <div className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="relative flex flex-col items-center animate-in zoom-in duration-1000">
          <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8">
            <img src="/Meiktila2.png" alt="Logo" className="h-16 w-auto animate-bounce" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-[0.5em] text-white">
            UCS <span className="text-blue-500">Meikhtila</span>
          </h1>
          <div className="mt-4 flex gap-1.5">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. MAIN APP CONTENT ---
  return (
    <div className="min-h-screen bg-[#0b1220] text-white font-sans overflow-x-hidden animate-in fade-in duration-1000">
      
      {/* CYBER-GLASS NOTIFICATION POPUP */}
      <div className={`fixed z-[200] transition-all duration-700 ease-out 
        ${popup ? 'top-6 opacity-100' : '-top-40 opacity-0'} 
        left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 w-[90%] md:w-[320px]`}>
        <div className="relative overflow-hidden rounded-[2rem] p-[1px] bg-gradient-to-br from-emerald-400/40 via-transparent to-emerald-900/20 shadow-2xl">
          <div className="relative bg-[#0b1220]/90 backdrop-blur-2xl rounded-[1.95rem] p-5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                <span className="text-xl">⚡</span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Now</span>
                  <span className="text-[8px] text-white/20 font-bold">{popup?.time}</span>
                </div>
                <h2 className="text-xs font-black text-white uppercase leading-tight">{popup?.name}</h2>
                <p className="text-[9px] text-white/40 italic">w/ {popup?.teacher}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 MOBILE DAY PICKER */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#0b1220]/90 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {Object.keys(scheduleData).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-300 shrink-0 border uppercase tracking-widest active:scale-95 ${
                selectedDay === day 
                ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/40" 
                : "bg-white/5 border-transparent text-white/30"
              }`}
            >
              {day === today ? "⭐️ Today" : day}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="relative overflow-hidden p-6 lg:p-10 text-white bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] lg:rounded-[2.5rem] lg:w-[calc(100%-4rem)] lg:mx-auto shadow-2xl lg:mt-4 border border-white/5">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-5 text-center lg:text-left">
            <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-2xl border border-white/10">
              <img src="/Meiktila2.png" alt="Logo" className="h-12 lg:h-16 w-auto" />
            </div>
            <div>
              <h1 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">UCS Meikhtila</h1>
              <p className="text-[10px] opacity-40 uppercase mt-1 tracking-[0.3em]">Smart Timetable • IV.BE(C.S)</p>
            </div>
          </div>
          <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <DateTime />
          </div>
        </div>
      </header>

      {/* MAIN SCHEDULE */}
      <main className="p-4 lg:p-8 max-w-7xl mx-auto">
        {Object.entries(scheduleData).map(([day, subjects]) => (
          <div 
            key={day} 
            className={`${day === selectedDay ? 'block animate-in fade-in slide-in-from-bottom-4 duration-700' : 'hidden lg:block'} mb-12`}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[10px] lg:text-sm font-black tracking-[0.3em] text-white/20 uppercase">{day}</h2>
              {today === day && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Active Day</span>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-inner">
              <div className="grid grid-cols-1 lg:grid-cols-7">
                {subjects.map((sub, i) => {
                  const isActive = today === day && i === activeSlot;
                  return (
                    <div key={i} className={`relative min-h-[90px] lg:min-h-[110px] p-5 text-center flex flex-col justify-center transition-all duration-500 border-b lg:border-b-0 lg:border-r border-white/5 last:border-none ${isActive ? "bg-blue-600/20" : "hover:bg-white/[0.03]"}`}>
                      {isActive && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] animate-pulse" />}
                      <div className="text-[11px] lg:text-xs font-black text-white uppercase tracking-tight leading-tight">{sub}</div>
                      <div className="text-[9px] text-white/30 mt-1.5 font-medium">{courseInfo[sub]?.teacher}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* STAFF SECTION */}
      <section id="staff" className="max-w-7xl mx-auto px-4 lg:px-10 mt-12 mb-32">
        <div className="relative p-8 lg:p-14 rounded-[3rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-3xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 mb-10">
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white">Faculty <span className="text-blue-500">Members</span></h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-2 font-bold italic">Department of Computer Science</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {Object.entries(groupedByTeacher).map(([teacher, subjects], i) => (
              <div key={i} className="group p-6 rounded-[2rem] bg-[#111827]/40 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black text-lg group-hover:bg-blue-500/20 transition-all">
                    {teacher.split(" ")[1]?.[0] || teacher[0]}
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-black uppercase text-white/80 group-hover:text-white transition-colors">{teacher}</h3>
                    <p className="text-[9px] text-blue-500/50 font-bold uppercase tracking-widest mt-1">Lecturer</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {subjects.map((s, idx) => (
                    <span key={idx} className="text-[8px] px-2.5 py-1 rounded-lg bg-white/5 text-white/40 font-bold uppercase border border-white/5">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MINIMALIST MODERN FOOTER */}
      <footer className="relative mt-20 py-16 px-6 border-t border-white/[0.05] bg-[#0b1220] overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          
          <div className="group flex flex-col items-center">
            <img src="/Meiktila2.png" alt="Logo" className="h-10 w-auto opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
            <h3 className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 group-hover:text-blue-500 transition-colors">UCS Meikhtila</h3>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 leading-relaxed text-center italic group-hover:text-white transition-all duration-700">
              Synchronizing <span className="text-blue-500/80">Academic Velocity</span> with Real-Time Precision.
            </p>
            <div className="mt-4 w-12 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          </div>

          {/* CONTACT ICONS */}
          <div className="flex gap-4 mt-2">
            {[
              { icon: '✉️', link: 'mailto:thantzaw215204@gmail.com', label: 'Gmail' },
              { icon: '📞', link: 'tel:09982268184', label: 'Phone' }
            ].map((item, i) => (
              <a 
                key={i} 
                href={item.link}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/5 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/10 text-xs grayscale hover:grayscale-0 transition-all duration-500"
                title={item.label}
              >
                {item.icon}
              </a>
            ))}
          </div>

          <p className="text-[9px] font-medium text-white/10 uppercase tracking-[0.4em] text-center">
            © 2026 Developed by <span className="text-white/30">Thant Zaw</span>
          </p>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      </footer>

      {/* 📱 MOBILE FLOATING NAV */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[400px] z-[60]">
        <div className="bg-[#161b2c]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-around shadow-2xl">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex flex-col items-center p-3 text-blue-400 transition-transform active:scale-95">
            <span className="text-xl mb-1">📅</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Schedule</span>
          </button>
          <button onClick={() => document.getElementById('staff')?.scrollIntoView({behavior: 'smooth'})} className="flex flex-col items-center p-3 text-white/20 transition-transform active:scale-95">
            <span className="text-xl mb-1">🎓</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Faculty</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;