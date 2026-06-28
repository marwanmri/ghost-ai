import { useState, useEffect, useCallback, useRef } from "react";

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
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
  }
  
  const text = await res.text();
  return text;
}

export function useCollaborators(projectId: string | null) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchCollaborators = useCallback(async () => {
    await Promise.resolve();
    if (!projectId) {
      if (isMountedRef.current) {
        setCollaborators([]);
        setIsLoading(false);
        setError(null);
      }
      return;
    }
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      const data = await handleResponse(res, "Failed to load collaborators");
      if (isMountedRef.current) {
        setCollaborators(data);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCollaborators();
    });
  }, [fetchCollaborators]);

  const inviteCollaborator = async (email: string): Promise<boolean> => {
    if (!projectId) return false;
    if (isMountedRef.current) {
      setIsInviting(true);
      setInviteError(null);
    }
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
      if (isMountedRef.current) {
        setInviteError(err instanceof Error ? err.message : String(err));
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsInviting(false);
      }
    }
  };

  const removeCollaborator = async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    if (isMountedRef.current) {
      setRemovingId(id);
      setRemoveError(null);
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await handleResponse(res, "Failed to remove collaborator");
      if (isMountedRef.current) {
        setCollaborators((prev) => prev.filter((c) => c.id !== id));
      }
      return true;
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setRemoveError(err instanceof Error ? err.message : String(err));
      }
      return false;
    } finally {
      if (isMountedRef.current) {
        setRemovingId(null);
      }
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
