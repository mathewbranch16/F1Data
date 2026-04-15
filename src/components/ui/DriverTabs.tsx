"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { useSession } from "@/components/providers/SessionProvider";
import { BASE_URL } from "@/lib/api";

const TABS = ["Performance Trend", "Race Strategy", "Sector Breakdown", "Lap Data Table", "Driver Comparison", "Comparison Table", "Statistics & Prediction", "AI Insights"];

export function DriverStats({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!driverCode) return;
    setSummary(null);
    fetch(`${BASE_URL}/driver-summary?year=${year}&gp=${gp}&driver=${driverCode}`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(console.error);
  }, [driverCode, year, gp]);

  if (!summary) return <SkeletonLoaderStats />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
       <StatCard title="TOTAL LAPS" value={summary.total_laps} />
       <StatCard title="BEST LAP" value={formatRawLapTime(summary.best_lap)} glow />
       <StatCard title="AVERAGE LAP" value={formatRawLapTime(summary.average_lap)} />
    </div>
  );
}

function SkeletonLoaderStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-10">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="h-[140px] rounded-xl bg-white/[0.02] border border-white/[0.02] backdrop-blur-xl animate-pulse flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
        </div>
      ))}
    </div>
  );
}

function StatCard({ title, value, glow }: { title: string, value: string | number, glow?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.02] backdrop-blur-xl p-8 flex flex-col justify-center transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.5)] group`}>
       {glow && <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />}
       <p className="label-sm text-white/40 mb-3 tracking-widest uppercase">{title}</p>
       <p className={`font-display text-4xl md:text-5xl font-bold tracking-tighter ${glow ? 'text-primary drop-shadow-[0_0_8px_currentColor]' : 'text-white drop-shadow-md'}`}>
         {value}
       </p>
    </div>
  );
}

export function DriverTabs({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTelemetry() {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/driver-data?year=${year}&gp=${gp}&driver=${driverCode}`);
        const data = await response.json();
        setTelemetry(data);
      } catch (err) {
        console.error("Failed to load telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTelemetry();
  }, [driverCode, year, gp]);

  return (
    <div className="w-full flex flex-col gap-10 mt-8">
      <div className="flex gap-4 md:gap-8 border-b border-white/[0.05] pb-0 overflow-x-auto hide-scrollbar snap-x relative z-20">
        {TABS.map((tab, idx) => (
          <button 
             key={tab}
             onClick={() => setActiveTab(idx)}
             className={`pb-4 px-1 label-sm transition-all duration-300 relative whitespace-nowrap outline-none ${activeTab === idx ? "text-primary drop-shadow-[0_0_8px_currentColor]" : "text-white/40 hover:text-white/70"}`}
          >
             {tab}
             {activeTab === idx && (
               <span className="absolute bottom-[0px] left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_currentColor] transition-all duration-500" />
             )}
          </button>
        ))}
      </div>
      
      <div className="relative min-h-[400px]">
        <div key={activeTab} className="animate-tab-in w-full h-full">
          {activeTab === 0 && <SpeedTab telemetry={telemetry} isLoading={loading} driverCode={driverCode} />}
          {activeTab === 1 && <TyresTab driverCode={driverCode} />}
          {activeTab === 2 && <SectorTab driverCode={driverCode} />}
          {activeTab === 3 && <LapTableTab driverCode={driverCode} />}
          {activeTab === 4 && <CompareTab driverCode={driverCode} />}
          {activeTab === 5 && <ComparisonTableTab driverCode={driverCode} />}
          {activeTab === 6 && <StatsTab driverCode={driverCode} />}
          {activeTab === 7 && <AITab driverCode={driverCode} />}
        </div>
      </div>
    </div>
  );
}

function parseLapTime(lapTimeStr: string): number | null {
  if (!lapTimeStr || lapTimeStr === "NaT" || lapTimeStr === "null" || lapTimeStr === "0") return null;
  const timeRegex = /(?:days?\s+)?(?:(\d+):)?(\d+):(\d+\.\d+)/;
  const match = lapTimeStr.match(timeRegex);
  if (match) {
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseFloat(match[3] || "0");
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  return null;
}

const generateSmoothPath = (pts: {lap: number, time: number}[], w: number, h: number, minL: number, maxL: number, minT: number, maxT: number) => {
    if (pts.length === 0) return "";
    const scaled = pts.map(d => ({
        x: 60 + ((d.lap - minL)/(maxL - minL || 1)) * (w - 100),
        y: 40 + ((h - 100) - ((d.time - minT)/(maxT - minT || 1)) * (h - 100))
    }));
    
    let path = `M ${scaled[0].x},${scaled[0].y}`;
    for (let i = 0; i < scaled.length - 1; i++) {
        const p0 = scaled[Math.max(0, i - 1)];
        const p1 = scaled[i];
        const p2 = scaled[i + 1];
        const p3 = scaled[Math.min(scaled.length - 1, i + 2)];
        
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
};

// ---------------------------------------------
// [TAB] PERFORMANCE TREND (SPEED)
// ---------------------------------------------
function SpeedTab({ telemetry, isLoading, driverCode }: { telemetry: any, isLoading: boolean, driverCode: string }) {
  const [hoveredLap, setHoveredLap] = useState<{lap: number, time: number} | null>(null);

  if (isLoading) {
    return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary"><div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin shadow-[0_0_15px_currentColor]" /></Card>;
  }

  const dataPoints: { lap: number, time: number }[] = [];
  if (telemetry?.lap_numbers) {
    const timesArr = telemetry.lap_times_sec || telemetry.lap_times;
    timesArr?.forEach((raw: any, idx: number) => {
      const timeInSecs = typeof raw === 'number' ? raw : parseLapTime(String(raw));
      if (timeInSecs && timeInSecs > 0 && timeInSecs < 200) {
           dataPoints.push({ lap: telemetry.lap_numbers[idx], time: timeInSecs });
      }
    });
  }

  if (dataPoints.length === 0) {
    return <Card className="min-h-[400px] flex items-center justify-center p-12 text-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary"><span className="label-sm text-primary animate-pulse">NO VALID RECORD AVAILABLE</span></Card>;
  }

  const meanTime = dataPoints.reduce((a, b) => a + b.time, 0) / dataPoints.length;
  const anomalies = dataPoints.filter(d => d.time > meanTime + 3);

  const minLap = Math.min(...dataPoints.map(d => d.lap));
  const maxLap = Math.max(...dataPoints.map(d => d.lap));
  const minTime = Math.min(...dataPoints.map(d => d.time));
  const maxTime = Math.max(...dataPoints.map(d => d.time));

  const width = 1000, height = 450, paddingX = 60, paddingY = 40, paddingB = 60;
  const getX = (lap: number) => paddingX + ((lap - minLap) / (maxLap - minLap || 1)) * (width - paddingX - 40);
  const getY = (time: number) => paddingY + ((height - paddingY - paddingB) - ((time - minTime) / (maxTime - minTime || 1)) * (height - paddingY - paddingB));

  const pathD = generateSmoothPath(dataPoints, width, height, minLap, maxLap, minTime, maxTime);
  const fillPathD = `${pathD} L ${getX(dataPoints[dataPoints.length-1].lap)},${height-paddingB} L ${getX(dataPoints[0].lap)},${height-paddingB} Z`;

  return (
    <Card className="h-auto flex flex-col relative overflow-hidden group border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary">
       
       <div className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-6 mb-8 backdrop-blur-xl relative overflow-hidden group/insight mt-2 mx-2 max-w-[98%]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover/insight:shadow-[0_0_15px_currentColor] transition-all" />
          <h4 className="label-sm text-white/50 mb-4 flex items-center gap-2">
             <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             RACE NARRATIVE
          </h4>
          <ul className="space-y-3 font-light text-white/80 text-sm md:text-base leading-relaxed">
             <li>
                <span className="text-primary font-bold mr-2 uppercase">Base Pace:</span> 
                {driverCode} averaged a normative race rhythm holding steady at <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{meanTime.toFixed(2)}s</span>.
             </li>
             {anomalies.length > 0 && (
               <li>
                  <span className="text-red-500 font-bold mr-2 uppercase">Degradation Detected:</span> 
                  Spikes tracking substantial pace-loss ({(anomalies[0].time - meanTime).toFixed(1)}s+ deficit) flagged around lap <span className="font-bold text-red-400 drop-shadow-[0_0_8px_currentColor]">{anomalies[anomalies.length > 1 ? Math.floor(anomalies.length/2) : 0].lap}</span> indicating turbulent air or severe compound fatigue.
               </li>
             )}
          </ul>
       </div>

       <div className="flex justify-between items-end mb-4 px-6 z-20">
          <div>
            <h3 className="label-sm mb-1 text-primary drop-shadow-[0_0_5px_currentColor]">PERFORMANCE TREND MATRIX</h3>
            <p className="text-white/40 text-xs font-light">Race Lap Progression Traces (Seconds)</p>
          </div>
          {hoveredLap && (
             <div className="text-right">
                <span className="label-sm text-primary block">LAP {hoveredLap.lap}</span>
                <span className="font-display text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">{hoveredLap.time.toFixed(3)}s</span>
                <span className={`text-xs ml-3 ${hoveredLap.time > meanTime ? 'text-red-400' : 'text-primary'}`}>
                  {hoveredLap.time > meanTime ? `+${(hoveredLap.time - meanTime).toFixed(2)}s Slower` : `-${(meanTime - hoveredLap.time).toFixed(2)}s Faster`}
                </span>
             </div>
          )}
       </div>

       <div className="flex-1 w-full relative z-10 mt-6 cursor-crosshair overflow-x-auto hide-scrollbar">
         <div className="min-w-[800px] h-[300px] sm:h-[400px] md:h-full relative overflow-visible">
           <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
             {[0, 0.5, 1].map(pct => (
               <line key={`g-${pct}`} x1={paddingX} y1={paddingY + pct * (height - paddingY - paddingB)} x2={width - 40} y2={paddingY + pct * (height - paddingY - paddingB)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
             ))}
             
             {/* AXIS LABELS */}
             <text x={width/2} y={height - 20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">LAP NUMBER PROGRESSION</text>
             <text transform="rotate(-90)" x={-(height/2)} y={20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">TIME ELAPSED (SECONDS)</text>

             <defs>
               <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                 <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
               </linearGradient>
             </defs>
             <path d={fillPathD} fill="url(#glowGradient)" className="transition-all duration-700" />
             <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_10px_var(--primary)] transition-all duration-700" />

             {/* AVERAGE REFERENCE LINE */}
             <line x1={paddingX} y1={getY(meanTime)} x2={width - 40} y2={getY(meanTime)} stroke="rgba(255,200,0,0.35)" strokeWidth="1" strokeDasharray="8 4" vectorEffect="non-scaling-stroke" />
             <text x={width - 38} y={getY(meanTime) - 6} fill="rgba(255,200,0,0.5)" fontSize="9" textAnchor="end" letterSpacing="0.05em">AVG {meanTime.toFixed(1)}s</text>

             {/* FASTEST LAP MARKER */}
             {(() => { const f = dataPoints.reduce((a, b) => a.time < b.time ? a : b); return (
               <g className="pointer-events-none">
                 <polygon points={`${getX(f.lap)},${getY(f.time)-8} ${getX(f.lap)+6},${getY(f.time)} ${getX(f.lap)},${getY(f.time)+8} ${getX(f.lap)-6},${getY(f.time)}`} fill="#00ff88" className="drop-shadow-[0_0_8px_#00ff88]" />
                 <text x={getX(f.lap)} y={getY(f.time)-14} fill="#00ff88" fontSize="9" textAnchor="middle" fontWeight="bold" letterSpacing="0.05em">FASTEST</text>
               </g>
             ); })()}

             {/* SLOWEST LAP MARKER */}
             {(() => { const s = dataPoints.reduce((a, b) => a.time > b.time ? a : b); return (
               <g className="pointer-events-none">
                 <polygon points={`${getX(s.lap)},${getY(s.time)-8} ${getX(s.lap)+6},${getY(s.time)} ${getX(s.lap)},${getY(s.time)+8} ${getX(s.lap)-6},${getY(s.time)}`} fill="#ff4444" className="drop-shadow-[0_0_8px_#ff4444]" />
                 <text x={getX(s.lap)} y={getY(s.time)+22} fill="#ff4444" fontSize="9" textAnchor="middle" fontWeight="bold" letterSpacing="0.05em">SLOWEST</text>
               </g>
             ); })()}

             {/* Outlier Dots */}
             {anomalies.map((a, i) => (
                <circle key={`anom-${i}`} cx={getX(a.lap)} cy={getY(a.time)} r="6" fill="#ff0000" className="shadow-[0_0_15px_#ff0000] drop-shadow-[0_0_10px_#ff0000]" />
             ))}

             {dataPoints.map((d, i) => (
                <circle key={i} cx={getX(d.lap)} cy={getY(d.time)} r="20" fill="transparent" className="outline-none" onMouseEnter={() => setHoveredLap(d)} onMouseLeave={() => setHoveredLap(null)} />
             ))}
             
             {hoveredLap && (
                <g className="pointer-events-none">
                   <line x1={getX(hoveredLap.lap)} y1={getY(hoveredLap.time)} x2={getX(hoveredLap.lap)} y2={height-paddingB} stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" />
                   <circle cx={getX(hoveredLap.lap)} cy={getY(hoveredLap.time)} r="5" fill="var(--primary)" className="shadow-[0_0_15px_var(--primary)] text-primary drop-shadow-[0_0_10px_currentColor]" />
                </g>
             )}
          </svg>
         </div>
       </div>
    </Card>
  );
}

// ---------------------------------------------
// [TAB] TYRE STRATEGY (RACE STRATEGY)
// ---------------------------------------------
function TyresTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/ai-strategy?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()).then(d=>setData(d)).catch(console.error);
  }, [driverCode, year, gp]);

  if (!data) return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" /></Card>;

  const compounds = Object.entries(data.strategy || {});
  return (
    <Card className="min-h-[400px] relative border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]">
      <h3 className="label-sm mb-6 text-white/50">Compound Base Extrapolation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
         {compounds.map(([compound, lapsUsed]) => {
           const type = (compound as string).toUpperCase();
           let color = "bg-white/40";
           if (type === "SOFT") color = "bg-[#FF0000]";
           if (type === "MEDIUM") color = "bg-[#FFFF00]";
           if (type === "HARD") color = "bg-[#FFFFFF]";
           if (type === "INTERMEDIATE") color = "bg-[#00FF00]";
           if (type === "WET") color = "bg-[#0000FF]";

           return (
             <div key={compound} className="flex items-center gap-6 p-6 border border-white/[0.02] rounded-xl bg-black/20 backdrop-blur-3xl group transition-all hover:bg-white/[0.04]">
                <div className={`w-16 h-16 rounded-full border-4 border-black ${color} flex items-center justify-center font-bold text-black drop-shadow-[0_0_15px_currentColor]`}>
                  {type[0]}
                </div>
                <div>
                   <p className="label-sm text-white/50 mb-1">{type}</p>
                   <p className="font-display text-4xl text-white font-bold drop-shadow-md">{lapsUsed as number} <span className="text-xl text-white/30">LAPS</span></p>
                </div>
             </div>
           );
         })}
      </div>
      <div className="mt-12 p-6 border-t border-white/[0.02] relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <p className="text-sm text-white/90 font-light ml-2">
             <span className="text-primary font-bold mr-2 drop-shadow-[0_0_5px_currentColor]">TACTICAL LOG:</span> 
             {data.insight}
          </p>
      </div>
    </Card>
  );
}

// ---------------------------------------------
// [TAB] SECTOR BREAKDOWN
// ---------------------------------------------
function SectorTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/sector-analysis?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()).then(d=>setData(d)).catch(console.error);
  }, [driverCode, year, gp]);

  if (!data) return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" /></Card>;

  const p1: {lap: number, time: number}[] = [];
  const p2: {lap: number, time: number}[] = [];
  const p3: {lap: number, time: number}[] = [];

  data.lap_numbers?.forEach((lap: number, idx: number) => {
     const s1 = data.sector1_sec?.[idx] ?? parseLapTime(data.sector1?.[idx]);
     const s2 = data.sector2_sec?.[idx] ?? parseLapTime(data.sector2?.[idx]);
     const s3 = data.sector3_sec?.[idx] ?? parseLapTime(data.sector3?.[idx]);
     if (s1 && s1 > 0 && s1 < 60) p1.push({ lap, time: s1 });
     if (s2 && s2 > 0 && s2 < 60) p2.push({ lap, time: s2 });
     if (s3 && s3 > 0 && s3 < 60) p3.push({ lap, time: s3 });
  });

  const getPoints = () => [...p1, ...p2, ...p3];
  const minLap = Math.min(...getPoints().map(d=>d.lap)) || 0;
  const maxLap = Math.max(...getPoints().map(d=>d.lap)) || 1;
  const minTime = Math.min(...getPoints().map(d=>d.time)) || 0;
  const maxTime = Math.max(...getPoints().map(d=>d.time)) || 1;

  const getSD = (arr: any[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a: number, b: any) => a + b.time, 0) / arr.length;
    const variance = arr.reduce((a: number, b: any) => a + Math.pow(b.time - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  const sdArray = [
     { name: "Sector 1", val: getSD(p1), color: "text-[#ff9100]", fill: "#ff9100" },
     { name: "Sector 2", val: getSD(p2), color: "text-[#00D2BE]", fill: "#00D2BE" },
     { name: "Sector 3", val: getSD(p3), color: "text-[#ffffff]", fill: "#ffffff" }
  ];
  
  sdArray.sort((a,b) => b.val - a.val);
  const worstSector = sdArray[0];
  const bestSector = sdArray[2];

  const width = 1000, height = 450;

  return (
    <Card className="min-h-[500px] border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary">
       <div className="flex justify-between items-start mb-6">
          <div>
            <span className="label-sm text-primary mb-2 block drop-shadow-[0_0_5px_currentColor]">MICROMETRIC SECTORS</span>
            <div className="flex gap-6 mt-4">
               <div className="flex items-center gap-2 text-xs text-white/50"><div className="w-3 h-3 rounded-full bg-[#ff9100]" /> SECTOR 1</div>
               <div className="flex items-center gap-2 text-xs text-white/50"><div className="w-3 h-3 rounded-full bg-[#00D2BE]" /> SECTOR 2</div>
               <div className="flex items-center gap-2 text-xs text-white/50"><div className="w-3 h-3 rounded-full bg-[#ffffff]" /> SECTOR 3</div>
            </div>
          </div>
       </div>

       <div className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-6 mb-8 backdrop-blur-xl relative overflow-hidden group">
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[${worstSector.fill}] shadow-[0_0_15px_${worstSector.fill}] transition-all`} />
          <h4 className="label-sm text-white/50 mb-4 flex items-center gap-2">
             <svg className={`w-4 h-4 ${worstSector.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             AI INSIGHT SUMMARY
          </h4>
          <ul className="space-y-3 font-light text-white/80 text-sm md:text-base leading-relaxed">
             <li>
                <span className={`${worstSector.color} font-bold mr-2 drop-shadow-[0_0_5px_currentColor]`}>Observation:</span> 
                Inconsistency and micro-hesitations peak in <span className={`font-bold drop-shadow-[0_0_8px_currentColor] ${worstSector.color}`}>{worstSector.name}</span>, measuring an unpredictable <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">±{worstSector.val.toFixed(2)}s</span> volatility window across the race profile.
             </li>
             <li>
                <span className={`${worstSector.color} font-bold mr-2 drop-shadow-[0_0_5px_currentColor]`}>Strategy:</span> 
                Pace extraction should intensely focus on stabilizing <span className={`font-bold ${worstSector.color}`}>{worstSector.name}</span> setups, leveraging the extreme rhythmic consistency already demonstrated natively throughout <span className={`font-bold ${bestSector.color}`}>{bestSector.name}</span>.
             </li>
          </ul>
       </div>

       <div className="w-full overflow-x-auto hide-scrollbar mt-4 relative z-10">
         <div className="min-w-[800px] h-[350px] relative">
           <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
             {[0, 0.5, 1].map(pct => (
               <line key={`g-${pct}`} x1={60} y1={40 + pct * (height - 100)} x2={width - 40} y2={40 + pct * (height - 100)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
             ))}
             <text x={width/2} y={height - 20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">LAP NUMBER (PROGRESSION)</text>
             <text transform="rotate(-90)" x={-(height/2)} y={20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">INTERVAL (SECONDS)</text>

             <path d={generateSmoothPath(p1, width, height, minLap, maxLap, minTime, maxTime)} fill="none" stroke="#ff9100" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_8px_#ff9100]" />
             <path d={generateSmoothPath(p2, width, height, minLap, maxLap, minTime, maxTime)} fill="none" stroke="#00D2BE" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_8px_#00D2BE]" />
             <path d={generateSmoothPath(p3, width, height, minLap, maxLap, minTime, maxTime)} fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_8px_#ffffff]" />
         </svg>
       </div>
    </Card>
  );
}

// ---------------------------------------------
// [TAB] COMPARE
// ---------------------------------------------
function CompareTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [targetRival, setTargetRival] = useState<string>("HAM");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const RIVALS = ["VER", "PER", "HAM", "RUS", "LEC", "SAI", "NOR", "PIA", "ALO", "HUL", "MAG"].filter(r => r !== driverCode);

  useEffect(() => {
     setLoading(true);
     fetch(`${BASE_URL}/compare?year=${year}&gp=${gp}&d1=${driverCode}&d2=${targetRival}`)
      .then(r=>r.json()).then(d=>setData(d)).catch(console.error).finally(()=>setLoading(false));
  }, [driverCode, targetRival, year, gp]);

  const p1: {lap: number, time: number}[] = [];
  const p2: {lap: number, time: number}[] = [];

  if (data?.lap_numbers) {
     data.lap_numbers.forEach((lap: number, idx: number) => {
       const t1 = parseLapTime(data.driver1_times[idx]);
       const t2 = parseLapTime(data.driver2_times[idx]);
       if (t1 && t1 > 0 && t1 < 120) p1.push({ lap, time: t1 });
       if (t2 && t2 > 0 && t2 < 120) p2.push({ lap, time: t2 });
     });
  }

  const pts = [...p1, ...p2];
  const minLap = Math.min(...pts.map(d=>d.lap)) || 0;
  const maxLap = Math.max(...pts.map(d=>d.lap)) || 1;
  const minTime = Math.min(...pts.map(d=>d.time)) || 0;
  const maxTime = Math.max(...pts.map(d=>d.time)) || 1;

  let wins1 = 0, wins2 = 0;
  for(let i=0; i<Math.min(p1.length, p2.length); i++) {
     if (p1[i].time < p2[i].time) wins1++;
     else wins2++;
  }

  const width = 1000, height = 450;

  return (
    <Card className="min-h-[500px] border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary">
       <div className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-6 mb-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:shadow-[0_0_15px_currentColor] transition-all" />
          <h4 className="label-sm text-white/50 mb-4 flex items-center gap-2">
             <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             BATTLE SUMMARY
          </h4>
          <ul className="space-y-3 font-light text-white/80 text-sm md:text-base leading-relaxed">
             {!loading && (
               <li>
                  <span className="text-primary font-bold mr-2 uppercase">Head-To-Head Result:</span> 
                  Across directly measurable track distances, <span className="font-bold text-white drop-shadow-[0_0_8px_currentColor]">{driverCode}</span> outperformed <span className="font-bold text-white/50">{targetRival}</span> on <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{wins1}</span> active laps against the rival's {wins2} laps.
               </li>
             )}
          </ul>
       </div>

       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-white/[0.05] pb-8">
          <div>
            <h3 className="label-sm text-primary mb-2 drop-shadow-[0_0_5px_currentColor]">H2H COMPARISON TRACE</h3>
            <div className="flex items-center gap-4 text-xs font-bold font-display">
               <span className="text-primary text-xl drop-shadow-[0_0_8px_currentColor]">{driverCode}</span>
               <span className="text-white/20">VS</span>
               <span className="text-white drop-shadow-[0_0_8px_currentColor] text-xl">{targetRival}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap max-w-sm justify-end">
             {RIVALS.map(r => (
               <button 
                 key={r}
                 onClick={() => setTargetRival(r)}
                 className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${targetRival === r ? 'text-primary shadow-[0_0_15px_rgba(79,245,223,0.3)] bg-primary/10' : 'text-white/50 hover:bg-white/5'}`}
               >
                 {r}
               </button>
             ))}
          </div>
       </div>

       {loading ? (
         <div className="w-full h-[300px] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" /></div>
       ) : (
         <div className="w-full overflow-x-auto hide-scrollbar mt-8 relative z-10">
           <div className="min-w-[800px] h-[350px] relative">
             <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 450" preserveAspectRatio="none">
               {[0, 0.5, 1].map(pct => (
                 <line key={`g-${pct}`} x1={60} y1={40 + pct * (height - 100)} x2={width - 40} y2={40 + pct * (height - 100)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
               ))}
               <text x={width/2} y={height - 20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">DIFFERENTIAL LAP NUMBER</text>
               <text transform="rotate(-90)" x={-(height/2)} y={20} fill="rgba(255,255,255,0.3)" textAnchor="middle" fontSize="12" letterSpacing="0.08em">BASE TIME (SECONDS)</text>

               <path d={generateSmoothPath(p1, width, height, minLap, maxLap, minTime, maxTime)} fill="none" stroke="var(--primary)" strokeWidth="3" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_10px_var(--primary)]" />
               <path d={generateSmoothPath(p2, width, height, minLap, maxLap, minTime, maxTime)} fill="none" stroke="#FFFFFF" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="6 6" className="drop-shadow-[0_0_8px_#ffffff] opacity-70" />
             </svg>
           </div>
         </div>
       )}
    </Card>
  );
}

function formatRawLapTime(str: string) {
  if (!str) return "--";
  const parts = str.split('0 days ');
  const val = parts.length > 1 ? parts[1] : str;
  return val.replace('00:', '');
}

// ---------------------------------------------
// [TAB] LAP DATA TABLE (EXCEL-STYLE)
// ---------------------------------------------
function LapTableTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [data, setData] = useState<any>(null);
  const [sortCol, setSortCol] = useState<string>('lap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/lap-table?year=${year}&gp=${gp}&driver=${driverCode}`)
      .then(r => r.json()).then(d => setData(d)).catch(console.error).finally(() => setLoading(false));
  }, [driverCode, year, gp]);

  if (loading) return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><div className="w-10 h-10 rounded-full border-t-2 border-primary animate-spin" /></Card>;
  if (!data?.laps?.length) return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><span className="text-white/40">No lap data available.</span></Card>;

  const laps = data.laps as any[];
  const validTimes = laps.map((l: any) => l.lap_time_sec).filter((t: any) => t != null && t > 0 && t < 200);
  const bestTime = Math.min(...validTimes);
  const worstTime = Math.max(...validTimes);
  const avgTime = validTimes.reduce((a: number, b: number) => a + b, 0) / validTimes.length;

  const sectorMins = {
    s1: Math.min(...laps.map((l: any) => l.sector1_sec).filter((v: any) => v != null && v > 0)),
    s2: Math.min(...laps.map((l: any) => l.sector2_sec).filter((v: any) => v != null && v > 0)),
    s3: Math.min(...laps.map((l: any) => l.sector3_sec).filter((v: any) => v != null && v > 0)),
  };
  const sectorMaxs = {
    s1: Math.max(...laps.map((l: any) => l.sector1_sec).filter((v: any) => v != null && v > 0 && v < 60)),
    s2: Math.max(...laps.map((l: any) => l.sector2_sec).filter((v: any) => v != null && v > 0 && v < 60)),
    s3: Math.max(...laps.map((l: any) => l.sector3_sec).filter((v: any) => v != null && v > 0 && v < 60)),
  };

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sorted = [...laps].sort((a: any, b: any) => {
    const av = a[sortCol] ?? 999, bv = b[sortCol] ?? 999;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const sectorColor = (val: number | null, min: number, max: number) => {
    if (val == null || val <= 0) return '';
    if (val === min) return 'text-primary font-bold drop-shadow-[0_0_5px_currentColor]';
    if (val === max) return 'text-red-400 font-bold';
    const ratio = (val - min) / (max - min || 1);
    if (ratio < 0.25) return 'text-green-400';
    if (ratio > 0.75) return 'text-orange-400';
    return 'text-white/70';
  };

  const COLS = [
    { key: 'lap', label: 'LAP', w: 'w-16' },
    { key: 'lap_time_sec', label: 'LAP TIME', w: 'w-28' },
    { key: 'sector1_sec', label: 'S1', w: 'w-24' },
    { key: 'sector2_sec', label: 'S2', w: 'w-24' },
    { key: 'sector3_sec', label: 'S3', w: 'w-24' },
    { key: 'compound', label: 'TYRE', w: 'w-20' },
    { key: 'delta', label: 'Δ BEST', w: 'w-24' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* INSIGHT */}
      <div className="w-full bg-black/40 border border-white/[0.05] rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_currentColor]" />
        <h4 className="label-sm text-white/50 mb-3">TABLE GUIDE</h4>
        <p className="text-sm text-white/60 font-light leading-relaxed">
          <span className="text-primary font-bold">Green</span> = near fastest, <span className="text-red-400 font-bold">Red</span> = near slowest, <span className="text-orange-400 font-bold">Orange</span> = above average.
          Click any column header to sort. Δ BEST shows the gap to the fastest lap of the race.
        </p>
      </div>

      <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02] overflow-x-auto hide-scrollbar p-0">
        <div className="w-full min-w-[750px] p-6">
          <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {COLS.map(c => (
                <th key={c.key} onClick={() => c.key !== 'compound' && toggleSort(c.key)}
                  className={`px-4 py-4 label-sm text-white/40 cursor-pointer hover:text-white/70 transition-colors select-none ${c.w} ${sortCol === c.key ? 'text-primary' : ''}`}>
                  {c.label} {sortCol === c.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((lap: any) => {
              const isBest = lap.lap_time_sec === bestTime;
              const isWorst = lap.lap_time_sec === worstTime;
              const delta = lap.lap_time_sec != null && bestTime ? (lap.lap_time_sec - bestTime) : null;

              return (
                <tr key={lap.lap}
                  className={`border-b border-white/[0.02] transition-colors hover:bg-white/[0.03] ${isBest ? 'bg-primary/5' : isWorst ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 font-display font-bold text-white/80">{lap.lap}</td>
                  <td className={`px-4 py-3 font-mono ${isBest ? 'text-primary font-bold drop-shadow-[0_0_8px_currentColor]' : isWorst ? 'text-red-400 font-bold' : 'text-white/70'}`}>
                    {lap.lap_time_sec != null ? `${lap.lap_time_sec.toFixed(3)}s` : '—'}
                  </td>
                  <td className={`px-4 py-3 font-mono ${sectorColor(lap.sector1_sec, sectorMins.s1, sectorMaxs.s1)}`}>
                    {lap.sector1_sec != null ? `${lap.sector1_sec.toFixed(3)}` : '—'}
                  </td>
                  <td className={`px-4 py-3 font-mono ${sectorColor(lap.sector2_sec, sectorMins.s2, sectorMaxs.s2)}`}>
                    {lap.sector2_sec != null ? `${lap.sector2_sec.toFixed(3)}` : '—'}
                  </td>
                  <td className={`px-4 py-3 font-mono ${sectorColor(lap.sector3_sec, sectorMins.s3, sectorMaxs.s3)}`}>
                    {lap.sector3_sec != null ? `${lap.sector3_sec.toFixed(3)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <TyreBadge compound={lap.compound} />
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${delta != null && delta < 0.5 ? 'text-green-400' : delta != null && delta > 3 ? 'text-red-400' : 'text-white/50'}`}>
                    {delta != null ? `+${delta.toFixed(3)}s` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </Card>

      <div className="flex gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold px-2">
        <span>{laps.length} laps recorded</span>
        <span>•</span>
        <span>Best: {bestTime.toFixed(3)}s</span>
        <span>•</span>
        <span>Avg: {avgTime.toFixed(3)}s</span>
        <span>•</span>
        <span>Worst: {worstTime.toFixed(3)}s</span>
      </div>
    </div>
  );
}

function TyreBadge({ compound }: { compound: string }) {
  const type = (compound || '').toUpperCase();
  const colors: Record<string, string> = {
    SOFT: 'bg-red-500 text-white', MEDIUM: 'bg-yellow-400 text-black',
    HARD: 'bg-white text-black', INTERMEDIATE: 'bg-green-500 text-black',
    WET: 'bg-blue-500 text-white'
  };
  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold ${colors[type] || 'bg-white/10 text-white/50'}`}>
      {type[0] || '?'}
    </span>
  );
}

// ---------------------------------------------
// [TAB] COMPARISON TABLE (HEAD-TO-HEAD)
// ---------------------------------------------
function ComparisonTableTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [rival, setRival] = useState<string>('HAM');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const RIVALS = ['VER', 'PER', 'HAM', 'RUS', 'LEC', 'SAI', 'NOR', 'PIA', 'ALO', 'HUL', 'MAG'].filter(r => r !== driverCode);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/driver-comparison-table?year=${year}&gp=${gp}&d1=${driverCode}&d2=${rival}`)
      .then(r => r.json()).then(d => setData(d)).catch(console.error).finally(() => setLoading(false));
  }, [driverCode, rival, year, gp]);

  const rows = (data?.comparison || []) as any[];

  let d1wins = 0, d2wins = 0;
  rows.forEach((r: any) => {
    if (r.delta != null) { r.delta < 0 ? d1wins++ : d2wins++; }
  });

  return (
    <div className="flex flex-col gap-6">
      {/* RIVAL SELECTOR */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h3 className="label-sm text-primary mb-1 drop-shadow-[0_0_5px_currentColor]">HEAD-TO-HEAD TABLE</h3>
          <div className="flex items-center gap-3 text-sm font-display font-bold">
            <span className="text-primary text-2xl">{driverCode}</span>
            <span className="text-white/20">VS</span>
            <span className="text-white text-2xl">{rival}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {RIVALS.map(r => (
            <button key={r} onClick={() => setRival(r)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${rival === r ? 'text-primary shadow-[0_0_15px_rgba(79,245,223,0.3)] bg-primary/10' : 'text-white/50 hover:bg-white/5'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* BATTLE SUMMARY */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{driverCode} WINS</p>
            <p className="font-display text-3xl font-bold text-primary drop-shadow-[0_0_8px_currentColor]">{d1wins}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">LAPS COMPARED</p>
            <p className="font-display text-3xl font-bold text-white">{rows.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{rival} WINS</p>
            <p className="font-display text-3xl font-bold text-white/70">{d2wins}</p>
          </div>
        </div>
      )}

      {loading ? (
        <Card className="min-h-[300px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]">
          <div className="w-10 h-10 rounded-full border-t-2 border-primary animate-spin" />
        </Card>
      ) : (
        <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02] overflow-x-auto hide-scrollbar p-0">
          <div className="w-full min-w-[700px] p-6">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-4 py-4 label-sm text-white/40 w-14">LAP</th>
                <th className="px-4 py-4 label-sm text-primary w-28">{driverCode}</th>
                <th className="px-4 py-4 label-sm text-white/60 w-28">{rival}</th>
                <th className="px-4 py-4 label-sm text-white/40 w-24">DELTA</th>
                <th className="px-4 py-4 label-sm text-white/40 w-16">S1 Δ</th>
                <th className="px-4 py-4 label-sm text-white/40 w-16">S2 Δ</th>
                <th className="px-4 py-4 label-sm text-white/40 w-16">S3 Δ</th>
                <th className="px-4 py-4 label-sm text-white/40 w-20">TYRES</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const d1Faster = r.delta != null && r.delta < 0;
                const s1d = r.d1_sector1_sec != null && r.d2_sector1_sec != null ? r.d1_sector1_sec - r.d2_sector1_sec : null;
                const s2d = r.d1_sector2_sec != null && r.d2_sector2_sec != null ? r.d1_sector2_sec - r.d2_sector2_sec : null;
                const s3d = r.d1_sector3_sec != null && r.d2_sector3_sec != null ? r.d1_sector3_sec - r.d2_sector3_sec : null;

                return (
                  <tr key={r.lap} className={`border-b border-white/[0.02] transition-colors hover:bg-white/[0.03] ${d1Faster ? 'bg-primary/[0.02]' : ''}`}>
                    <td className="px-4 py-3 font-display font-bold text-white/80">{r.lap}</td>
                    <td className={`px-4 py-3 font-mono ${d1Faster ? 'text-primary font-bold' : 'text-white/70'}`}>
                      {r.d1_lap_time_sec != null ? `${r.d1_lap_time_sec.toFixed(3)}s` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-mono ${!d1Faster && r.delta != null ? 'text-white font-bold' : 'text-white/70'}`}>
                      {r.d2_lap_time_sec != null ? `${r.d2_lap_time_sec.toFixed(3)}s` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-mono font-bold text-xs ${r.delta != null ? (r.delta < 0 ? 'text-primary' : 'text-red-400') : 'text-white/30'}`}>
                      {r.delta != null ? `${r.delta > 0 ? '+' : ''}${r.delta.toFixed(3)}s` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${s1d != null ? (s1d < 0 ? 'text-green-400' : 'text-red-400') : 'text-white/20'}`}>
                      {s1d != null ? `${s1d > 0 ? '+' : ''}${s1d.toFixed(2)}` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${s2d != null ? (s2d < 0 ? 'text-green-400' : 'text-red-400') : 'text-white/20'}`}>
                      {s2d != null ? `${s2d > 0 ? '+' : ''}${s2d.toFixed(2)}` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-mono text-xs ${s3d != null ? (s3d < 0 ? 'text-green-400' : 'text-red-400') : 'text-white/20'}`}>
                      {s3d != null ? `${s3d > 0 ? '+' : ''}${s3d.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <TyreBadge compound={r.d1_compound} />
                      <span className="text-white/20 text-[10px]">vs</span>
                      <TyreBadge compound={r.d2_compound} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------
// [TAB] STATISTICS & PREDICTION (NEW)
// ---------------------------------------------
function StatsTab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [level, setLevel] = useState<'basic' | 'technical' | 'analytical'>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/stats?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()),
      fetch(`${BASE_URL}/predict?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()),
    ]).then(([s, p]) => { setStats(s); setPrediction(p); })
      .catch(console.error).finally(() => setLoading(false));
  }, [driverCode, year, gp]);

  if (loading) return <Card className="min-h-[500px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><div className="w-10 h-10 rounded-full border-t-2 border-primary animate-spin" /></Card>;
  if (!stats || stats.error) return <Card className="min-h-[400px] flex items-center justify-center border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]"><span className="text-white/40 font-light">Insufficient data for statistical analysis.</span></Card>;

  const LEVELS = ['basic', 'technical', 'analytical'] as const;
  const insightKey = `insight_${level}` as string;

  return (
    <div className="flex flex-col gap-8">
      {/* INSIGHT LEVEL TOGGLE */}
      <div className="flex gap-3">
        {LEVELS.map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${level === l ? 'bg-primary/15 text-primary shadow-[0_0_15px_currentColor]' : 'text-white/40 hover:bg-white/5'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* INSIGHT CARD */}
      <div className="w-full bg-black/40 border border-white/[0.05] rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_currentColor]" />
        <h4 className="label-sm text-white/50 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          {level.toUpperCase()} ANALYSIS
        </h4>
        <p className="text-white/80 text-sm md:text-base font-light leading-relaxed">{stats[insightKey]}</p>
      </div>

      {/* METRICS GRID */}
      <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]">
        <h3 className="label-sm text-white/50 mb-8">STATISTICAL METRICS</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <MetricCard label="MEAN" value={`${stats.mean}s`} />
          <MetricCard label="MEDIAN" value={`${stats.median}s`} />
          <MetricCard label="STD DEV" value={`±${stats.std_dev}s`} sub="Variability" />
          <MetricCard label="BEST LAP" value={`${stats.best}s`} highlight />
          <MetricCard label="WORST LAP" value={`${stats.worst}s`} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/[0.03]">
          <MetricCard label="CONSISTENCY" value={`${stats.consistency_score}/100`} sub={stats.consistency_score > 70 ? "High" : stats.consistency_score > 40 ? "Moderate" : "Low"} highlight={stats.consistency_score > 70} />
          <MetricCard label="DEGRADATION" value={`${stats.degradation_sec > 0 ? '+' : ''}${stats.degradation_sec}s`} sub="First→Last stint" />
          <MetricCard label="ANOMALIES" value={stats.anomaly_count} sub={`Laps > 2σ threshold`} />
        </div>

        {/* SECTOR AVERAGES */}
        {stats.sector_averages && (
          <div className="mt-8 pt-8 border-t border-white/[0.03]">
            <h4 className="label-sm text-white/40 mb-6">SECTOR AVERAGES</h4>
            <div className="grid grid-cols-3 gap-6">
              <MetricCard label="SECTOR 1" value={`${stats.sector_averages.s1}s`} sub={stats.sector_std?.s1 ? `±${stats.sector_std.s1}s` : undefined} />
              <MetricCard label="SECTOR 2" value={`${stats.sector_averages.s2}s`} sub={stats.sector_std?.s2 ? `±${stats.sector_std.s2}s` : undefined} />
              <MetricCard label="SECTOR 3" value={`${stats.sector_averages.s3}s`} sub={stats.sector_std?.s3 ? `±${stats.sector_std.s3}s` : undefined} />
            </div>
          </div>
        )}
      </Card>

      {/* ANOMALIES LIST */}
      {stats.anomalies && stats.anomalies.length > 0 && (
        <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]">
          <h3 className="label-sm text-white/50 mb-6">ANOMALY REPORT</h3>
          <p className="text-xs text-white/30 mb-6 font-light">Laps where time exceeded the 2σ threshold ({(stats.mean + 2 * stats.std_dev).toFixed(2)}s). Likely caused by pit stops, traffic, or track conditions.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.anomalies.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff0000]" />
                <div>
                  <span className="font-display font-bold text-white text-lg">Lap {a.lap}</span>
                  <span className="text-white/40 text-xs ml-3">{a.time}s</span>
                  <span className="text-red-400 text-xs ml-2">+{a.delta}s off mean</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* PREDICTION PANEL */}
      {prediction && !prediction.error && (
        <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary">
          <h3 className="label-sm text-white/50 mb-8 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            PREDICTIVE ENGINE (LINEAR REGRESSION)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <MetricCard label="PREDICTED NEXT LAP" value={`${prediction.predicted_time}s`} sub={`Lap ${prediction.next_lap_number}`} highlight />
            <MetricCard label="THEORETICAL OPTIMAL" value={`${prediction.optimal_lap}s`} sub="Best sectors combined" highlight />
            <MetricCard label="RECENT PACE (5 LAP)" value={`${prediction.recent_average}s`} />
            <MetricCard label="TREND" value={prediction.trend.toUpperCase()} sub={`${Math.abs(prediction.slope_per_lap * 1000).toFixed(1)}ms/lap`} highlight={prediction.trend === 'improving'} />
          </div>
          <div className="p-5 bg-black/30 rounded-xl border border-white/[0.03]">
            <p className="text-sm text-white/70 font-light leading-relaxed">{prediction.insight}</p>
          </div>
          <div className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.02]">
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
              REGRESSION: y = {prediction.regression_coefficients?.slope}x + {prediction.regression_coefficients?.intercept} | R² model for ML training pipeline
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }: { label: string, value: string | number, sub?: string, highlight?: boolean }) {
  return (
    <div className="p-5 rounded-xl bg-black/20 border border-white/[0.03] transition-all hover:bg-white/[0.03]">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-bold">{label}</p>
      <p className={`font-display text-2xl md:text-3xl font-bold tracking-tighter ${highlight ? 'text-primary drop-shadow-[0_0_8px_currentColor]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------
// [TAB] AI INSIGHTS (MULTI-LEVEL)
// ---------------------------------------------
function AITab({ driverCode }: { driverCode: string }) {
  const { year, gp } = useSession();
  const [insight, setInsight] = useState<any>(null);
  const [sectorDeep, setSectorDeep] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const [ai, deep] = await Promise.all([
        fetch(`${BASE_URL}/ai-insight?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()),
        fetch(`${BASE_URL}/sector-deep?year=${year}&gp=${gp}&driver=${driverCode}`).then(r=>r.json()),
      ]);
      setInsight(ai);
      setSectorDeep(deep);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center border-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-white/[0.02]" signalColor="bg-primary">
       <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary shadow-[0_0_15px_currentColor] animate-pulse" />
       
       {!insight && !loading && (
          <div className="text-center z-10 flex flex-col items-center p-8">
            <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-6 shadow-[inset_0_0_30px_rgba(79,245,223,0.1)]">
               <svg className="w-6 h-6 text-primary drop-shadow-[0_0_8px_currentColor]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <h3 className="font-display text-4xl font-bold text-white mb-2 tracking-tighter drop-shadow-md">AI VECTOR ENGINE</h3>
            <p className="text-white/40 font-light mb-8 max-w-sm">
               Generate comprehensive insights combining race analysis, sector breakdown, and performance predictions.
            </p>
            <button onClick={fetchInsight} className="text-xs uppercase tracking-widest font-bold text-surface-low bg-primary px-8 py-4 rounded-full shadow-[0_0_20px_var(--primary)] hover:brightness-125 transition-all outline-none border-none">
               GENERATE INSIGHT
            </button>
          </div>
       )}

       {loading && (
          <div className="flex flex-col items-center z-10">
             <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin shadow-[0_0_15px_currentColor] mb-6" />
             <span className="label-sm text-primary animate-pulse text-xs tracking-[0.3em] drop-shadow-[0_0_5px_currentColor]">SYNTHESIZING...</span>
          </div>
       )}

       {insight && !loading && (
          <div className="w-full h-full p-8 md:p-12 flex flex-col justify-center z-10">
             <h3 className="label-sm mb-6 text-white/50">// INTELLIGENCE OUTPUT</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-white/[0.05] pb-8 mb-8">
                <div>
                   <p className="label-sm text-white/40 mb-2">BEST LAP</p>
                   <p className="font-display text-4xl font-bold text-primary drop-shadow-[0_0_15px_currentColor] tracking-tighter">
                      {insight.best_lap_sec ? `${insight.best_lap_sec.toFixed(3)}s` : formatRawLapTime(insight.best_lap)}
                   </p>
                </div>
                <div>
                   <p className="label-sm text-white/40 mb-2">AVERAGE LAP</p>
                   <p className="font-display text-4xl font-bold text-white drop-shadow-md tracking-tighter">
                      {insight.average_lap_sec ? `${insight.average_lap_sec.toFixed(3)}s` : formatRawLapTime(insight.average_lap)}
                   </p>
                </div>
                <div>
                   <p className="label-sm text-white/40 mb-2">STD DEVIATION</p>
                   <p className="font-display text-4xl font-bold text-white/60 tracking-tighter">
                      ±{insight.std_dev || '—'}s
                   </p>
                </div>
             </div>

             {/* INSIGHT TEXT */}
             <div className="relative pl-8 bg-white/[0.01] p-6 rounded-xl border border-white/[0.02] mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-transparent shadow-[0_0_10px_currentColor]" />
                <p className="font-display text-2xl lg:text-3xl font-bold text-white/90 leading-snug tracking-tight mb-4">
                  <span className="text-primary drop-shadow-[0_0_8px_currentColor]">{driverCode}</span> {insight.summary?.replace(driverCode + " completed ", "completed ")}
                </p>
                <p className="text-base font-light text-white/60 leading-relaxed max-w-3xl">
                  {insight.insight}
                </p>
             </div>

             {/* SECTOR DEEP INSIGHTS */}
             {sectorDeep && !sectorDeep.error && (
               <div className="space-y-4">
                 <h4 className="label-sm text-white/40">SECTOR DEEP ANALYSIS</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {['sector1', 'sector2', 'sector3'].map((key, i) => {
                     const s = sectorDeep[key];
                     if (!s) return null;
                     const colors = ['#ff9100', '#00D2BE', '#ffffff'];
                     return (
                       <div key={key} className="p-5 rounded-xl bg-black/20 border border-white/[0.03]">
                         <div className="flex items-center gap-2 mb-3">
                           <div className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                           <span className="label-sm text-white/50">SECTOR {i + 1}</span>
                         </div>
                         <p className="font-display text-2xl font-bold text-white mb-1">{s.mean}s <span className="text-xs text-white/30 font-light">avg</span></p>
                         <p className="text-xs text-white/30">Best: {s.best}s (Lap {s.best_lap}) • Worst: {s.worst}s (Lap {s.worst_lap})</p>
                         {s.spike_count > 0 && <p className="text-xs text-red-400 mt-1">{s.spike_count} anomalous spike{s.spike_count > 1 ? 's' : ''} detected</p>}
                       </div>
                     );
                   })}
                 </div>
                 <div className="p-5 bg-black/30 rounded-xl border border-white/[0.03] mt-4">
                   <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-bold">Weakest: {sectorDeep.weakest_sector} • Strongest: {sectorDeep.strongest_sector}</p>
                   <p className="text-sm text-white/70 font-light leading-relaxed">{sectorDeep.insight_basic}</p>
                 </div>
               </div>
             )}
          </div>
       )}
    </Card>
  );
}

