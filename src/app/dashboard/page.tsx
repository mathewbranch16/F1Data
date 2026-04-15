"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/components/providers/SessionProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getDriverData } from "@/lib/team-colors";
import Link from "next/link";
import { BASE_URL } from "@/lib/api";

export default function DashboardPage() {
  const { year, setYear, gp, setGp } = useSession();
  const { setActiveTeam } = useTheme();
  const [drivers, setDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const YEARS = [2021, 2022, 2023, 2024];
  const GP_LIST = [
    "Bahrain", "Saudi Arabia", "Australia", "Azerbaijan", "Miami",
    "Monaco", "Spain", "Canada", "Austria", "Great Britain",
    "Hungary", "Belgium", "Netherlands", "Monza", "Singapore",
    "Japan", "Qatar", "Austin", "Mexico", "Brazil", "Las Vegas",
    "Abu Dhabi"
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/drivers?year=${year}&gp=${gp}`)
      .then(res => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(data => setDrivers(data.drivers || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, gp]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-surface">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen">
        <div className="absolute top-[15%] left-[25%] w-[60vw] h-[60vw] bg-primary rounded-full blur-[300px] opacity-[0.05] animate-glow-pulse" />
      </div>

      <PageContainer className="pt-10 pb-20 relative z-10 animate-page-in">

        {/* ─── HEADER ─── */}
        <div className="mb-12">
          <h1 className="display-lg text-white mb-2 tracking-tighter">
            RACE <span className="text-primary opacity-60 drop-shadow-[0_0_15px_currentColor]">DASHBOARD</span>
          </h1>
          <p className="text-lg text-white/40 font-light max-w-2xl">
            Select a season and Grand Prix, then choose a driver to begin your analysis.
          </p>
        </div>

        {/* ─── DATA CONTROLS ─── */}
        <Card className="mb-12 !p-8" glowOnHover={false} signalColor="bg-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Year */}
            <div>
              <label className="label-sm text-white/40 mb-4 block">SEASON</label>
              <div className="flex gap-3">
                {YEARS.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`flex-1 py-3 rounded-xl text-sm font-display font-bold transition-all duration-300 ${
                      year === y
                        ? 'bg-primary/15 text-primary shadow-[0_0_20px_var(--primary)] border border-primary/30'
                        : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] border border-white/5'
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Grand Prix */}
            <div>
              <label className="label-sm text-white/40 mb-4 block">GRAND PRIX</label>
              <select
                value={gp}
                onChange={e => setGp(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl text-sm text-white/90 focus:border-primary/50 focus:outline-none transition-colors appearance-none cursor-pointer font-display font-bold"
              >
                {GP_LIST.map(g => (
                  <option key={g} value={g} className="bg-[#0e0e0e]">{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Session Badge */}
          <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_currentColor] animate-pulse" />
            <span className="text-xs text-white/50 font-light">
              Active Session: <span className="text-primary font-bold">{year} {gp} Grand Prix</span> — Race
            </span>
            {loading && <div className="w-4 h-4 rounded-full border-t-2 border-primary animate-spin ml-auto" />}
          </div>
        </Card>

        {/* ─── ERROR STATE ─── */}
        {error && (
          <div className="w-full p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-8 animate-fade-up">
            <span className="font-bold mr-2">Connection Error:</span>{error}. Ensure the backend is running at <code className="bg-white/10 px-2 py-0.5 rounded">localhost:8000</code>.
          </div>
        )}

        {/* ─── DRIVER GRID ─── */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Select Driver <span className="text-white/20 ml-2 text-lg">({drivers.length})</span>
          </h2>
          <Link href="/analysis" className="label-sm text-primary hover:underline transition-all drop-shadow-[0_0_5px_currentColor]">
            COMPARE TWO DRIVERS →
          </Link>
        </div>

        {!loading && !error && drivers.length === 0 && (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-white/30 text-lg font-light">No drivers found for this session. Try a different Grand Prix or year.</p>
          </div>
        )}

        {!loading && drivers.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
            onMouseLeave={() => setActiveTeam('default')}
          >
            {drivers.map((code, i) => {
              const driver = getDriverData(code);
              return (
                <Link
                  href={`/driver/${code}`}
                  key={code}
                  className="block group h-full"
                  onMouseEnter={() => setActiveTeam(driver.teamId)}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <Card signalColor="bg-primary" className="h-full flex flex-col cursor-pointer transition-all duration-500 relative animate-fade-up">
                    {/* Number watermark */}
                    <div className="flex justify-between items-start relative flex-1 mb-12">
                      <span className="display-lg text-white/[0.04] group-hover:text-white/10 transition-all duration-500 leading-none tracking-tighter">
                        {driver.number || code}
                      </span>
                      <div className="relative shrink-0">
                        <div className="absolute -inset-2 rounded-full bg-primary blur-[10px] opacity-0 group-hover:opacity-40 transition-all duration-500" />
                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_currentColor] relative z-10 transition-colors duration-500" />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto border-t border-white/[0.05] pt-5 flex justify-between items-center gap-4">
                      <div>
                        <h3 className="font-display text-xl font-bold mb-1 text-white opacity-90 group-hover:opacity-100 transition-all duration-300">
                          {driver.name}
                        </h3>
                        <p className="label-sm opacity-40 group-hover:opacity-70 transition-opacity text-white text-[10px]">{driver.team}</p>
                      </div>
                      <div className="shrink-0 flex items-center justify-center border border-white/5 group-hover:border-primary/30 rounded-md px-3 py-1.5 text-[10px] font-bold text-white/40 group-hover:text-primary transition-all group-hover:shadow-[0_0_15px_rgba(79,245,223,0.2)]">
                        {code}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[220px] rounded-2xl bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        )}

      </PageContainer>
    </div>
  );
}
