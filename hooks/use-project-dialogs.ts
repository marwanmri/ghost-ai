"use client";

import { useState } from "react";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export type DialogType = "create" | "rename" | "delete" | null;

const INITIAL_PROJECTS: Project[] = [
  { id: "1", name: "Ghost AI Canvas", slug: "ghost-ai-canvas", isOwned: true },
  {
    id: "2",
    name: "E-Commerce Microservices",
    slug: "e-commerce-microservices",
    isOwned: true,
  },
  {
    id: "3",
    name: "Payment Gateway Integrations",
    slug: "payment-gateway-integrations",
    isOwned: false,
  },
  {
    id: "4",
    name: "Analytics Pipeline",
    slug: "analytics-pipeline",
    isOwned: false,
  },
];

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const openCreateDialog = () => {
    setNameInput("");
    setSlugInput("");
    setSelectedProject(null);
    setActiveDialog("create");
  };

  const openRenameDialog = (project: Project) => {
    setSelectedProject(project);
    setNameInput(project.name);
    setSlugInput(project.slug);
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
  };

  const handleNameChange = (name: string) => {
    setNameInput(name);
    setSlugInput(slugify(name));
  };

  const handleCreateProject = async () => {
    if (!nameInput.trim()) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 9),
      name: nameInput.trim(),
      slug: slugInput || slugify(nameInput),
      isOwned: true,
    };

    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    closeDialog();
  };

  const handleRenameProject = async () => {
    if (!selectedProject || !nameInput.trim()) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? {
              ...p,
              name: nameInput.trim(),
              slug: slugInput || slugify(nameInput),
            }
          : p,
      ),
    );
    closeDialog();
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
    if (activeProjectId === selectedProject.id) {
      setActiveProjectId(null);
    }
    closeDialog();
  };

  return {
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
    setNameInput,
    setSlugInput,
    handleNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}
