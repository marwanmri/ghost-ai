import React, { useState, useEffect, useRef } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode, CanvasNodeColor } from "@/types/canvas";
import { NodeShape } from "./node-shape";
import { NODE_COLORS } from "@/types/canvas";

interface ColorSwatchProps {
  color: CanvasNodeColor;
  isActive: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, isActive, onClick }: ColorSwatchProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-5 h-5 rounded-full border transition-all duration-150 relative flex items-center justify-center cursor-pointer"
      style={{
        backgroundColor: color.background,
        borderColor: isActive ? color.foreground : "var(--border-subtle)",
        boxShadow: isHovered
          ? `0 0 8px 1px ${color.foreground}`
          : "none",
        transform: isHovered || isActive ? "scale(1.1)" : "scale(1)",
      }}
      title={`Set theme (BG: ${color.background}, Text: ${color.foreground})`}
      aria-label={`Set theme to background ${color.background} and text ${color.foreground}`}
    >
      {isActive && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color.foreground }}
        />
      )}
    </button>
  );
}

export function CanvasNodeComponent({ id, data, selected }: NodeProps<CanvasNode>) {
  const textColor = data.color.foreground;
  const { setNodes } = useReactFlow();

  // Label editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [prevLabel, setPrevLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editValue if label changed externally and user is not editing
  if (data.label !== prevLabel) {
    setPrevLabel(data.label);
    if (!isEditing) {
      setEditValue(data.label);
    }
  }

  // Automatically adjust textarea height to fit content centered inside the node
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        textarea.parentElement?.clientHeight ?? 100
      )}px`;
    }
  }, [editValue, isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setEditValue(newVal);

    // Update in-memory and collaborative React Flow/Liveblocks store
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: newVal,
            },
          };
        }
        return n;
      })
    );
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      onDoubleClick={() => {
        setIsEditing(true);
        setEditValue(data.label);
      }}
      className={`relative w-full h-full transition-all duration-200 ${
        selected ? "drop-shadow-[0_0_12px_rgba(0,200,212,0.4)]" : ""
      }`}
    >
      {/* Node Resizer Control */}
      <NodeResizer
        isVisible={!!selected}
        minWidth={80}
        minHeight={60}
        lineClassName="!border-brand/60"
        handleClassName="!w-2 !h-2 !bg-base !border !border-brand !rounded-sm"
      />

      {/* Floating Color Toolbar */}
      {selected && (
        <div
          className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 nodrag nopan z-50 p-1.5 flex gap-1.5 items-center rounded-full bg-elevated/95 border border-default shadow-lg transition-opacity duration-200"
          style={{ pointerEvents: "auto" }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {NODE_COLORS.map((swatch, idx) => {
            const isActive =
              data.color.background.toLowerCase() === swatch.background.toLowerCase() &&
              data.color.foreground.toLowerCase() === swatch.foreground.toLowerCase();
            return (
              <ColorSwatch
                key={idx}
                color={swatch}
                isActive={isActive}
                onClick={() => {
                  setNodes((prevNodes) =>
                    prevNodes.map((n) => {
                      if (n.id === id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            color: swatch,
                          },
                        };
                      }
                      return n;
                    })
                  );
                }}
              />
            );
          })}
        </div>
      )}

      <NodeShape
        shape={data.shape}
        color={data.color}
        selected={selected}
      />
      
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* Label container/editing area */}
      {isEditing ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10 pointer-events-auto">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="nodrag nopan w-full bg-transparent border-0 outline-none resize-none text-center text-sm font-medium focus:outline-none focus:ring-0 focus:border-0 p-0 cursor-text overflow-hidden"
            style={{ color: textColor }}
            autoFocus
            onFocus={(e) => {
              const val = e.target.value;
              e.target.value = "";
              e.target.value = val;
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center p-4 text-center break-words text-sm font-medium select-none pointer-events-none"
          style={{ color: textColor }}
        >
          {data.label ? (
            data.label
          ) : (
            <span className="opacity-40 text-copy-muted italic">
              Add label...
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

