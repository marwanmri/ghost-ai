"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed right-0 top-14 bottom-0 z-30 w-80 border-l border-default bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl shadow-black/50 select-none",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      aria-label="AI Assistant sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-ai animate-pulse shadow-[0_0_8px_var(--accent-ai)]" />
            <h2 className="text-sm font-semibold text-copy-primary uppercase tracking-wider font-mono">
              AI Assistant
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors rounded-lg"
            aria-label="Close AI sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <Sparkles className="h-6 w-6 text-accent-ai/40 mx-auto" />
            <p className="text-xs text-copy-muted">AI chat interface will appear here.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
