"use client";

import React from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-default bg-surface px-4 select-none shrink-0 z-40">
      {/* Left section: sidebar toggle button */}
      <div className="flex items-center gap-3 flex-1 justify-start">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          className="hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors"
          aria-label={
            isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"
          }
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Center section: Logo / title */}
      <div className="flex items-center justify-center flex-1">
        <span className="font-sans font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 select-none">
          GHOST AI
        </span>
      </div>

      {/* Right section: stays empty for now */}
      <div className="flex items-center justify-end flex-1" />
    </header>
  );
}
