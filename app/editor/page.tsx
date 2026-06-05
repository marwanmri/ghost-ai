"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Plus,
  FolderOpen,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FolderKanban,
} from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    activeDialog,
    selectedProject,
    nameInput,
    slugInput,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  } = useProjectDialogs();

  return (
    <div className="relative min-h-screen flex flex-col bg-base text-copy-primary overflow-hidden font-sans">
      {/* Top Navbar */}
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Left Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setSidebarOpen(false); // Close on selection (especially good for mobile)
        }}
        onRenameProject={openRenameDialog}
        onDeleteProject={openDeleteDialog}
        onClickNewProject={openCreateDialog}
      />

      {/* Mobile Backdrop Scrim */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-y-auto flex flex-col items-center justify-center p-6 md:p-10 select-none">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-ai/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl text-center space-y-6 animate-fade-in relative z-10 p-4">
          {!activeProject ? (
            /* Minimal Project Home screen */
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-accent-primary-dim border border-accent-primary/10 text-accent-primary mb-2 shadow-[0_0_30px_rgba(0,200,212,0.1)]">
                <FolderOpen className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-copy-primary">
                  Create a project or open an existing one
                </h1>
                <p className="text-sm md:text-base text-copy-muted max-w-md mx-auto">
                  Start a new architecture workspace, or choose a project from
                  sidebar.
                </p>
              </div>
              <div>
                <Button
                  onClick={openCreateDialog}
                  className="bg-brand text-base hover:bg-brand/90 font-medium px-5 py-2.5 h-11 rounded-xl shadow-lg shadow-brand/10 transition-all gap-2"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  New Project
                </Button>
              </div>
            </div>
          ) : (
            /* Active Project Workspace Placeholder */
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-accent-ai/10 border border-accent-ai/20 text-accent-ai-text mb-2 shadow-[0_0_30px_rgba(100,87,249,0.1)]">
                <FolderKanban className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-copy-primary truncate max-w-lg mx-auto">
                  {activeProject.name}
                </h1>
                <p className="text-xs font-mono text-accent-primary-dim text-accent-primary/80 bg-accent-primary-dim/20 px-3 py-1 rounded-full w-fit mx-auto border border-accent-primary/10">
                  slug: {activeProject.slug}
                </p>
                <p className="text-sm text-copy-muted max-w-md mx-auto pt-2">
                  Collaborative Canvas & spec generation will be implemented in
                  the next phases.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveProjectId(null)}
                  className="border-default hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE PROJECT DIALOG */}
      <Dialog open={activeDialog === "create"} onOpenChange={closeDialog}>
        <DialogContent className="bg-elevated border border-default rounded-3xl max-w-md p-6 backdrop-blur-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-copy-primary tracking-wide">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-copy-muted">
              Initialize a new system architecture design space. Choose a name
              to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="create-project-name"
                className="text-xs text-copy-muted uppercase tracking-wider font-mono"
              >
                Project Name
              </label>
              <Input
                id="create-project-name"
                placeholder="e.g. E-Commerce Microservices"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-base border-default text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40 h-10 px-3 rounded-xl"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {nameInput.trim() && (
              <div className="p-3 bg-base/60 rounded-xl border border-default/50 space-y-1 animate-fade-in">
                <div className="text-[10px] text-copy-muted font-mono uppercase tracking-wider">
                  Live Slug Preview
                </div>
                <div className="text-xs font-mono text-accent-primary truncate">
                  /editor/{slugInput}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-default/50">
            <Button
              variant="ghost"
              onClick={closeDialog}
              className="hover:bg-subtle text-copy-muted hover:text-copy-primary rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-brand text-base hover:bg-brand/90 font-medium rounded-xl gap-2 px-4 h-10"
              disabled={isLoading || !nameInput.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RENAME PROJECT DIALOG */}
      <Dialog open={activeDialog === "rename"} onOpenChange={closeDialog}>
        <DialogContent className="bg-elevated border border-default rounded-3xl max-w-md p-6 backdrop-blur-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-copy-primary tracking-wide">
              Rename Project
            </DialogTitle>
            <DialogDescription className="text-copy-muted">
              Current name:{" "}
              <span className="text-copy-primary font-medium">
                {selectedProject?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="rename-project-name"
                className="text-xs text-copy-muted uppercase tracking-wider font-mono"
              >
                New Project Name
              </label>
              <Input
                id="rename-project-name"
                placeholder="e.g. E-Commerce Platform"
                value={nameInput}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nameInput.trim() && !isLoading) {
                    handleRenameProject();
                  }
                }}
                className="bg-base border-default text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40 h-10 px-3 rounded-xl"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-default/50">
            <Button
              variant="ghost"
              onClick={closeDialog}
              className="hover:bg-subtle text-copy-muted hover:text-copy-primary rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
              className="bg-brand text-base hover:bg-brand/90 font-medium rounded-xl gap-2 px-4 h-10"
              disabled={isLoading || !nameInput.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PROJECT DIALOG */}
      <Dialog open={activeDialog === "delete"} onOpenChange={closeDialog}>
        <DialogContent className="bg-elevated border border-default rounded-3xl max-w-md p-6 backdrop-blur-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-copy-primary tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-state-error animate-pulse" />
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-copy-muted leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-copy-primary font-medium">
                &quot;{selectedProject?.name}&quot;
              </span>
              ? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-default/50">
            <Button
              variant="ghost"
              onClick={closeDialog}
              className="hover:bg-subtle text-copy-muted hover:text-copy-primary rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              variant="destructive"
              className="bg-state-error text-white hover:bg-state-error/90 font-medium rounded-xl gap-2 px-4 h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
