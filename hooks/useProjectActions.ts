"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/projects";
import { slugify } from "@/lib/utils";

export type DialogType = "create" | "rename" | "delete" | null;

export function useProjectActions(activeProjectId: string | null) {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateDialog = () => {
    setNameInput("");
    setSlugInput("");
    setSelectedProject(null);
    setError(null);
    setActiveDialog("create");
  };

  const openRenameDialog = (project: Project) => {
    setSelectedProject(project);
    setNameInput(project.name);
    setSlugInput(project.id); // The ID is the room ID / slug
    setActiveDialog("rename");
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setActiveDialog("delete");
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
    setNameInput("");
    setSlugInput("");
    setIsLoading(false);
    setError(null);
  };

  const handleNameChange = (name: string) => {
    setNameInput(name);
    const baseSlug = slugify(name);
    // Since we show a live preview of the slug, we can append a placeholder suffix or keep it dynamic
    setSlugInput(baseSlug);
  };

  const handleCreateProject = async () => {
    if (!nameInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.trim(),
        }),
      });

      if (!response.ok) {
        let errMsg = "Failed to create project";
        try {
          const errData = await response.json();
          if (errData && typeof errData.error === "string") {
            errMsg = errData.error;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const newProject = await response.json();
      closeDialog();
      router.push(`/editor/${encodeURIComponent(newProject.id)}`);
    } catch (err: unknown) {
      console.error("Error creating project:", err);
      setError(
        err instanceof Error
          ? err.message
          : String(err) || "An unexpected error occurred",
      );
      setIsLoading(false);
    }
  };

  const handleRenameProject = async () => {
    if (!selectedProject || !nameInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(selectedProject.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      const updatedProject = await response.json();
      const wasActive = selectedProject.id === activeProjectId;
      closeDialog();

      if (wasActive) {
        router.push(`/editor/${encodeURIComponent(updatedProject.id)}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error renaming project:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(selectedProject.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      const wasActive = selectedProject.id === activeProjectId;
      closeDialog();

      if (wasActive) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setIsLoading(false);
    }
  };

  return {
    activeDialog,
    selectedProject,
    nameInput,
    slugInput,
    isLoading,
    error,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setNameInput,
    setSlugInput,
    handleNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}
