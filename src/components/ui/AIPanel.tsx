import React from 'react';
import { Card } from './Card';

export function AIPanel() {
  return (
    <Card className="h-full flex flex-col justify-between" signalColor="bg-primary">
      <div className="flex justify-between items-center mb-6 border-b border-primary/20 pb-4 relative">
         <div className="absolute bottom-[-1px] left-0 w-1/3 h-[1px] bg-gradient-to-r from-primary to-transparent" />
         <div>
           <h3 className="label-sm text-primary mb-1 drop-shadow-[0_0_5px_rgba(79,245,223,0.5)]">RACE ENGINEER AI</h3>
           <p className="font-display font-bold text-xl tracking-tighter text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">GP-NET // ONLINE</p>
         </div>
         <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(79,245,223,1)] animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2">
         {/* User message */}
         <div className="self-end max-w-[85%]">
            <div className="bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl p-4 rounded-l-2xl rounded-tr-2xl group transition-all hover:bg-white/[0.06]">
               <p className="text-sm font-light text-white/90">Analyze VER's gap to Norris over the last 5 laps.</p>
            </div>
            <p className="text-[10px] text-white/30 text-right mt-2 font-mono uppercase tracking-widest">User // 14:02:11</p>
         </div>

         {/* AI message */}
         <div className="self-start max-w-[90%]">
            <div className="bg-primary/[0.08] border border-primary/30 shadow-[0_0_20px_rgba(79,245,223,0.1),inset_0_1px_5px_rgba(255,255,255,0.1)] backdrop-blur-3xl p-5 rounded-r-2xl rounded-tl-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent pointer-events-none" />
               <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-primary opacity-90 rounded-l-2xl shadow-[0_0_15px_rgba(79,245,223,1)]" />
               <p className="text-sm text-white font-light leading-relaxed mb-4 relative z-10">
                 <span className="font-bold text-team-blue drop-shadow-[0_0_5px_currentColor]">VER</span> is dropping an average of <span className="font-bold text-team-red drop-shadow-[0_0_5px_currentColor]">0.15s</span> per lap due to <span className="text-white font-medium">rear-left thermal degradation</span>. 
                 <br/><br/>
                 At current pace, <span className="font-bold text-team-orange drop-shadow-[0_0_5px_currentColor]">NOR</span> will reach DRS range in <span className="font-display text-lg text-primary tracking-tight font-bold drop-shadow-[0_0_8px_currentColor]">4.2 LAPS</span>.
               </p>
               <div className="flex gap-3 relative z-10">
                 <button className="text-[10px] uppercase font-bold text-surface-low border border-primary px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-container hover:brightness-125 transition-all shadow-[0_0_15px_rgba(79,245,223,0.3)]">Generate Strat</button>
                 <button className="text-[10px] uppercase font-bold text-white border border-white/20 px-3 py-1.5 rounded-md hover:bg-white/10 transition-all backdrop-blur-md">View Trace</button>
               </div>
            </div>
            <p className="text-[10px] text-white/30 text-left mt-2 font-mono uppercase tracking-widest">GP-NET // 14:02:14</p>
         </div>
      </div>

      <div className="mt-8 relative group">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent group-focus-within:via-primary transition-all duration-500 shadow-[0_0_10px_rgba(79,245,223,0.)] group-focus-within:shadow-[0_0_20px_rgba(79,245,223,0.5)]" />
        <input 
          type="text" 
          placeholder="Query network..." 
          className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl focus:border-primary/50 focus:bg-primary/[0.02] py-4 pl-4 pr-12 text-sm font-light text-white outline-none transition-all placeholder:text-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]"
        />
        <svg className="w-5 h-5 absolute right-4 top-[18px] text-primary drop-shadow-[0_0_5px_currentColor]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Card>
  );
}
