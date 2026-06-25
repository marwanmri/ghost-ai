import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

interface UseKeyboardShortcutsProps {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  undo: () => void;
  redo: () => void;
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts while typing in inputs, textareas, or editable fields
      const activeElement = document.activeElement;
      if (activeElement) {
        const tagName = activeElement.tagName.toLowerCase();
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          activeElement.hasAttribute("contenteditable") ||
          (activeElement as HTMLElement).isContentEditable
        ) {
          return;
        }
      }

      const isMod = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      // Zoom In: "+" or "=" (only when modifier key is NOT held to allow native browser zoom)
      if ((event.key === "+" || event.key === "=") && !isMod) {
        event.preventDefault();
        reactFlow.zoomIn({ duration: 300 });
      }
      // Zoom Out: "-" (only when modifier key is NOT held to allow native browser zoom)
      else if (event.key === "-" && !isMod) {
        event.preventDefault();
        reactFlow.zoomOut({ duration: 300 });
      }
      // Cmd/Ctrl + Shift + Z -> Redo
      else if (isMod && isShift && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        redo();
      }
      // Cmd/Ctrl + Z -> Undo
      else if (isMod && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Y -> Redo
      else if (isMod && (event.key === "y" || event.key === "Y")) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, undo, redo]);
}
