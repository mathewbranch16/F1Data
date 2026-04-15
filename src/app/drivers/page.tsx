"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { getDriverData } from "@/lib/team-colors";

export default function DriversPage() {
  const { setActiveTeam } = useTheme();
  const { year, gp } = useSession();
  const [driverCodes, setDriverCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://127.0.0.1:8000/drivers?year=${year}&gp=${gp}`)
      .then(res => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then(data => setDriverCodes(data.drivers || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, gp]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-surface">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] transition-all duration-1000 ease-in-out bg-primary blur-[250px] opacity-[0.06] pointer-events-none mix-blend-screen animate-glow-pulse" />
      
      <PageContainer className="pt-12 pb-16 relative z-10 min-h-screen flex flex-col animate-page-in">
        <div className="mb-16">
          <div className="flex gap-4 items-center">
             <h1 className="display-lg text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">DRIVER <span className="text-primary opacity-50 drop-shadow-[0_0_15px_currentColor] transition-colors duration-500">GRID</span></h1>
             {loading && <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin mb-4" />}
          </div>
          <p className="text-lg text-white/50 font-light max-w-2xl">
            Select a driver to view their full race analysis for the <span className="text-primary font-medium">{year} {gp}</span> Grand Prix. Data is loaded live from the FastF1 telemetry engine.
          </p>
        </div>

        {error && (
          <div className="w-full p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8">
            <span className="font-bold mr-2">Connection Error:</span>{error}. Make sure the backend is running at <code className="bg-white/10 px-2 py-0.5 rounded">localhost:8000</code>.
          </div>
        )}

        {!loading && !error && driverCodes.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/30 text-lg font-light">No drivers found for this session. Try selecting a different Grand Prix.</p>
          </div>
        )}

        {!loading && driverCodes.length > 0 && (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch"
            onMouseLeave={() => setActiveTeam('default')}
          >
            {driverCodes.map(code => {
              const driver = getDriverData(code);
              return (
                <Link 
                  href={`/driver/${code}`} 
                  key={code} 
                  className="block group h-full"
                  onMouseEnter={() => setActiveTeam(driver.teamId)}
                >
                  <Card signalColor="bg-primary" className="h-full flex flex-col cursor-pointer transition-all duration-500 relative">
                    <div className="flex justify-between items-start relative flex-1 mb-16">
                      <span className="display-lg text-white/5 group-hover:text-white/10 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-500 leading-none tracking-tighter">
                        {driver.number || code}
                      </span>
                      <div className="relative shrink-0">
                         <div className="absolute -inset-2 rounded-full bg-primary blur-[10px] opacity-0 group-hover:opacity-40 transition-all duration-500" />
                         <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_currentColor] relative z-10 transition-colors duration-500" />
                      </div>
                    </div>
                    <div className="mt-auto border-t border-white/[0.05] pt-6 flex justify-between items-center gap-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold mb-1 text-white opacity-90 group-hover:opacity-100 transition-all duration-300">
                          {driver.name}
                        </h3>
                        <p className="label-sm opacity-50 group-hover:opacity-80 transition-opacity text-white">{driver.team}</p>
                      </div>
                      <div className="shrink-0 flex items-center justify-center border border-white/5 group-hover:border-primary/30 rounded-md px-3 py-1.5 mt-auto text-[10px] font-bold text-white/40 group-hover:text-primary transition-all shadow-[0_0_0px_transparent] group-hover:shadow-[0_0_15px_rgba(79,245,223,0.2)]">
                         {code}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
