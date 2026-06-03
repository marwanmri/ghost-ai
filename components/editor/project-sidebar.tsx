"use client"

import React from "react"
import { X, Plus, FolderKanban, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onClickNewProject?: () => void
}

export function ProjectSidebar({ isOpen, onClose, onClickNewProject }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-30 w-80 border-r border-default bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl shadow-black/50 select-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Projects sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Upper Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
          <h2 className="text-sm font-semibold text-copy-primary uppercase tracking-wider font-mono">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors rounded-lg"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="my-projects" className="flex-1 flex flex-col p-4 overflow-hidden">
          <TabsList className="grid grid-cols-2 bg-base border border-default p-[3px] rounded-xl shrink-0 mb-4 w-full">
            <TabsTrigger value="my-projects" className="py-1.5 text-xs">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="py-1.5 text-xs">
              Shared
            </TabsTrigger>
          </TabsList>

          {/* My Projects Tab Panel */}
          <TabsContent value="my-projects" className="flex-1 flex flex-col justify-center items-center text-center p-4 outline-none overflow-y-auto">
            <div className="flex flex-col items-center max-w-[200px] animate-fade-in">
              <div className="p-4 rounded-full bg-accent-dim/30 border border-brand/10 text-brand mb-4 shadow-[0_0_20px_rgba(0,200,212,0.05)]">
                <FolderKanban className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-copy-primary mb-1">
                No projects found
              </h3>
              <p className="text-xs text-copy-muted leading-relaxed">
                Create a new project to start designing your system architecture.
              </p>
            </div>
          </TabsContent>

          {/* Shared Tab Panel */}
          <TabsContent value="shared" className="flex-1 flex flex-col justify-center items-center text-center p-4 outline-none overflow-y-auto">
            <div className="flex flex-col items-center max-w-[200px] animate-fade-in">
              <div className="p-4 rounded-full bg-accent-ai/10 border border-accent-ai/10 text-accent-ai-text mb-4 shadow-[0_0_20px_rgba(100,87,249,0.05)]">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-copy-primary mb-1">
                No shared projects
              </h3>
              <p className="text-xs text-copy-muted leading-relaxed">
                Projects shared with you by other collaborators will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer: New Project Button */}
      <div className="p-4 border-t border-default bg-surface shrink-0">
        <Button
          variant="default"
          onClick={onClickNewProject}
          className="w-full h-10 gap-2 text-xs font-semibold rounded-xl bg-brand text-base hover:bg-brand/90 transition-all shadow-md shadow-brand/10"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
