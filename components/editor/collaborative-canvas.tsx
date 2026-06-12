"use client";

import React from "react";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import {
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { CanvasEdge, CanvasNode, CanvasNodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import { ShapePanel } from "../canvas/shape-panel";
import { CanvasNodeComponent } from "../canvas/nodes/canvas-node";

const nodeTypes = {
  canvasNode: CanvasNodeComponent,
};

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

  const reactFlow = useReactFlow();

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const insertShapeNode = React.useCallback(
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

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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

  const handleInsertShape = React.useCallback(
    (shape: CanvasNodeShape, width: number, height: number) => {
      const position = reactFlow.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      insertShapeNode(shape, width, height, position);
    },
    [reactFlow, insertShapeNode]
  );

  return (
    <div className="relative h-full w-full bg-base">
      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-base"
      >
        <MiniMap
          pannable
          zoomable
          className="overflow-hidden rounded-xl border border-default bg-surface/90"
          maskColor="rgba(8, 8, 9, 0.65)"
          nodeColor="var(--accent-primary)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="var(--border-subtle)"
        />
      </ReactFlow>
      <ShapePanel onInsertShape={handleInsertShape} />
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
