"use client";

import React from "react";
import { Circle, Square, Diamond, Hexagon, Cylinder, RectangleHorizontal, Cable } from "lucide-react";
import type { CanvasNodeShape } from "@/types/canvas";

interface ShapeOption {
  type: CanvasNodeShape;
  icon: React.ElementType;
  width: number;
  height: number;
}

const SHAPES: ShapeOption[] = [
  { type: "rectangle", icon: Square, width: 200, height: 120 },
  { type: "diamond", icon: Diamond, width: 160, height: 160 },
  { type: "circle", icon: Circle, width: 160, height: 160 },
  { type: "pill", icon: RectangleHorizontal, width: 200, height: 100 },
  { type: "cylinder", icon: Cylinder, width: 160, height: 200 },
  { type: "hexagon", icon: Hexagon, width: 160, height: 160 },
];

interface ShapePanelProps {
  onInsertShape?: (shape: CanvasNodeShape, width: number, height: number) => void;
  onDragStart?: (shape: CanvasNodeShape, width: number, height: number) => void;
  onDragEnd?: () => void;
  isConnectingMode?: boolean;
  onToggleConnectingMode?: () => void;
  hasSelectedNode?: boolean;
}

export function ShapePanel({
  onInsertShape,
  onDragStart,
  onDragEnd,
  isConnectingMode = false,
  onToggleConnectingMode,
  hasSelectedNode = false,
}: ShapePanelProps) {
  const handleDragStart = (event: React.DragEvent, shape: ShapeOption) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ shape: shape.type, width: shape.width, height: shape.height })
    );
    event.dataTransfer.effectAllowed = "move";

    // Disable default browser drag ghost image
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    event.dataTransfer.setDragImage(img, 0, 0);

    onDragStart?.(shape.type, shape.width, shape.height);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-default/70 bg-surface/90 px-4 py-2 shadow-xl shadow-black/20 backdrop-blur-md z-50">
      {SHAPES.map((shape) => {
        const Icon = shape.icon;
        return (
          <button
            key={shape.type}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent-dim text-copy-muted hover:text-brand transition-colors cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
            onDragEnd={onDragEnd}
            onClick={() => onInsertShape?.(shape.type, shape.width, shape.height)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onInsertShape?.(shape.type, shape.width, shape.height);
              }
            }}
            title={shape.type}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}

      {/* Separator */}
      <div className="w-px h-6 bg-default/70 mx-1" />

      {/* Connector Tool Button */}
      <button
        onClick={onToggleConnectingMode}
        disabled={!hasSelectedNode}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
          isConnectingMode
            ? "bg-accent-dim text-brand border border-brand/30 shadow-[0_0_12px_rgba(0,200,212,0.25)]"
            : hasSelectedNode
            ? "text-copy-muted hover:text-brand hover:bg-accent-dim cursor-pointer"
            : "text-faint cursor-not-allowed opacity-50"
        }`}
        title={
          hasSelectedNode
            ? isConnectingMode
              ? "Connecting Mode: Click another node to connect (Esc to cancel)"
              : "Connector Tool: Draw connection to another node"
            : "Connector Tool: Select a node first to connect"
        }
      >
        <Cable className="h-5 w-5" />
      </button>
    </div>
  );
}

