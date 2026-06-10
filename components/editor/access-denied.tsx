import React from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <div className="flex-1 relative overflow-y-auto flex flex-col items-center justify-center p-6 md:p-10 select-none animate-fade-in bg-base min-h-screen">
      <div className="w-full max-w-md text-center space-y-6 relative z-10 p-4">
        <div className="inline-flex p-4 rounded-full bg-state-error/10 border border-state-error/20 text-state-error mb-2 shadow-[0_0_30px_rgba(255,77,79,0.1)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-copy-primary">
            Access Denied
          </h1>
          <p className="text-sm md:text-base text-copy-muted mx-auto">
            You don&apos;t have permission to view this project, or it doesn&apos;t exist.
          </p>
        </div>
        <div className="pt-4 flex justify-center">
          <Link
            href="/editor"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-default hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors gap-2 rounded-xl"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
