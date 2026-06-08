import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EditorShell } from "@/components/editor/editor-shell";
import { getProjects } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const projects = await getProjects();
  const activeProject = projects.find((p) => p.id === projectId);

  if (!activeProject) {
    redirect("/editor");
  }

  return (
    <EditorShell projects={projects} activeProjectId={projectId}>
      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-y-auto flex flex-col items-center justify-center p-6 md:p-10 select-none animate-fade-in">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-ai/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-xl text-center space-y-6 relative z-10 p-4">
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
                Collaborative Canvas & spec generation will be implemented in the next phases.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/editor"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-default hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors gap-2"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </EditorShell>
  );
}
