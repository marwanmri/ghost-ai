"use client";

import React from "react";
import { Circle, Square, Diamond, Hexagon, Cylinder, RectangleHorizontal } from "lucide-react";
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

export function ShapePanel() {
  const onDragStart = (event: React.DragEvent, shape: ShapeOption) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ shape: shape.type, width: shape.width, height: shape.height })
    );
    event.dataTransfer.effectAllowed = "move";
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
            onDragStart={(e) => onDragStart(e, shape)}
            title={shape.type}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
