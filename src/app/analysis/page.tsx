"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/components/providers/SessionProvider";
import { getDriverData } from "@/lib/team-colors";
import { BASE_URL } from "@/lib/api";

function parseLapTime(lapTimeStr: string): number | null {
  if (!lapTimeStr || lapTimeStr === "NaT" || lapTimeStr === "null" || lapTimeStr === "0") return null;
  const match = lapTimeStr.match(/(?:days?\s+)?(?:(\d+):)?(\d+):(\d+\.\d+)/);
  if (match) return (parseInt(match[1]||"0")*3600) + (parseInt(match[2]||"0")*60) + parseFloat(match[3]||"0");
  return null;
}

const generateSmoothPath = (pts: {x:number,y:number}[]) => {
  if (pts.length === 0) return "";
  let path = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    path += ` C ${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
  }
  return path;
};

export default function AnalysisPage() {
  const { year, gp } = useSession();
  const [drivers, setDrivers] = useState<string[]>([]);
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [compareData, setCompareData] = useState<any>(null);
  const [aiCompare, setAiCompare] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);

  useEffect(() => {
    setDriversLoading(true);
    fetch(`${BASE_URL}/drivers?year=${year}&gp=${gp}`)
      .then(r => r.json()).then(data => {
        const list = data.drivers || [];
        setDrivers(list);
        if (list.length >= 2) { setD1(list[0]); setD2(list[1]); }
      }).catch(console.error).finally(() => setDriversLoading(false));
  }, [year, gp]);

  useEffect(() => {
    if (!d1 || !d2 || d1 === d2) return;
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/compare?year=${year}&gp=${gp}&d1=${d1}&d2=${d2}`).then(r=>r.json()),
      fetch(`${BASE_URL}/ai-compare?year=${year}&gp=${gp}&d1=${d1}&d2=${d2}`).then(r=>r.json()),
    ]).then(([cmp, ai]) => { setCompareData(cmp); setAiCompare(ai); })
      .catch(console.error).finally(() => setLoading(false));
  }, [d1, d2, year, gp]);

  // Process comparison data for charting
  const p1: {lap:number, time:number}[] = [];
  const p2: {lap:number, time:number}[] = [];
  if (compareData?.lap_numbers) {
    compareData.lap_numbers.forEach((lap: number, idx: number) => {
      const t1 = parseLapTime(compareData.driver1_times[idx]);
      const t2 = parseLapTime(compareData.driver2_times[idx]);
      if (t1 && t1 > 0 && t1 < 130) p1.push({ lap, time: t1 });
      if (t2 && t2 > 0 && t2 < 130) p2.push({ lap, time: t2 });
    });
  }

  const allPts = [...p1, ...p2];
  const minLap = allPts.length ? Math.min(...allPts.map(d=>d.lap)) : 0;
  const maxLap = allPts.length ? Math.max(...allPts.map(d=>d.lap)) : 1;
  const minTime = allPts.length ? Math.min(...allPts.map(d=>d.time)) : 0;
  const maxTime = allPts.length ? Math.max(...allPts.map(d=>d.time)) : 1;

  const W = 1000, H = 400, PX = 60, PY = 40, PB = 60;
  const scale = (pts: {lap:number,time:number}[]) => pts.map(d => ({
    x: PX + ((d.lap - minLap) / (maxLap - minLap || 1)) * (W - PX - 40),
    y: PY + ((H - PY - PB) - ((d.time - minTime) / (maxTime - minTime || 1)) * (H - PY - PB)),
  }));

  const dr1 = getDriverData(d1);
  const dr2 = getDriverData(d2);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen">
         <div className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] bg-primary rounded-full blur-[250px] opacity-[0.05] animate-glow-pulse" />
      </div>

      <PageContainer className="pt-12 pb-16 min-h-[100dvh] relative z-10 animate-page-in">
        <div className="mb-12">
          <h1 className="display-lg text-white mb-2 tracking-tighter">DRIVER <span className="text-primary opacity-50 drop-shadow-[0_0_15px_currentColor]">COMPARISON</span></h1>
          <p className="text-lg text-white/40 font-light max-w-2xl">Compare two drivers head-to-head for the <span className="text-primary font-medium">{year} {gp}</span> Grand Prix.</p>
        </div>

        {/* Driver Selectors */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          <div className="flex-1">
            <label className="label-sm text-white/40 mb-3 block">DRIVER 1</label>
            <select value={d1} onChange={e => setD1(e.target.value)} disabled={driversLoading}
              className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl text-sm text-white/90 focus:border-primary/50 focus:outline-none transition-colors appearance-none cursor-pointer font-display font-bold text-xl">
              {drivers.map(c => <option key={c} value={c} className="bg-[#0e0e0e]">{c} — {getDriverData(c).name}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-4 text-white/20 font-display text-2xl font-bold">VS</div>
          <div className="flex-1">
            <label className="label-sm text-white/40 mb-3 block">DRIVER 2</label>
            <select value={d2} onChange={e => setD2(e.target.value)} disabled={driversLoading}
              className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl text-sm text-white/90 focus:border-primary/50 focus:outline-none transition-colors appearance-none cursor-pointer font-display font-bold text-xl">
              {drivers.map(c => <option key={c} value={c} className="bg-[#0e0e0e]">{c} — {getDriverData(c).name}</option>)}
            </select>
          </div>
        </div>

        {/* AI Insight */}
        {aiCompare && !loading && (
          <div className="w-full bg-black/40 border border-white/[0.05] rounded-2xl p-6 mb-10 backdrop-blur-xl relative overflow-hidden group animate-fade-up">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:shadow-[0_0_15px_currentColor] transition-all" />
            <h4 className="label-sm text-white/50 mb-4 flex items-center gap-2">
               <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               AI COMPARISON INSIGHT
            </h4>
            <p className="text-white/80 text-sm md:text-base font-light leading-relaxed">{aiCompare.insight}</p>
          </div>
        )}

        {/* Graph */}
        <Card className="min-h-[500px] relative" signalColor="bg-primary">
          <div className="flex justify-between items-center mb-6">
            <h2 className="label-sm text-white/60">LAP TIME OVERLAY</h2>
            <div className="flex gap-8">
              <span className="flex items-center gap-2 text-xs text-white/70"><div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_currentColor]" /> {d1} — {dr1.name}</span>
              <span className="flex items-center gap-2 text-xs text-white/70"><div className="w-3 h-3 rounded-full bg-white/80" /> {d2} — {dr2.name}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[350px]"><div className="w-10 h-10 rounded-full border-t-2 border-primary animate-spin" /></div>
          ) : allPts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[350px]"><p className="text-white/30 font-light">Select two different drivers to compare.</p></div>
          ) : (
            <div className="w-full relative mt-4 h-[380px]">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                {[0, 0.5, 1].map(pct => (
                  <line key={`g-${pct}`} x1={PX} y1={PY + pct * (H - PY - PB)} x2={W - 40} y2={PY + pct * (H - PY - PB)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}
                <text x={W/2} y={H - 15} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">LAP NUMBER</text>
                <text transform="rotate(-90)" x={-(H/2)} y={18} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">TIME (SECONDS)</text>
                <path d={generateSmoothPath(scale(p1))} fill="none" stroke="var(--primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_10px_var(--primary)]" />
                <path d={generateSmoothPath(scale(p2))} fill="none" stroke="#FFFFFF" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="6 4" className="drop-shadow-[0_0_6px_#fff] opacity-70" />
              </svg>
            </div>
          )}
        </Card>
      </PageContainer>
    </div>
  );
}
