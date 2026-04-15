"use client";

import { useSession } from "@/components/providers/SessionProvider";

export function SessionControls() {
  const { year, setYear, gp, setGp } = useSession();

  const YEARS = [2021, 2022, 2023, 2024];
  const GRAND_PRIX = [
    "Bahrain", "Saudi Arabia", "Australia", "Azerbaijan", "Miami", 
    "Monaco", "Spain", "Canada", "Austria", "Great Britain", 
    "Hungary", "Belgium", "Netherlands", "Monza", "Singapore", 
    "Japan", "Qatar", "Austin", "Mexico", "Brazil", "Las Vegas", 
    "Abu Dhabi"
  ];

  return (
    <div className="flex items-center gap-4 border border-white/10 bg-black/40 backdrop-blur-xl rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
       <div className="flex items-center gap-2">
          <label className="text-xs text-white/40 uppercase tracking-widest">YR</label>
          <select 
             value={year}
             onChange={(e) => setYear(Number(e.target.value))}
             className="bg-transparent text-white text-sm font-display font-bold outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
          >
             {YEARS.map(y => <option key={y} value={y} className="bg-[#0e0e0e]">{y}</option>)}
          </select>
       </div>
       
       <div className="w-[1px] h-4 bg-white/10" />

       <div className="flex items-center gap-2">
          <label className="text-xs text-white/40 uppercase tracking-widest">GP</label>
          <select 
             value={gp}
             onChange={(e) => setGp(e.target.value)}
             className="bg-transparent text-white text-sm font-display font-bold outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
          >
             {GRAND_PRIX.map(g => <option key={g} value={g} className="bg-[#0e0e0e]">{g.toUpperCase()}</option>)}
          </select>
       </div>
    </div>
  );
}
