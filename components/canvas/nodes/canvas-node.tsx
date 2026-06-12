import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const backgroundColor = data.color.background;
  const textColor = data.color.foreground;
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-default)";
  const strokeWidth = selected ? 2.5 : 1.5;

  const renderShape = () => {
    switch (data.shape) {
      case "rectangle":
        return (
          <div
            className="absolute inset-0 rounded-xl border transition-all duration-200"
            style={{
              backgroundColor,
              borderColor,
              borderWidth: strokeWidth,
            }}
          />
        );
      case "circle":
        return (
          <div
            className="absolute inset-0 rounded-full border transition-all duration-200"
            style={{
              backgroundColor,
              borderColor,
              borderWidth: strokeWidth,
            }}
          />
        );
      case "pill":
        return (
          <div
            className="absolute inset-0 rounded-full border transition-all duration-200"
            style={{
              backgroundColor,
              borderColor,
              borderWidth: strokeWidth,
            }}
          />
        );
      case "diamond":
        return (
          <svg
            className="absolute inset-0 w-full h-full transition-all duration-200"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      case "hexagon":
        return (
          <svg
            className="absolute inset-0 w-full h-full transition-all duration-200"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <polygon
              points="50,0 100,25 100,75 50,100 0,75 0,25"
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      case "cylinder":
        return (
          <svg
            className="absolute inset-0 w-full h-full transition-all duration-200"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            {/* Body */}
            <path
              d="M 0,15 L 0,85 A 50,15 0 0,0 100,85 L 100,15 Z"
              fill={backgroundColor}
            />
            {/* Bottom arc border */}
            <path
              d="M 0,85 A 50,15 0 0,0 100,85"
              fill="none"
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
            {/* Side borders */}
            <path
              d="M 0,15 L 0,85 M 100,15 L 100,85"
              fill="none"
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
            {/* Top face */}
            <ellipse
              cx="50"
              cy="15"
              rx="50"
              ry="15"
              fill={backgroundColor}
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      default:
        return (
          <div
            className="absolute inset-0 rounded-xl border transition-all duration-200"
            style={{
              backgroundColor,
              borderColor,
              borderWidth: strokeWidth,
            }}
          />
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full transition-all duration-200 ${
        selected ? "drop-shadow-[0_0_12px_rgba(0,200,212,0.4)]" : ""
      }`}
    >
      {renderShape()}
      
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* Label container overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 text-center break-words text-sm font-medium select-none pointer-events-none"
        style={{ color: textColor }}
      >
        {data.label || ""}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
