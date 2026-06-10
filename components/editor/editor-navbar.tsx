"use client";

import React from "react";
import { PanelLeftOpen, PanelLeftClose, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  activeProject?: Project | null;
  onShareClick?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  isAiSidebarOpen,
  onToggleAiSidebar,
  activeProject,
  onShareClick,
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
        {activeProject && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-copy-primary truncate max-w-[200px] md:max-w-[300px]">
              {activeProject.name}
            </span>
          </div>
        )}
      </div>

      {/* Center section: Logo / title */}
      <div className="flex items-center justify-center flex-1">
        <span className="font-sans font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 select-none">
          GHOST AI
        </span>
      </div>

      {/* Right section: profile settings and logout */}
      <div className="flex items-center justify-end flex-1 gap-2">
        {activeProject && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onShareClick}
              className="hidden md:flex gap-2 rounded-xl border-default hover:bg-subtle text-copy-primary h-8 px-3 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleAiSidebar}
              className={cn(
                "hover:text-accent-ai-text hover:bg-accent-ai/10 transition-colors h-8 w-8 rounded-xl",
                isAiSidebarOpen ? "text-accent-ai-text bg-accent-ai/10" : "text-accent-ai"
              )}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-default mx-1 hidden md:block" />
          </>
        )}
        <UserButton />
      </div>
    </header>
  );
}
