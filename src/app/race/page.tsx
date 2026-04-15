"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/components/providers/SessionProvider";
import Link from "next/link";

const GP_LIST = [
  { name: "Bahrain Grand Prix", gp: "Bahrain", track: "Bahrain International Circuit", date: "Mar" },
  { name: "Saudi Arabian Grand Prix", gp: "Saudi Arabia", track: "Jeddah Corniche Circuit", date: "Mar" },
  { name: "Australian Grand Prix", gp: "Australia", track: "Albert Park Circuit", date: "Mar" },
  { name: "Azerbaijan Grand Prix", gp: "Azerbaijan", track: "Baku City Circuit", date: "Apr" },
  { name: "Miami Grand Prix", gp: "Miami", track: "Miami International Autodrome", date: "May" },
  { name: "Monaco Grand Prix", gp: "Monaco", track: "Circuit de Monaco", date: "May" },
  { name: "Spanish Grand Prix", gp: "Spain", track: "Circuit de Barcelona-Catalunya", date: "Jun" },
  { name: "Canadian Grand Prix", gp: "Canada", track: "Circuit Gilles Villeneuve", date: "Jun" },
  { name: "Austrian Grand Prix", gp: "Austria", track: "Red Bull Ring", date: "Jul" },
  { name: "British Grand Prix", gp: "Great Britain", track: "Silverstone Circuit", date: "Jul" },
  { name: "Hungarian Grand Prix", gp: "Hungary", track: "Hungaroring", date: "Jul" },
  { name: "Belgian Grand Prix", gp: "Belgium", track: "Circuit de Spa-Francorchamps", date: "Jul" },
  { name: "Dutch Grand Prix", gp: "Netherlands", track: "Circuit Zandvoort", date: "Aug" },
  { name: "Italian Grand Prix", gp: "Monza", track: "Autodromo Nazionale Monza", date: "Sep" },
  { name: "Singapore Grand Prix", gp: "Singapore", track: "Marina Bay Street Circuit", date: "Sep" },
  { name: "Japanese Grand Prix", gp: "Japan", track: "Suzuka International Racing Course", date: "Sep" },
  { name: "Qatar Grand Prix", gp: "Qatar", track: "Lusail International Circuit", date: "Oct" },
  { name: "US Grand Prix", gp: "Austin", track: "Circuit of the Americas", date: "Oct" },
  { name: "Mexico City Grand Prix", gp: "Mexico", track: "Autódromo Hermanos Rodríguez", date: "Oct" },
  { name: "São Paulo Grand Prix", gp: "Brazil", track: "Autódromo José Carlos Pace", date: "Nov" },
  { name: "Las Vegas Grand Prix", gp: "Las Vegas", track: "Las Vegas Strip Circuit", date: "Nov" },
  { name: "Abu Dhabi Grand Prix", gp: "Abu Dhabi", track: "Yas Marina Circuit", date: "Dec" },
];

export default function RacePage() {
  const { year, gp: activeGp, setGp, setYear } = useSession();

  const handleSelect = (gpName: string) => {
    setGp(gpName);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[120%] h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 shadow-[0_0_100px_4px_currentColor] transform rotate-6" />
        <div className="absolute bottom-[20%] right-[10%] w-[60vw] h-[60vw] bg-primary rounded-full blur-[300px] opacity-[0.04] animate-glow-pulse" />
      </div>

      <PageContainer className="pt-12 pb-16 relative z-10 animate-page-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="display-lg text-white mb-2">RACE <span className="text-primary opacity-50 drop-shadow-[0_0_15px_currentColor]">CALENDAR</span></h1>
            <p className="text-lg text-white/50 font-light max-w-2xl">
              Select a Grand Prix to load its telemetry data. Currently viewing: <span className="text-primary font-medium">{year}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {[2021, 2022, 2023, 2024].map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${year === y ? 'bg-primary/10 text-primary shadow-[0_0_15px_currentColor]' : 'text-white/40 hover:bg-white/5'}`}>
                {y}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {GP_LIST.map((race, i) => {
            const isActive = activeGp === race.gp;
            return (
              <button key={race.gp} onClick={() => handleSelect(race.gp)} className="text-left w-full h-full group">
                <Card className={`flex flex-col group h-full transition-all duration-500 ${isActive ? 'shadow-[0_0_30px_var(--primary)] bg-white/[0.04]' : ''}`} signalColor={isActive ? "bg-primary" : "bg-white/10"}>
                  <div className="flex-1 relative z-10 flex flex-col">
                    <span className="label-sm text-primary group-hover:drop-shadow-[0_0_5px_currentColor] transition-all">{race.date}</span>
                    <h3 className="font-display text-2xl font-bold mt-3 mb-2 text-white group-hover:text-primary transition-colors tracking-tight line-clamp-2 min-h-[3.5rem]">{race.name}</h3>
                    <p className="text-xs text-white/40 font-light">{race.track}</p>
                  </div>
                  <div className="mt-auto pt-5 mt-6 border-t border-white/[0.05] flex justify-between items-center relative z-10">
                    <span className="label-sm opacity-40">{race.gp.toUpperCase()}</span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shadow-[0_0_10px_currentColor] animate-pulse uppercase tracking-widest">ACTIVE</span>
                    )}
                    <Link href="/drivers" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                      VIEW DRIVERS →
                    </Link>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
