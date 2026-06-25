"use client";

import React, { createContext, useContext, useState } from "react";

interface StarterTemplatesContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const StarterTemplatesContext = createContext<StarterTemplatesContextType | undefined>(undefined);

export function StarterTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <StarterTemplatesContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </StarterTemplatesContext.Provider>
  );
}

export function useStarterTemplates() {
  const context = useContext(StarterTemplatesContext);
  if (context === undefined) {
    throw new Error("useStarterTemplates must be used within a StarterTemplatesProvider");
  }
  return context;
}
