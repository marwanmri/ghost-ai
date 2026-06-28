"use client";

import React, { createContext, useContext, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface CanvasAutosaveContextType {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
  triggerManualSave: (() => Promise<void>) | null;
  setTriggerManualSave: React.Dispatch<React.SetStateAction<(() => Promise<void>) | null>>;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

const CanvasAutosaveContext = createContext<CanvasAutosaveContextType | undefined>(undefined);

export function CanvasAutosaveProvider({
  children,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [triggerManualSave, setTriggerManualSave] = useState<(() => Promise<void>) | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  return (
    <CanvasAutosaveContext.Provider
      value={{
        status,
        setStatus,
        triggerManualSave,
        setTriggerManualSave,
        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </CanvasAutosaveContext.Provider>
  );
}

export function useCanvasAutosaveContext() {
  return useContext(CanvasAutosaveContext);
}
