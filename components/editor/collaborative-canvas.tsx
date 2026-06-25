"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useMutation,
} from "@liveblocks/react";
import { LiveObject, LiveMap } from "@liveblocks/client";
import { StarterTemplatesModal } from "./starter-templates-modal";
import { CanvasTemplate } from "./starter-templates";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  EdgeProps,
  EdgeLabelRenderer,
  EdgeChange,
} from "@xyflow/react";
import {
  AlertTriangle,
  Loader2,
  Ban,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Minus,
  Spline,
  Route,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { CanvasEdge, CanvasNode, CanvasNodeShape, CanvasEdgeData } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import { ShapePanel } from "../canvas/shape-panel";
import { CanvasNodeComponent } from "../canvas/nodes/canvas-node";
import { NodeShape } from "../canvas/nodes/node-shape";

interface XYPosition {
  x: number;
  y: number;
}

interface MiniNode {
  position: XYPosition;
  measured?: {
    width?: number;
    height?: number;
  };
  style?: {
    width?: number | string;
    height?: number | string;
  };
}

// Helper to calculate intersection between a node's bounding rectangle and a line
function getNodeIntersection(node: MiniNode, otherPoint: XYPosition): XYPosition {
  const w = node.measured?.width ?? (typeof node.style?.width === "number" ? node.style.width : 150);
  const h = node.measured?.height ?? (typeof node.style?.height === "number" ? node.style.height : 100);

  const cx = node.position.x + w / 2;
  const cy = node.position.y + h / 2;

  const dx = otherPoint.x - cx;
  const dy = otherPoint.y - cy;

  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  const tX = dx > 0 ? (w / 2) / dx : (-w / 2) / dx;
  const tY = dy > 0 ? (h / 2) / dy : (-h / 2) / dy;

  const t = Math.min(Math.abs(tX), Math.abs(tY));

  return {
    x: cx + dx * t,
    y: cy + dy * t,
  };
}

// Helper to generate a Cardinal Spline path
function getCardinalSplinePath(points: XYPosition[], tension: number = 0.5): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Duplicate points and add virtual start/end to compute tangents at boundaries
  const pts = [
    { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y },
    ...points,
    { x: 2 * points[points.length - 1].x - points[points.length - 2].x, y: 2 * points[points.length - 1].y - points[points.length - 2].y }
  ];

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * (1 - tension);
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * (1 - tension);

    const cp2x = p2.x - ((p3.x - p1.x) / 6) * (1 - tension);
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * (1 - tension);

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

// Helper to generate a polyline path
function getPolylinePath(points: XYPosition[]): string {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
}

// Helper to get midpoint of a polyline
function getPolylineMidpoint(points: XYPosition[]): XYPosition {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    lengths.push(len);
    totalLength += len;
  }

  const halfLength = totalLength / 2;
  let accumulated = 0;

  for (let i = 0; i < lengths.length; i++) {
    if (accumulated + lengths[i] >= halfLength) {
      const ratio = lengths[i] > 0 ? (halfLength - accumulated) / lengths[i] : 0;
      const p1 = points[i];
      const p2 = points[i + 1];
      return {
        x: p1.x + (p2.x - p1.x) * ratio,
        y: p1.y + (p2.y - p1.y) * ratio,
      };
    }
    accumulated += lengths[i];
  }

  return points[points.length - 1];
}

// Custom Edge Component that draws customizable lines between nodes
function CenterConnectionEdge({
  id,
  source,
  target,
  style,
  selected,
  data,
  onEdgesChange,
}: EdgeProps<CanvasEdge> & { onEdgesChange?: (changes: EdgeChange<CanvasEdge>[]) => void }) {
  const { getNode, getEdge, screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const sourceWidth =
    sourceNode.measured?.width ??
    (typeof sourceNode.style?.width === "number" ? sourceNode.style.width : 150);
  const sourceHeight =
    sourceNode.measured?.height ??
    (typeof sourceNode.style?.height === "number" ? sourceNode.style.height : 100);

  const targetWidth =
    targetNode.measured?.width ??
    (typeof targetNode.style?.width === "number" ? targetNode.style.width : 150);
  const targetHeight =
    targetNode.measured?.height ??
    (typeof targetNode.style?.height === "number" ? targetNode.style.height : 100);

  const sourceCenter = {
    x: sourceNode.position.x + sourceWidth / 2,
    y: sourceNode.position.y + sourceHeight / 2,
  };

  const targetCenter = {
    x: targetNode.position.x + targetWidth / 2,
    y: targetNode.position.y + targetHeight / 2,
  };

  const connectionType = data?.connectionType || "straight";
  const controlPoints = data?.controlPoints || [];
  const variant = data?.variant || "solid";
  const arrowDirection = data?.arrowDirection || "source-to-target"; // default to source-to-target per plan

  // Calculate curve midpoint once
  let mc = { x: 0, y: 0 };
  if (connectionType === "curve") {
    if (controlPoints.length > 0) {
      mc = controlPoints[0];
    } else {
      const mx = (sourceCenter.x + targetCenter.x) / 2;
      const my = (sourceCenter.y + targetCenter.y) / 2;
      const dx = targetCenter.x - sourceCenter.x;
      const dy = targetCenter.y - sourceCenter.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const offset = len > 0 ? Math.min(60, len * 0.25) : 0;
      const px = len > 0 ? (-dy / len) * offset : 0;
      const py = len > 0 ? (dx / len) * offset : 0;
      mc = { x: mx + px, y: my + py };
    }
  }

  // Calculate actual path endpoints at node boundaries
  let sx = sourceCenter.x;
  let sy = sourceCenter.y;
  let tx = targetCenter.x;
  let ty = targetCenter.y;

  if (connectionType === "flexible" && controlPoints.length > 0) {
    const startIntersect = getNodeIntersection(sourceNode, controlPoints[0]);
    sx = startIntersect.x;
    sy = startIntersect.y;

    const endIntersect = getNodeIntersection(targetNode, controlPoints[controlPoints.length - 1]);
    tx = endIntersect.x;
    ty = endIntersect.y;
  } else if (connectionType === "curve") {
    const startIntersect = getNodeIntersection(sourceNode, mc);
    sx = startIntersect.x;
    sy = startIntersect.y;

    const endIntersect = getNodeIntersection(targetNode, mc);
    tx = endIntersect.x;
    ty = endIntersect.y;
  } else {
    const startIntersect = getNodeIntersection(sourceNode, targetCenter);
    sx = startIntersect.x;
    sy = startIntersect.y;

    const endIntersect = getNodeIntersection(targetNode, sourceCenter);
    tx = endIntersect.x;
    ty = endIntersect.y;
  }

  // Draw the SVG path
  let edgePath = "";
  if (connectionType === "curve") {
    edgePath = getCardinalSplinePath([{ x: sx, y: sy }, mc, { x: tx, y: ty }], 0.5);
  } else if (connectionType === "flexible" && controlPoints.length > 0) {
    edgePath = getPolylinePath([{ x: sx, y: sy }, ...controlPoints, { x: tx, y: ty }]);
  } else {
    edgePath = `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  // Determine line coloring
  const isSelected = selected || false;
  const edgeColor = isSelected ? "var(--accent-primary)" : "#f8fafc";

  const pathStyle: React.CSSProperties = {
    stroke: edgeColor,
    strokeWidth: isSelected ? 2 : 1.5,
    fill: "none",
  };

  // Dash/Dot styling
  if (variant === "dotted") {
    pathStyle.strokeDasharray = "2 4";
    pathStyle.strokeLinecap = "round";
  } else if (variant === "dashed") {
    pathStyle.strokeDasharray = "8 5";
  }

  // Marker settings based on selection color and direction
  const markerSuffix = isSelected ? "-selected" : "-default";
  let markerStartUrl: string | undefined;
  let markerEndUrl: string | undefined;

  if (arrowDirection === "bidirectional") {
    markerStartUrl = `url(#arrow-start${markerSuffix})`;
    markerEndUrl = `url(#arrow-end${markerSuffix})`;
  } else if (arrowDirection === "source-to-target") {
    markerEndUrl = `url(#arrow-end${markerSuffix})`;
  } else if (arrowDirection === "target-to-source") {
    markerStartUrl = `url(#arrow-start${markerSuffix})`;
  }

  // Midpoint calculation for label positioning
  let labelX = 0;
  let labelY = 0;

  if (connectionType === "curve") {
    labelX = mc.x;
    labelY = mc.y;
  } else if (connectionType === "flexible" && controlPoints.length > 0) {
    const pts = [{ x: sx, y: sy }, ...controlPoints, { x: tx, y: ty }];
    const mid = getPolylineMidpoint(pts);
    labelX = mid.x;
    labelY = mid.y;
  } else {
    labelX = (sx + tx) / 2;
    labelY = (sy + ty) / 2;
  }

  // Pointer event handlers for path dragging
  const handlePathPointerDown = (event: React.PointerEvent) => {
    if (connectionType !== "flexible" && connectionType !== "curve") return;
    if (event.button !== 0) return; // Only left click

    event.stopPropagation();
    
    const startX = event.clientX;
    const startY = event.clientY;
    
    const clickPos = screenToFlowPosition({
      x: startX,
      y: startY,
    });

    let hasCreated = false;
    let createdIndex = -1;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const currentEdge = getEdge(id);
      if (!currentEdge || !onEdgesChange) return;

      if (!hasCreated) {
        // Drag threshold of 5px to distinguish drag from click/double-click
        if (dx * dx + dy * dy < 25) return;

        hasCreated = true;

        if (connectionType === "curve") {
          createdIndex = 0;
          const updatedEdge = {
            ...currentEdge,
            data: {
              ...currentEdge.data,
              controlPoints: [clickPos],
            },
          };
          onEdgesChange([{ type: "replace", id, item: updatedEdge }]);
        } else {
          const currentCPs = [...(currentEdge.data?.controlPoints || [])];
          const points = [{ x: sx, y: sy }, ...currentCPs, { x: tx, y: ty }];
          
          let closestSegmentIdx = 0;
          let minDistance = Infinity;

          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const segmentDx = p2.x - p1.x;
            const segmentDy = p2.y - p1.y;
            const segmentLenSq = segmentDx * segmentDx + segmentDy * segmentDy;

            let t = 0;
            if (segmentLenSq > 0) {
              t = ((clickPos.x - p1.x) * segmentDx + (clickPos.y - p1.y) * segmentDy) / segmentLenSq;
              t = Math.max(0, Math.min(1, t));
            }

            const projX = p1.x + t * segmentDx;
            const projY = p1.y + t * segmentDy;
            const distSq = (clickPos.x - projX) ** 2 + (clickPos.y - projY) ** 2;

            if (distSq < minDistance) {
              minDistance = distSq;
              closestSegmentIdx = i;
            }
          }

          createdIndex = closestSegmentIdx;
          const newControlPoints = [...currentCPs];
          newControlPoints.splice(createdIndex, 0, clickPos);

          const updatedEdge = {
            ...currentEdge,
            data: {
              ...currentEdge.data,
              controlPoints: newControlPoints,
            },
          };
          onEdgesChange([{ type: "replace", id, item: updatedEdge }]);
        }
      } else {
        const newPos = screenToFlowPosition({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });

        const currentPoints = [...(currentEdge.data?.controlPoints || [])];
        if (currentPoints[createdIndex]) {
          currentPoints[createdIndex] = { x: newPos.x, y: newPos.y };
        }
        const updatedEdge = {
          ...currentEdge,
          data: {
            ...currentEdge.data,
            controlPoints: currentPoints,
          },
        };
        onEdgesChange([{ type: "replace", id, item: updatedEdge }]);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleControlPointPointerDown = (event: React.PointerEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.button !== 0) return;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const currentEdge = getEdge(id);
      if (!currentEdge || !onEdgesChange) return;

      const newPos = screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });

      const currentPoints = [...(currentEdge.data?.controlPoints || [])];
      currentPoints[index] = { x: newPos.x, y: newPos.y };
      const updatedEdge = {
        ...currentEdge,
        data: {
          ...currentEdge.data,
          controlPoints: currentPoints,
        },
      };
      onEdgesChange([{ type: "replace", id, item: updatedEdge }]);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleControlPointDoubleClick = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();

    const currentEdge = getEdge(id);
    if (!currentEdge || !onEdgesChange) return;

    const currentPoints = [...(currentEdge.data?.controlPoints || [])];
    
    let updatedPoints = currentPoints;
    if (connectionType === "curve") {
      updatedPoints = [];
    } else {
      updatedPoints.splice(index, 1);
    }

    const updatedEdge = {
      ...currentEdge,
      data: {
        ...currentEdge.data,
        controlPoints: updatedPoints,
      },
    };
    onEdgesChange([{ type: "replace", id, item: updatedEdge }]);
  };

  return (
    <>
      <g className="react-flow__edge">
        {/* Render visible path line */}
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          style={{
            ...pathStyle,
            ...style,
          }}
          markerStart={markerStartUrl}
          markerEnd={markerEndUrl}
        />
        {/* Wider transparent interactive helper path for easier click/drag selection */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={15}
          className="react-flow__edge-interaction cursor-pointer"
          onPointerDown={handlePathPointerDown}
        />
        {/* Render control point handles when selected in flexible or curve mode */}
        {isSelected && (connectionType === "flexible" || connectionType === "curve") && (
          connectionType === "curve" ? (
            <circle
              cx={mc.x}
              cy={mc.y}
              r={5}
              fill="#00c8d4"
              stroke="var(--bg-base)"
              strokeWidth={2}
              className="cursor-move hover:scale-125 hover:fill-[#00e1f0] transition-all duration-75 nodrag nopan"
              onPointerDown={(e) => handleControlPointPointerDown(e, 0)}
              onDoubleClick={(e) => handleControlPointDoubleClick(e, 0)}
            />
          ) : (
            controlPoints.map((cp, idx) => (
              <circle
                key={idx}
                cx={cp.x}
                cy={cp.y}
                r={5}
                fill="#00c8d4"
                stroke="var(--bg-base)"
                strokeWidth={2}
                className="cursor-move hover:scale-125 hover:fill-[#00e1f0] transition-all duration-75 nodrag nopan"
                onPointerDown={(e) => handleControlPointPointerDown(e, idx)}
                onDoubleClick={(e) => handleControlPointDoubleClick(e, idx)}
              />
            ))
          )
        )}
      </g>

      {/* Render text label if text value is set */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              color: edgeColor,
            }}
            className="nodrag nopan select-none bg-[#080809]/80 px-2 py-1 rounded border border-default text-xs font-mono font-medium tracking-wide shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

// edgeTypes is memoized inside LiveblocksCanvas using useMemo to capture onEdgesChange

interface CollaborativeCanvasProps {
  roomId: string;
}

interface CanvasErrorBoundaryProps {
  children: React.ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <CanvasConnectionError />;
    }

    return this.props.children;
  }
}

export function CollaborativeCanvas({ roomId }: CollaborativeCanvasProps) {
  return (
    <main className="flex-1 relative bg-base overflow-hidden">
      <CanvasErrorBoundary>
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
          <RoomProvider
            id={roomId}
            initialPresence={{ cursor: null, isThinking: false }}
          >
            <ClientSideSuspense fallback={<CanvasLoadingState />}>
              <ReactFlowProvider>
                <LiveblocksCanvas />
              </ReactFlowProvider>
            </ClientSideSuspense>
          </RoomProvider>
        </LiveblocksProvider>
      </CanvasErrorBoundary>
    </main>
  );
}

function LiveblocksCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const { zoom } = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);

  const importTemplate = useMutation(
    ({ storage }, templateNodes: CanvasNode[], templateEdges: CanvasEdge[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let flow = (storage as any).get("flow");
      if (!flow) {
        flow = new LiveObject({
          nodes: new LiveMap(),
          edges: new LiveMap(),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (storage as any).set("flow", flow);
      }

      const nodesMap = flow.get("nodes");
      const edgesMap = flow.get("edges");

      if (nodesMap) {
        // Clear all existing nodes first
        for (const key of Array.from(nodesMap.keys())) {
          nodesMap.delete(key);
        }
        for (const node of templateNodes) {
          const cleanNode = {
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
            style: node.style,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nodesMap.set(node.id, new LiveObject(cleanNode as any) as any);
        }
      }

      if (edgesMap) {
        // Clear all existing edges first
        for (const key of Array.from(edgesMap.keys())) {
          edgesMap.delete(key);
        }
        for (const edge of templateEdges) {
          const cleanEdge = {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            data: edge.data,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          edgesMap.set(edge.id, new LiveObject(cleanEdge as any) as any);
        }
      }
    },
    []
  );

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      // Map old IDs to new unique IDs client-side to prevent collisions and support multiple imports
      const idMap = new Map<string, string>();
      
      const newNodes = template.nodes.map((node) => {
        const newId = `${node.id}_${crypto.randomUUID().slice(0, 8)}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
        };
      });

      const newEdges = template.edges.map((edge) => {
        const newId = crypto.randomUUID();
        return {
          ...edge,
          id: newId,
          source: idMap.get(edge.source) || edge.source,
          target: idMap.get(edge.target) || edge.target,
        };
      });

      // Call mutation to append nodes and edges
      importTemplate(newNodes, newEdges);

      // Short delay to allow React Flow to register and measure the new nodes before selecting and fitting view
      setTimeout(() => {
        const newNodeIds = new Set(newNodes.map((n) => n.id));
        
        // Select all newly imported nodes and deselect existing ones
        reactFlow.setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: newNodeIds.has(n.id),
          }))
        );

        // Fit view focusing precisely on the newly imported nodes
        reactFlow.fitView({
          nodes: newNodes.map((n) => ({ id: n.id })),
          duration: 300,
          padding: 0.2,
        });
      }, 150);
    },
    [importTemplate, reactFlow]
  );

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    reactFlow,
    undo,
    redo,
  });

  const edgeTypes = useMemo(
    () => ({
      canvasEdge: (props: EdgeProps<CanvasEdge>) => (
        <CenterConnectionEdge {...props} onEdgesChange={onEdgesChange} />
      ),
    }),
    [onEdgesChange]
  );

  const [draggedShape, setDraggedShape] = useState<{
    shape: CanvasNodeShape;
    width: number;
    height: number;
  } | null>(null);

  const [dragPosition, setDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Connecting mode states
  const [isConnectingMode, setIsConnectingMode] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [tempLineStart, setTempLineStart] = useState<{ x: number; y: number } | null>(null);

  // Edge Settings Dialog state
  const [edgeDialog, setEdgeDialog] = useState<{
    edgeId: string;
    x: number;
    y: number;
  } | null>(null);

  const handleEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: CanvasEdge) => {
      event.preventDefault();
      event.stopPropagation();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      let targetX = clickX;
      let targetY = clickY;

      // Pan canvas down if dialog is too close to the top boundary
      if (clickY < 320) {
        const panY = 320 - clickY;
        const viewport = reactFlow.getViewport();
        reactFlow.setViewport({
          ...viewport,
          y: viewport.y + panY,
        });
        targetY = 320;
      }

      // Bounding horizontal positioning to keep dialog within screen limits
      if (clickX < 150) {
        const panX = 150 - clickX;
        const viewport = reactFlow.getViewport();
        reactFlow.setViewport({
          ...viewport,
          x: viewport.x + panX,
        });
        targetX = 150;
      } else if (clickX > rect.width - 150) {
        const panX = (rect.width - 150) - clickX;
        const viewport = reactFlow.getViewport();
        reactFlow.setViewport({
          ...viewport,
          x: viewport.x + panX,
        });
        targetX = rect.width - 150;
      }

      setEdgeDialog({
        edgeId: edge.id,
        x: targetX,
        y: targetY,
      });
    },
    [reactFlow]
  );

  const handleUpdateEdge = useCallback(
    (edgeId: string, updates: Partial<CanvasEdgeData>) => {
      const currentEdge = reactFlow.getEdge(edgeId);
      if (currentEdge && onEdgesChange) {
        const updatedEdge = {
          ...currentEdge,
          data: {
            ...currentEdge.data,
            ...updates,
          },
        };
        onEdgesChange([{ type: "replace", id: edgeId, item: updatedEdge }]);
      }
    },
    [reactFlow, onEdgesChange]
  );

  const selectedNode = nodes.find((n) => n.selected);
  const hasSelectedNode = !!selectedNode;

  const handleDragStart = useCallback((shape: CanvasNodeShape, width: number, height: number) => {
    setDraggedShape({ shape, width, height });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedShape(null);
    setDragPosition(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    // Only clear if the cursor leaves the boundaries of the container
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragPosition(null);
    }
  }, []);

  const insertShapeNode = useCallback(
    (shape: CanvasNodeShape, width: number, height: number, position: { x: number; y: number }) => {
      const newNodeId = crypto.randomUUID();
      const newNode: CanvasNode = {
        id: newNodeId,
        type: "canvasNode",
        position,
        style: { width, height },
        data: {
          label: "",
          shape,
          color: DEFAULT_NODE_COLOR,
        },
      };
      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Clear drag states immediately
      setDraggedShape(null);
      setDragPosition(null);

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      let shapeData: { shape: CanvasNodeShape; width: number; height: number };
      try {
        shapeData = JSON.parse(type) as { shape: CanvasNodeShape; width: number; height: number };
      } catch {
        return;
      }

      if (
        !shapeData ||
        typeof shapeData !== "object" ||
        typeof shapeData.shape !== "string" ||
        typeof shapeData.width !== "number" ||
        typeof shapeData.height !== "number"
      ) {
        return;
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      insertShapeNode(shapeData.shape, shapeData.width, shapeData.height, position);
    },
    [reactFlow, insertShapeNode]
  );

  const handleInsertShape = useCallback(
    (shape: CanvasNodeShape, width: number, height: number) => {
      const position = reactFlow.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      insertShapeNode(shape, width, height, position);
    },
    [reactFlow, insertShapeNode]
  );

  // Connecting mode handlers
  const handleToggleConnectingMode = useCallback(() => {
    if (isConnectingMode) {
      setIsConnectingMode(false);
      setSourceNodeId(null);
      setMousePosition(null);
      setTempLineStart(null);
    } else if (hasSelectedNode && selectedNode) {
      setIsConnectingMode(true);
      setSourceNodeId(selectedNode.id);
    }
  }, [isConnectingMode, hasSelectedNode, selectedNode]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isConnectingMode || !sourceNodeId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate coordinates for the source node center dynamically in this handler to avoid ref access during rendering
      const sNode = reactFlow.getNode(sourceNodeId);
      if (sNode) {
        const sWidth =
          sNode.measured?.width ??
          (typeof sNode.style?.width === "number" ? sNode.style.width : 150);
        const sHeight =
          sNode.measured?.height ??
          (typeof sNode.style?.height === "number" ? sNode.style.height : 100);

        const centerX = sNode.position.x + sWidth / 2;
        const centerY = sNode.position.y + sHeight / 2;

        const screenPos = reactFlow.flowToScreenPosition({ x: centerX, y: centerY });
        setTempLineStart({
          x: screenPos.x - rect.left,
          y: screenPos.y - rect.top,
        });
      }

      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [isConnectingMode, sourceNodeId, reactFlow]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: CanvasNode) => {
      if (isConnectingMode && sourceNodeId) {
        if (node.id !== sourceNodeId) {
          const sourceNodeExists = nodes.some((n) => n.id === sourceNodeId);
          const targetNodeExists = nodes.some((n) => n.id === node.id);
          
          if (sourceNodeExists && targetNodeExists) {
            const newEdgeId = crypto.randomUUID();
            const newEdge: CanvasEdge = {
              id: newEdgeId,
              source: sourceNodeId,
              target: node.id,
              type: "canvasEdge",
            };
            onEdgesChange([{ type: "add", item: newEdge }]);
          }
        }
        setIsConnectingMode(false);
        setSourceNodeId(null);
        setMousePosition(null);
        setTempLineStart(null);
      }
    },
    [isConnectingMode, sourceNodeId, nodes, onEdgesChange]
  );

  const handlePaneClick = useCallback(() => {
    if (isConnectingMode) {
      setIsConnectingMode(false);
      setSourceNodeId(null);
      setMousePosition(null);
      setTempLineStart(null);
    }
  }, [isConnectingMode]);

  // Handle global escape key to cancel connection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isConnectingMode) {
        setIsConnectingMode(false);
        setSourceNodeId(null);
        setMousePosition(null);
        setTempLineStart(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConnectingMode]);

  const activeEdge = edgeDialog ? edges.find((e) => e.id === edgeDialog.edgeId) : null;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full bg-base ${
        isConnectingMode ? "cursor-crosshair" : ""
      }`}
      onDragLeave={onDragLeave}
      onMouseMove={handleMouseMove}
    >
      {/* SVG Marker Definitions for Connection Line Arrowheads */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          {/* Default (unselected) arrowhead pointing to target */}
          <marker
            id="arrow-end-default"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f8fafc" />
          </marker>
          {/* Default (unselected) arrowhead pointing to source */}
          <marker
            id="arrow-start-default"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f8fafc" />
          </marker>
          {/* Selected arrowhead pointing to target */}
          <marker
            id="arrow-end-selected"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-primary)" />
          </marker>
          {/* Selected arrowhead pointing to source */}
          <marker
            id="arrow-start-selected"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-primary)" />
          </marker>
        </defs>
      </svg>

      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ type: "canvasEdge" }}
        fitView
        className="bg-base"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="var(--border-subtle)"
        />
      </ReactFlow>
      <ShapePanel
        onInsertShape={handleInsertShape}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isConnectingMode={isConnectingMode}
        onToggleConnectingMode={handleToggleConnectingMode}
        hasSelectedNode={hasSelectedNode}
      />
      <StarterTemplatesModal onImport={handleImportTemplate} />

      {/* Canvas Ergonomics Floating Control Bar */}
      <div className="absolute bottom-20 left-6 flex items-center gap-1.5 rounded-full border border-default/70 bg-surface/90 px-3 py-1.5 shadow-xl shadow-black/20 backdrop-blur-md z-20 select-none">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => reactFlow.zoomOut({ duration: 300 })}
            className="flex h-8 w-8 items-center justify-center rounded-full text-copy-muted hover:text-brand hover:bg-accent-dim transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => reactFlow.fitView({ duration: 300 })}
            className="flex h-8 w-8 items-center justify-center rounded-full text-copy-muted hover:text-brand hover:bg-accent-dim transition-colors"
            title="Fit View"
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button
            onClick={() => reactFlow.zoomIn({ duration: 300 })}
            className="flex h-8 w-8 items-center justify-center rounded-full text-copy-muted hover:text-brand hover:bg-accent-dim transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-default/70 mx-1" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              canUndo
                ? "text-copy-muted hover:text-brand hover:bg-accent-dim cursor-pointer"
                : "text-faint cursor-not-allowed opacity-40"
            }`}
            title="Undo (Cmd/Ctrl + Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              canRedo
                ? "text-copy-muted hover:text-brand hover:bg-accent-dim cursor-pointer"
                : "text-faint cursor-not-allowed opacity-40"
            }`}
            title="Redo (Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Temporary dashed line showing connection being drawn */}
      {isConnectingMode && tempLineStart && mousePosition && (
        <svg className="absolute inset-0 pointer-events-none z-50 w-full h-full">
          <line
            x1={tempLineStart.x}
            y1={tempLineStart.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="var(--accent-primary)"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        </svg>
      )}

      {draggedShape && dragPosition && (
        <div
          style={{
            position: "absolute",
            left: dragPosition.x,
            top: dragPosition.y,
            width: draggedShape.width * zoom,
            height: draggedShape.height * zoom,
            pointerEvents: "none",
            zIndex: 1000,
            opacity: 0.6,
          }}
        >
          <NodeShape
            shape={draggedShape.shape}
            color={DEFAULT_NODE_COLOR}
            selected={false}
          />
        </div>
      )}

      {edgeDialog && activeEdge && (
        <EdgeSettingsDialog
          edge={activeEdge}
          x={edgeDialog.x}
          y={edgeDialog.y}
          onClose={() => setEdgeDialog(null)}
          onUpdateEdge={handleUpdateEdge}
        />
      )}
    </div>
  );
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base text-copy-muted">
      <div className="flex items-center gap-2 rounded-full border border-default bg-surface px-4 py-2 text-sm shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-brand" />
        Loading collaborative canvas…
      </div>
    </div>
  );
}

function CanvasConnectionError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base p-6 text-center">
      <div className="max-w-sm rounded-3xl border border-state-error/20 bg-surface p-6 shadow-sm">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-state-error/10 text-state-error">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-medium text-copy-primary">
          Canvas connection failed
        </h2>
        <p className="mt-2 text-sm leading-6 text-copy-muted">
          We couldn&apos;t connect to the Liveblocks room for this workspace.
          Try refreshing the page in a moment.
        </p>
      </div>
    </div>
  );
}

interface EdgeSettingsDialogProps {
  edge: CanvasEdge;
  x: number;
  y: number;
  onClose: () => void;
  onUpdateEdge: (edgeId: string, updates: Partial<CanvasEdgeData>) => void;
}

function EdgeSettingsDialog({
  edge,
  x,
  y,
  onClose,
  onUpdateEdge,
}: EdgeSettingsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const data = edge.data || {};
  const currentLabel = data.label || "";
  const currentVariant = data.variant || "solid";
  const currentDirection = data.arrowDirection || "source-to-target";
  const currentType = data.connectionType || "straight";

  // Click outside listener in capture phase
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [onClose]);

  // Keydown listener for Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const variants = [
    {
      id: "solid",
      label: "Solid",
      icon: (
        <svg className="w-full h-2 text-current" viewBox="0 0 40 8" fill="none">
          <line x1="0" y1="4" x2="40" y2="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "dotted",
      label: "Dotted",
      icon: (
        <svg className="w-full h-2 text-current" viewBox="0 0 40 8" fill="none">
          <line x1="0" y1="4" x2="40" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="1 3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "dashed",
      label: "Dashed",
      icon: (
        <svg className="w-full h-2 text-current" viewBox="0 0 40 8" fill="none">
          <line x1="0" y1="4" x2="40" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
        </svg>
      ),
    },
  ] as const;

  const directions = [
    { id: "none", label: "None", icon: <Ban className="h-4 w-4" /> },
    { id: "source-to-target", label: "Forward", icon: <ArrowRight className="h-4 w-4" /> },
    { id: "target-to-source", label: "Reverse", icon: <ArrowLeft className="h-4 w-4" /> },
    { id: "bidirectional", label: "Both", icon: <ArrowLeftRight className="h-4 w-4" /> },
  ] as const;

  const types = [
    { id: "straight", label: "Straight", icon: <Minus className="h-4 w-4" /> },
    { id: "curve", label: "Curve", icon: <Spline className="h-4 w-4" /> },
    { id: "flexible", label: "Flexible", icon: <Route className="h-4 w-4" /> },
  ] as const;

  return (
    <div
      ref={dialogRef}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -100%) translateY(-12px)",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
      className="w-[280px] bg-elevated/95 border border-default p-4 backdrop-blur-md rounded-3xl text-sm font-sans text-primary shadow-2xl flex flex-col gap-3 nodrag nopan select-none"
    >
      <div>
        <label className="text-xs font-semibold text-copy-muted block mb-1.5 uppercase tracking-wider">
          Label Name
        </label>
        <input
          type="text"
          value={currentLabel}
          onChange={(e) => onUpdateEdge(edge.id, { label: e.target.value })}
          placeholder="e.g. data stream"
          className="w-full bg-subtle border border-default rounded-xl px-3 py-1.5 text-xs text-copy-primary focus:outline-none focus:border-brand transition-colors placeholder:text-copy-faint"
          autoFocus
        />
      </div>

      <div className="border-t border-default/40" />

      <div>
        <label className="text-xs font-semibold text-copy-muted block mb-1.5 uppercase tracking-wider">
          Line Style
        </label>
        <div className="grid grid-cols-3 gap-1 bg-subtle p-0.5 rounded-xl border border-default">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onUpdateEdge(edge.id, { variant: v.id })}
              title={v.label}
              aria-label={v.label}
              className={`flex items-center justify-center py-2 px-1 rounded-lg transition-all border ${
                currentVariant === v.id
                  ? "bg-elevated text-brand border-default shadow-sm"
                  : "text-copy-muted border-transparent hover:text-copy-primary hover:bg-elevated/50"
              }`}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-default/40" />

      <div>
        <label className="text-xs font-semibold text-copy-muted block mb-1.5 uppercase tracking-wider">
          Arrow Direction
        </label>
        <div className="grid grid-cols-4 gap-1 bg-subtle p-0.5 rounded-xl border border-default">
          {directions.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onUpdateEdge(edge.id, { arrowDirection: d.id })}
              title={d.label}
              aria-label={d.label}
              className={`flex items-center justify-center py-1.5 rounded-lg transition-all border ${
                currentDirection === d.id
                  ? "bg-elevated text-brand border-default shadow-sm"
                  : "text-copy-muted border-transparent hover:text-copy-primary hover:bg-elevated/50"
              }`}
            >
              {d.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-default/40" />

      <div>
        <label className="text-xs font-semibold text-copy-muted block mb-1.5 uppercase tracking-wider">
          Routing Path
        </label>
        <div className="grid grid-cols-3 gap-1 bg-subtle p-0.5 rounded-xl border border-default">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const updates: Partial<CanvasEdgeData> = { connectionType: t.id };
                if (t.id === "flexible" && !data.controlPoints) {
                  updates.controlPoints = [];
                }
                onUpdateEdge(edge.id, updates);
              }}
              title={t.label}
              aria-label={t.label}
              className={`flex items-center justify-center py-1.5 rounded-lg transition-all border ${
                currentType === t.id
                  ? "bg-elevated text-brand border-default shadow-sm"
                  : "text-copy-muted border-transparent hover:text-copy-primary hover:bg-elevated/50"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
