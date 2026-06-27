import { useEffect, useRef, useCallback } from "react";
import { useCanvasAutosaveContext } from "@/components/editor/canvas-autosave-context";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface UseCanvasAutosaveProps {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
}: UseCanvasAutosaveProps) {
  const autosave = useCanvasAutosaveContext();
  const setStatus = autosave?.setStatus;
  const setTriggerManualSave = autosave?.setTriggerManualSave;
  const isDirty = autosave?.isDirty ?? false;
  const setIsDirty = autosave?.setIsDirty;

  const latestDataRef = useRef({ nodes, edges });

  // Update latest data ref on every change
  useEffect(() => {
    latestDataRef.current = { nodes, edges };
  }, [nodes, edges]);

  const saveCanvas = useCallback(async (force = false) => {
    // If not flagged as having local changes and not forced, no need to save
    if ((!isDirty && !force) || !setStatus || !setIsDirty) return;

    setStatus("saving");
    try {
      const data = latestDataRef.current;
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Failed to save canvas: ${res.statusText}`);
      }

      // Reset local changes flag and transition to saved
      setIsDirty(false);
      setStatus("saved");
    } catch (error) {
      console.error("Autosave error:", error);
      setStatus("error");
    }
  }, [projectId, setStatus, isDirty, setIsDirty]);

  // Set the manual save trigger function in the context
  useEffect(() => {
    if (!setTriggerManualSave || !setIsDirty) return;

    const manualSave = async () => {
      await saveCanvas(true);
    };
    setTriggerManualSave(() => manualSave);
    return () => setTriggerManualSave(null);
  }, [saveCanvas, setTriggerManualSave, setIsDirty]);

  // Debounced autosave effect
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveCanvas();
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timer);
  }, [nodes, edges, saveCanvas, isDirty]);
}
