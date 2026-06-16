import React from "react";
import type { CanvasNodeShape, CanvasNodeColor } from "@/types/canvas";

interface NodeShapeProps {
  shape: CanvasNodeShape;
  color: CanvasNodeColor;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function NodeShape({
  shape,
  color,
  selected = false,
  className = "",
  style = {},
}: NodeShapeProps) {
  const backgroundColor = color.background;
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-default)";
  const strokeWidth = selected ? 2.5 : 1.5;

  const combinedStyle = {
    ...style,
  };

  switch (shape) {
    case "rectangle":
      return (
        <div
          className={`absolute inset-0 rounded-xl border transition-all duration-200 ${className}`}
          style={{
            ...combinedStyle,
            backgroundColor,
            borderColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    case "circle":
      return (
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-200 ${className}`}
          style={{
            ...combinedStyle,
            backgroundColor,
            borderColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    case "pill":
      return (
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-200 ${className}`}
          style={{
            ...combinedStyle,
            backgroundColor,
            borderColor,
            borderWidth: strokeWidth,
          }}
        />
      );
    case "diamond":
      return (
        <svg
          className={`absolute inset-0 w-full h-full transition-all duration-200 ${className}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ ...combinedStyle, overflow: "visible" }}
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
          className={`absolute inset-0 w-full h-full transition-all duration-200 ${className}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ ...combinedStyle, overflow: "visible" }}
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
          className={`absolute inset-0 w-full h-full transition-all duration-200 ${className}`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ ...combinedStyle, overflow: "visible" }}
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
          className={`absolute inset-0 rounded-xl border transition-all duration-200 ${className}`}
          style={{
            ...combinedStyle,
            backgroundColor,
            borderColor,
            borderWidth: strokeWidth,
          }}
        />
      );
  }
}
