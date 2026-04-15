import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  signalColor?: string;
  glowOnHover?: boolean;
}

export function Card({ children, className = '', signalColor, glowOnHover = true, ...props }: CardProps) {
  return (
    <div 
      className={`relative rounded-2xl bg-white/[0.015] backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-6 transition-all duration-700 overflow-hidden ${glowOnHover ? 'hover:shadow-[0_0_40px_var(--primary)] hover:bg-white/[0.03] hover:-translate-y-2' : ''} transform-gpu border-none ${className}`} 
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none transition-opacity duration-700" />
      {signalColor && (
        <div className={`absolute top-0 bottom-0 left-0 w-[2px] ${signalColor} opacity-100 shadow-[0_0_20px_currentColor] transition-colors duration-700`} />
      )}
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </div>
  );
}
