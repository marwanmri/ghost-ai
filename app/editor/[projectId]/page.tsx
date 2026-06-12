import React from "react";
import { redirect } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { getProjects } from "@/lib/projects";
import { checkProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const access = await checkProjectAccess(projectId);

  if (!access.hasAccess) {
    if (access.reason === "unauthenticated") {
      redirect(
        `/sign-in?redirect_url=${encodeURIComponent(`/editor/${projectId}`)}`,
      );
    }
    return <AccessDenied />;
  }

  const projects = await getProjects();

  return (
    <EditorShell projects={projects} activeProjectId={projectId}>
      <CollaborativeCanvas roomId={projectId} />
    </EditorShell>
  );
}
