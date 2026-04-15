"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionControls } from "./SessionControls";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center bg-black/60 backdrop-blur-2xl border-b border-white/[0.03] transition-all duration-500">
        <div className="container mx-auto px-4 md:px-6 h-full flex justify-between items-center">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-xl md:text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:text-primary transition-colors flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
              KINETIC
            </div>
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:block">
              {!isLanding && <SessionControls />}
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex gap-8">
              {isLanding ? (
                <Link href="/dashboard" className="label-sm text-primary hover:text-white transition-colors relative group font-bold">
                  START ANALYSIS
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left shadow-[0_0_10px_currentColor]" />
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className="label-sm text-white/70 hover:text-white transition-colors relative group">
                    DASHBOARD
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left shadow-[0_0_10px_currentColor]" />
                  </Link>
                  <Link href="/race" className="label-sm text-white/70 hover:text-white transition-colors relative group">
                    CALENDAR
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left shadow-[0_0_10px_currentColor]" />
                  </Link>
                  <Link href="/analysis" className="label-sm text-white/70 hover:text-white transition-colors relative group">
                    COMPARE
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left shadow-[0_0_10px_currentColor]" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Burger Button */}
            <button 
              className="md:hidden text-white/70 hover:text-white p-2 flex flex-col gap-1.5 z-[60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div className={`fixed inset-0 z-[45] bg-[#0e0e0e]/95 backdrop-blur-xl transition-all duration-500 md:hidden flex flex-col items-center justify-center p-6 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="flex flex-col gap-8 text-center items-center w-full max-w-xs">
            {!isLanding && (
               <div className="mb-8 w-full scale-125 origin-center text-center flex justify-center">
                 <SessionControls />
               </div>
            )}
            {isLanding ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-3xl text-primary drop-shadow-[0_0_15px_currentColor]">
                START ANALYSIS
              </Link>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="font-display font-medium text-2xl text-white/70 hover:text-white transition-colors">
                  DASHBOARD
                </Link>
                <Link href="/race" onClick={() => setMobileMenuOpen(false)} className="font-display font-medium text-2xl text-white/70 hover:text-white transition-colors">
                  CALENDAR
                </Link>
                <Link href="/analysis" onClick={() => setMobileMenuOpen(false)} className="font-display font-medium text-2xl text-white/70 hover:text-white transition-colors">
                  COMPARE
                </Link>
              </>
            )}
         </div>
      </div>
    </>
  );
}
