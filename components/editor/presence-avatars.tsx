"use client";

import React from "react";
import { useOthers } from "@liveblocks/react";
import { useUser } from "@clerk/nextjs";

/**
 * Renders collaborator presence avatars only (excluding the current user).
 * This component is placed inside the editor canvas area.
 * The Clerk UserButton is rendered separately in the navbar.
 */
export function PresenceAvatars() {
  const others = useOthers();
  const { user } = useUser();
  const currentUserId = user?.id;

  // Filter others to exclude the current user
  const collaborators = others.filter((other) => other.id !== currentUserId);

  if (collaborators.length === 0) {
    return null;
  }

  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = collaborators.length - 5;

  return (
    <div className="flex items-center gap-1 bg-surface/90 border border-default/70 px-2.5 py-1.5 rounded-full shadow-lg shadow-black/15 backdrop-blur-md select-none">
      <div className="flex -space-x-1.5">
        {visibleCollaborators.map((other) => {
          const name = other.info?.name || "Collaborator";
          const avatarUrl = other.info?.avatar;
          const initials = getInitials(name);
          const color = other.info?.color || "var(--accent-primary)";

          return (
            <div
              key={other.connectionId}
              className="relative h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold select-none bg-subtle border ring-1 ring-black/40 ring-offset-0 transition-transform duration-200 hover:z-10 cursor-default"
              style={{
                borderColor: color,
              }}
              title={name}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-copy-primary">{initials}</span>
              )}
            </div>
          );
        })}
        {overflowCount > 0 && (
          <div className="relative h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold select-none bg-subtle border border-default ring-1 ring-black/40 ring-offset-0 text-copy-muted">
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (trimmed === "") return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
