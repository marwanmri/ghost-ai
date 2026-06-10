"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollaborators, Collaborator } from "@/hooks/useCollaborators";
import {
  Link as LinkIcon,
  Check,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Users,
  Shield,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isOwned: boolean;
}

export function ShareDialog({
  isOpen,
  onClose,
  projectId,
  isOwned,
}: ShareDialogProps) {
  const {
    collaborators,
    isLoading,
    error,
    isInviting,
    inviteError,
    setInviteError,
    removingId,
    inviteCollaborator,
    removeCollaborator,
    refreshCollaborators,
  } = useCollaborators(isOpen ? projectId : null);

  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch collaborators on open
  useEffect(() => {
    if (isOpen) {
      refreshCollaborators();
    }
  }, [isOpen, refreshCollaborators]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || isInviting) return;

    const success = await inviteCollaborator(emailInput.trim());
    if (success) {
      setEmailInput("");
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : `/editor/${projectId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link to clipboard:", err);
      setCopied(false);
    }
  };

  const getInitials = (name: string, email: string): string => {
    if (name && name !== email) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setEmailInput("");
        setInviteError(null);
        onClose();
      }
    }}>
      <DialogContent className="bg-elevated border border-default rounded-3xl w-[95vw] max-w-lg sm:max-w-lg p-6 backdrop-blur-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl text-copy-primary tracking-wide flex items-center gap-2">
            <Users className="h-5 w-5 text-accent-primary" />
            Share Project
          </DialogTitle>
          <DialogDescription className="text-copy-muted">
            {isOwned
              ? "Invite collaborators by email, manage project access, or copy the sharing link."
              : "View project collaborators and copy the project link."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 w-full min-w-0">
          {/* SECTION 1: Copy Link */}
          <div className="space-y-2">
            <label className="text-xs text-copy-muted uppercase tracking-wider font-mono">
              Project Link
            </label>
            <div className="flex gap-2 items-center w-full min-w-0">
              <div className="flex-1 min-w-0 bg-base border border-default rounded-xl px-3 py-2 h-10 flex items-center overflow-hidden">
                <input
                  readOnly
                  className="bg-transparent border-none outline-none focus:ring-0 w-full min-w-0 text-xs font-mono text-copy-muted"
                  value={typeof window !== "undefined"
                    ? `${window.location.origin}/editor/${projectId}`
                    : `/editor/${projectId}`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={handleCopyLink}
                className={cn(
                  "rounded-xl h-10 px-4 shrink-0 transition-all gap-2",
                  copied
                    ? "bg-state-success text-white border-state-success hover:bg-state-success/90"
                    : "border-default hover:bg-subtle text-copy-primary"
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SECTION 2: Invite Collaborators (Owners Only) */}
          {isOwned && (
            <div className="space-y-2 pt-2 border-t border-default/50">
              <label className="text-xs text-copy-muted uppercase tracking-wider font-mono">
                Invite Collaborator
              </label>
              <form onSubmit={handleInviteSubmit} className="flex gap-2 items-start w-full min-w-0">
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    type="email"
                    placeholder="collaborator@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-base border-default text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40 h-10 px-3 rounded-xl"
                    disabled={isInviting}
                  />
                  {inviteError && (
                    <div className="p-3 bg-state-error/10 border border-state-error/20 rounded-xl text-xs text-state-error animate-fade-in flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{inviteError}</span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isInviting || !emailInput.trim()}
                  className="bg-brand text-base hover:bg-brand/90 font-medium rounded-xl gap-2 px-4 h-10 shrink-0"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Inviting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Invite</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* SECTION 3: Collaborators List */}
          <div className="space-y-3 pt-2 border-t border-default/50 w-full min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs text-copy-muted uppercase tracking-wider font-mono">
                Members with Access
              </label>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-copy-muted" />}
            </div>

            {error ? (
              <div className="p-3 bg-state-error/10 border border-state-error/20 rounded-xl text-xs text-state-error flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="bg-base rounded-2xl border border-default overflow-hidden max-h-[220px] overflow-y-auto divide-y divide-default">
                {collaborators.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-subtle/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover border border-default shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-semibold text-xs font-mono shrink-0">
                          {getInitials(user.name, user.email)}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-copy-primary truncate max-w-[200px]">
                          {user.name || user.email}
                        </span>
                        {user.name && user.name !== user.email && (
                          <span className="text-xs text-copy-muted truncate max-w-[200px] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-copy-faint" />
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {user.isOwner ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-medium text-accent-primary bg-accent-primary-dim border border-accent-primary/20 px-2 py-0.5 rounded-full">
                          <Shield className="h-3 w-3" />
                          Owner
                        </span>
                      ) : (
                        isOwned && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={removingId !== null}
                            onClick={() => removeCollaborator(user.id)}
                            className="text-copy-muted hover:text-state-error hover:bg-state-error/10 rounded-lg transition-colors h-7 w-7"
                            aria-label={`Remove collaborator ${user.email}`}
                          >
                            {removingId === user.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
