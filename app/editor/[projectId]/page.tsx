import React from "react";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { EditorShell } from "@/components/editor/editor-shell";
import { getProjects } from "@/lib/projects";
import { checkProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const access = await checkProjectAccess(projectId);

  if (!access.hasAccess) {
    if (access.reason === "unauthenticated") {
      redirect("/sign-in");
    }
    return <AccessDenied />;
  }

  const projects = await getProjects();

  return (
    <EditorShell projects={projects} activeProjectId={projectId}>
      {/* Main Workspace Area */}
      <main className="flex-1 relative bg-base flex overflow-hidden">
        {/* Central Canvas Placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative select-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-ai/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface border border-default text-copy-muted shadow-sm mb-2">
              <span className="text-xs font-mono tracking-wider">CANVAS</span>
            </div>
            <h2 className="text-xl font-medium text-copy-primary">Workspace Ready</h2>
            <p className="text-sm text-copy-muted max-w-sm mx-auto">
              Real canvas logic with Liveblocks and React Flow will be implemented in the next phase.
            </p>
          </div>
        </div>
      </main>
    </EditorShell>
  );
}
