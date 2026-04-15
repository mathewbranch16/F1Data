"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SessionContextType = {
  year: number;
  setYear: (y: number) => void;
  gp: string;
  setGp: (g: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState(2023);
  const [gp, setGp] = useState("Monaco");

  return (
    <SessionContext.Provider value={{ year, setYear, gp, setGp }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
