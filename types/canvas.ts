import type { Edge, Node } from "@xyflow/react";

export const CANVAS_NODE_TYPE = "canvasNode" as const;
export const CANVAS_EDGE_TYPE = "canvasEdge" as const;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasNodeShape = (typeof NODE_SHAPES)[number];

export interface CanvasNodeColor {
  background: string;
  foreground: string;
}

export const NODE_COLORS = [
  { background: "#1F1F1F", foreground: "#EDEDED" },
  { background: "#10233D", foreground: "#52A8FF" },
  { background: "#2E1938", foreground: "#BF7AF0" },
  { background: "#331B00", foreground: "#FF990A" },
  { background: "#3C1618", foreground: "#FF6166" },
  { background: "#3A1726", foreground: "#F75F8F" },
  { background: "#0F2E18", foreground: "#62C073" },
  { background: "#062822", foreground: "#0AC7B4" },
] as const satisfies readonly CanvasNodeColor[];

export const DEFAULT_NODE_COLOR = NODE_COLORS[0];
export const DEFAULT_NODE_SHAPE = "rectangle" satisfies CanvasNodeShape;

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: CanvasNodeColor;
  shape: CanvasNodeShape;
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
}

export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;
