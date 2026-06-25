"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CANVAS_TEMPLATES, CanvasTemplate } from "./starter-templates";
import { useStarterTemplates } from "./starter-templates-context";
import { NodeShape } from "../canvas/nodes/node-shape";

interface StarterTemplatesModalProps {
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({ onImport }: StarterTemplatesModalProps) {
  const { isOpen, setIsOpen } = useStarterTemplates();

  const handleImport = (template: CanvasTemplate) => {
    onImport(template);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-elevated border border-default rounded-3xl max-w-5xl sm:max-w-5xl w-full p-6 md:p-8 backdrop-blur-md max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-2 select-none shrink-0">
          <DialogTitle className="text-xl md:text-2xl text-copy-primary tracking-wide font-semibold flex items-center gap-2">
            Import Template
          </DialogTitle>
          <DialogDescription className="text-sm text-copy-muted leading-relaxed mt-1">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced — use{" "}
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-sans font-medium text-copy-primary bg-subtle border border-default rounded-md shadow-[0_1px_0px_rgba(255,255,255,0.15)] select-none">
              ⌘Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>

        {/* Templates Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col justify-between rounded-2xl border border-default bg-base hover:border-subtle-border p-4 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Diagram Preview at the top */}
                  <TemplatePreview template={template} />

                  <div className="space-y-2 select-none">
                    <h3 className="font-semibold text-copy-primary text-base">
                      {template.name}
                    </h3>
                    <p className="text-xs text-copy-muted leading-relaxed min-h-[48px] line-clamp-3">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    onClick={() => handleImport(template)}
                    variant="outline"
                    className="w-full border-default bg-transparent text-copy-primary hover:bg-subtle hover:text-copy-primary rounded-xl py-2 px-3 h-9 transition-colors gap-2 cursor-pointer text-xs font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const nodes = template.nodes;
  const edges = template.edges;

  if (nodes.length === 0) return null;

  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x + (n.style?.width as number || 150)));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y + (n.style?.height as number || 100)));

  const diagramWidth = maxX - minX;
  const diagramHeight = maxY - minY;

  const padding = 12;
  const containerWidth = dimensions.width || 240;
  const containerHeight = dimensions.height || 140;

  const scaleX = (containerWidth - 2 * padding) / (diagramWidth || 1);
  const scaleY = (containerHeight - 2 * padding) / (diagramHeight || 1);
  const scale = Math.min(scaleX, scaleY, 0.8);

  const scaledWidth = diagramWidth * scale;
  const scaledHeight = diagramHeight * scale;
  const offsetX = padding + (containerWidth - 2 * padding - scaledWidth) / 2;
  const offsetY = padding + (containerHeight - 2 * padding - scaledHeight) / 2;

  // Pre-calculate mapped nodes positions
  const mappedNodes = nodes.map((node) => {
    const nodeWidth = node.style?.width as number || 150;
    const nodeHeight = node.style?.height as number || 100;
    const x = offsetX + (node.position.x - minX) * scale;
    const y = offsetY + (node.position.y - minY) * scale;
    const w = nodeWidth * scale;
    const h = nodeHeight * scale;
    return {
      ...node,
      rect: { x, y, w, h },
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[140px] bg-[#080809] border border-default rounded-xl overflow-hidden select-none shrink-0"
    >
      {/* Draw edges as simple SVG lines */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
        {edges.map((edge) => {
          const sourceNode = mappedNodes.find((n) => n.id === edge.source);
          const targetNode = mappedNodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const sx = sourceNode.rect.x + sourceNode.rect.w / 2;
          const sy = sourceNode.rect.y + sourceNode.rect.h / 2;
          const tx = targetNode.rect.x + targetNode.rect.w / 2;
          const ty = targetNode.rect.y + targetNode.rect.h / 2;

          return (
            <line
              key={edge.id}
              x1={sx}
              y1={sy}
              x2={tx}
              y2={ty}
              stroke="#EDEDED"
              strokeWidth={Math.max(1, 1.5 * scale)}
              strokeOpacity={0.4}
              strokeDasharray={
                edge.data?.variant === "dashed"
                  ? "4 2"
                  : edge.data?.variant === "dotted"
                  ? "1 1"
                  : undefined
              }
            />
          );
        })}
      </svg>

      {/* Render nodes as absolute divs */}
      {mappedNodes.map((node) => (
        <div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.rect.x}px`,
            top: `${node.rect.y}px`,
            width: `${node.rect.w}px`,
            height: `${node.rect.h}px`,
          }}
        >
          <NodeShape
            shape={node.data.shape}
            color={node.data.color}
            selected={false}
          />
          <div
            className="absolute inset-0 flex items-center justify-center text-center px-1 font-mono font-medium select-none pointer-events-none truncate text-[8px] leading-tight"
            style={{
              color: node.data.color.foreground,
              fontSize: `${Math.max(6, 10 * scale)}px`,
            }}
          >
            {node.data.label}
          </div>
        </div>
      ))}
    </div>
  );
}
