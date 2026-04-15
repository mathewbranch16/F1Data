"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEAM_COLORS, TeamId } from '@/lib/team-colors';

interface ThemeContextProps {
  activeTeam: TeamId;
  setActiveTeam: (team: TeamId) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  activeTeam: 'default',
  setActiveTeam: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<TeamId>('default');

  useEffect(() => {
    const color = TEAM_COLORS[activeTeam] || TEAM_COLORS.default;
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty(
      'transition',
      'color 0.6s cubic-bezier(0.16,1,0.3,1), background-color 0.6s cubic-bezier(0.16,1,0.3,1)'
    );
  }, [activeTeam]);

  return (
    <ThemeContext.Provider value={{ activeTeam, setActiveTeam }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Lightweight hook component to mount on Server Routes
export function ThemeSetter({ teamId }: { teamId: TeamId }) {
  const { setActiveTeam } = useTheme();
  
  useEffect(() => {
    setActiveTeam(teamId);
    return () => setActiveTeam('default'); // Reset on unmount
  }, [teamId, setActiveTeam]);
  
  return null;
}
