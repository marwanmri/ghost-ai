"use client";

import React from "react";
import { X, Plus, FolderKanban, Share2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Project } from "@/hooks/use-project-dialogs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onClickNewProject?: () => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onClickNewProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((p) => p.isOwned);
  const sharedProjects = projects.filter((p) => !p.isOwned);

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-30 w-80 border-r border-default bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl shadow-black/50 select-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      aria-label="Projects sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
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
        <Tabs
          defaultValue="my-projects"
          className="flex-1 flex flex-col p-4 overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 bg-base border border-default/60 p-1 rounded-full shrink-0 mb-4 w-full h-9">
            <TabsTrigger
              value="my-projects"
              className={cn(
                "group/trigger h-full text-xs rounded-full gap-2 transition-all duration-300 cursor-pointer select-none border border-transparent",
                "text-copy-muted hover:text-copy-primary hover:bg-subtle/20",
                "data-active:bg-subtle data-active:text-copy-primary data-active:border-subtle-border/40 data-active:shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
                "dark:data-active:bg-subtle dark:data-active:text-copy-primary dark:data-active:border-subtle-border/40",
              )}
            >
              <FolderKanban className="size-3.5 transition-colors duration-300 text-copy-muted group-hover/trigger:text-copy-primary group-data-active/trigger:text-brand group-data-[active]/trigger:text-brand" />
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className={cn(
                "group/trigger h-full text-xs rounded-full gap-2 transition-all duration-300 cursor-pointer select-none border border-transparent",
                "text-copy-muted hover:text-copy-primary hover:bg-subtle/20",
                "data-active:bg-subtle data-active:text-copy-primary data-active:border-subtle-border/40 data-active:shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
                "dark:data-active:bg-subtle dark:data-active:text-copy-primary dark:data-active:border-subtle-border/40",
              )}
            >
              <Share2 className="size-3.5 transition-colors duration-300 text-copy-muted group-hover/trigger:text-copy-primary group-data-active/trigger:text-brand group-data-[active]/trigger:text-brand" />
              Shared
            </TabsTrigger>
          </TabsList>

          {/* My Projects Tab Panel */}
          <TabsContent
            value="my-projects"
            className="flex-1 flex flex-col p-0 outline-none overflow-y-auto"
          >
            {ownedProjects.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                <div className="flex flex-col items-center max-w-[200px] animate-fade-in">
                  <div className="p-4 rounded-full bg-accent-dim/30 border border-brand/10 text-brand mb-4 shadow-[0_0_20px_rgba(0,200,212,0.05)]">
                    <FolderKanban className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-copy-primary mb-1">
                    No projects found
                  </h3>
                  <p className="text-xs text-copy-muted leading-relaxed">
                    Create a new project to start designing your system
                    architecture.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-1 pr-1 py-1">
                {ownedProjects.map((project) => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border",
                        isActive
                          ? "bg-accent-primary-dim text-accent-primary border-accent-primary/20 shadow-sm"
                          : "hover:bg-subtle text-copy-secondary hover:text-copy-primary border-transparent",
                      )}
                      onClick={() => onSelectProject(project.id)}
                    >
                      <span className="text-sm font-medium truncate pr-2">
                        {project.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-elevated text-copy-muted hover:text-copy-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameProject(project);
                          }}
                          aria-label={`Rename ${project.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-elevated text-state-error/80 hover:text-state-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(project);
                          }}
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Shared Tab Panel */}
          <TabsContent
            value="shared"
            className="flex-1 flex flex-col p-0 outline-none overflow-y-auto"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                <div className="flex flex-col items-center max-w-[200px] animate-fade-in">
                  <div className="p-4 rounded-full bg-accent-ai/10 border border-accent-ai/10 text-accent-ai-text mb-4 shadow-[0_0_20px_rgba(100,87,249,0.05)]">
                    <Share2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-copy-primary mb-1">
                    No shared projects
                  </h3>
                  <p className="text-xs text-copy-muted leading-relaxed">
                    Projects shared with you by other collaborators will appear
                    here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-1 pr-1 py-1">
                {sharedProjects.map((project) => {
                  const isActive = project.id === activeProjectId;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 border",
                        isActive
                          ? "bg-accent-primary-dim text-accent-primary border-accent-primary/20 shadow-sm"
                          : "hover:bg-subtle text-copy-secondary hover:text-copy-primary border-transparent",
                      )}
                      onClick={() => onSelectProject(project.id)}
                    >
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer: New Project Button */}
      <div className="p-4 border-t border-default bg-surface shrink-0">
        <Button
          variant="default"
          onClick={onClickNewProject}
          className="w-full h-10 gap-2 text-xs font-semibold rounded-xl bg-brand text-base hover:bg-brand/90 transition-all shadow-md shadow-brand/10 animate-fade-in"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
