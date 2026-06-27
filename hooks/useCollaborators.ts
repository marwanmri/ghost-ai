import { useState, useEffect, useCallback } from "react";

export interface Collaborator {
  id: string;
  email: string;
  emailNormalized: string;
  name: string;
  avatar: string | null;
  isOwner: boolean;
  createdAt: string;
}

async function handleResponse(res: Response, defaultErrorMessage: string) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || defaultErrorMessage);
    }
    return data;
  }
  
  const text = await res.text();
  throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
}

export function useCollaborators(projectId: string | null) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    if (!projectId) {
      setCollaborators([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      const data = await handleResponse(res, "Failed to load collaborators");
      setCollaborators(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || "An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCollaborators();
  }, [fetchCollaborators]);

  const inviteCollaborator = async (email: string): Promise<boolean> => {
    if (!projectId) return false;
    setIsInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await handleResponse(res, "Failed to invite collaborator");
      // Reload the list of collaborators to get enriched data from Clerk
      await fetchCollaborators();
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setInviteError(err.message);
      } else {
        setInviteError(String(err) || "An unknown error occurred");
      }
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  const removeCollaborator = async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    setRemovingId(id);
    setRemoveError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await handleResponse(res, "Failed to remove collaborator");
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRemoveError(err.message);
      } else {
        setRemoveError(String(err) || "Failed to remove collaborator");
      }
      return false;
    } finally {
      setRemovingId(null);
    }
  };

  return {
    collaborators,
    isLoading,
    error,
    isInviting,
    inviteError,
    setInviteError,
    removingId,
    removeError,
    setRemoveError,
    inviteCollaborator,
    removeCollaborator,
    refreshCollaborators: fetchCollaborators,
  };
}
