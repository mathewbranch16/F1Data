"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionControls } from "./SessionControls";

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center bg-black/60 backdrop-blur-2xl border-b border-white/[0.03] transition-all duration-500">
      <div className="container mx-auto px-6 h-full flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:text-primary transition-colors flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
            KINETIC
          </div>
        </Link>
        <div className="flex items-center gap-8">
          {!isLanding && <SessionControls />}
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
        </div>
      </div>
    </nav>
  );
}
