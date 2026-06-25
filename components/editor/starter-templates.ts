import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard microservices pattern featuring an API Gateway, authentication helper, service layer, and dedicated databases.",
    nodes: [
      {
        id: "gateway",
        type: "canvasNode",
        position: { x: 50, y: 150 },
        style: { width: 140, height: 60 },
        data: {
          label: "API Gateway",
          shape: "pill",
          color: NODE_COLORS[1], // Blue
        },
      },
      {
        id: "auth-service",
        type: "canvasNode",
        position: { x: 260, y: 50 },
        style: { width: 140, height: 60 },
        data: {
          label: "Auth Service",
          shape: "pill",
          color: NODE_COLORS[2], // Purple
        },
      },
      {
        id: "user-service",
        type: "canvasNode",
        position: { x: 260, y: 150 },
        style: { width: 140, height: 60 },
        data: {
          label: "User Service",
          shape: "pill",
          color: NODE_COLORS[7], // Teal
        },
      },
      {
        id: "order-service",
        type: "canvasNode",
        position: { x: 260, y: 250 },
        style: { width: 140, height: 60 },
        data: {
          label: "Order Service",
          shape: "pill",
          color: NODE_COLORS[3], // Orange
        },
      },
      {
        id: "user-db",
        type: "canvasNode",
        position: { x: 470, y: 145 },
        style: { width: 100, height: 70 },
        data: {
          label: "User DB",
          shape: "cylinder",
          color: NODE_COLORS[6], // Green
        },
      },
      {
        id: "order-db",
        type: "canvasNode",
        position: { x: 470, y: 245 },
        style: { width: 100, height: 70 },
        data: {
          label: "Order DB",
          shape: "cylinder",
          color: NODE_COLORS[6], // Green
        },
      },
    ],
    edges: [
      {
        id: "e-gw-auth",
        source: "gateway",
        target: "auth-service",
        type: "canvasEdge",
        data: {
          label: "verify",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-gw-user",
        source: "gateway",
        target: "user-service",
        type: "canvasEdge",
        data: {
          label: "route",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-gw-order",
        source: "gateway",
        target: "order-service",
        type: "canvasEdge",
        data: {
          label: "route",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-user-db",
        source: "user-service",
        target: "user-db",
        type: "canvasEdge",
        data: {
          label: "read/write",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-order-db",
        source: "order-service",
        target: "order-db",
        type: "canvasEdge",
        data: {
          label: "read/write",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A continuous integration and delivery pipeline showing source repositories, build agents, and target environments.",
    nodes: [
      {
        id: "code-repo",
        type: "canvasNode",
        position: { x: 50, y: 100 },
        style: { width: 120, height: 70 },
        data: {
          label: "Git Repository",
          shape: "hexagon",
          color: NODE_COLORS[2], // Purple
        },
      },
      {
        id: "build-server",
        type: "canvasNode",
        position: { x: 240, y: 100 },
        style: { width: 130, height: 70 },
        data: {
          label: "Build & Test",
          shape: "rectangle",
          color: NODE_COLORS[1], // Blue
        },
      },
      {
        id: "registry",
        type: "canvasNode",
        position: { x: 440, y: 100 },
        style: { width: 120, height: 70 },
        data: {
          label: "Registry",
          shape: "cylinder",
          color: NODE_COLORS[7], // Teal
        },
      },
      {
        id: "staging",
        type: "canvasNode",
        position: { x: 630, y: 45 },
        style: { width: 130, height: 60 },
        data: {
          label: "Staging Env",
          shape: "pill",
          color: NODE_COLORS[3], // Orange
        },
      },
      {
        id: "production",
        type: "canvasNode",
        position: { x: 630, y: 155 },
        style: { width: 130, height: 60 },
        data: {
          label: "Production Env",
          shape: "pill",
          color: NODE_COLORS[5], // Pink
        },
      },
    ],
    edges: [
      {
        id: "e-repo-build",
        source: "code-repo",
        target: "build-server",
        type: "canvasEdge",
        data: {
          label: "trigger",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-build-reg",
        source: "build-server",
        target: "registry",
        type: "canvasEdge",
        data: {
          label: "push image",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-reg-staging",
        source: "registry",
        target: "staging",
        type: "canvasEdge",
        data: {
          label: "auto-deploy",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-reg-prod",
        source: "registry",
        target: "production",
        type: "canvasEdge",
        data: {
          label: "approval gate",
          variant: "dashed",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "An asynchronous pipeline showcasing client event ingestion, message broker topic routing, and consumer processing.",
    nodes: [
      {
        id: "client-app",
        type: "canvasNode",
        position: { x: 50, y: 120 },
        style: { width: 80, height: 80 },
        data: {
          label: "Client App",
          shape: "circle",
          color: NODE_COLORS[1], // Blue
        },
      },
      {
        id: "ingestion",
        type: "canvasNode",
        position: { x: 190, y: 130 },
        style: { width: 140, height: 60 },
        data: {
          label: "Ingestion API",
          shape: "pill",
          color: NODE_COLORS[3], // Orange
        },
      },
      {
        id: "kafka",
        type: "canvasNode",
        position: { x: 395, y: 110 },
        style: { width: 130, height: 100 },
        data: {
          label: "Kafka Broker",
          shape: "hexagon",
          color: NODE_COLORS[4], // Red
        },
      },
      {
        id: "inventory-consumer",
        type: "canvasNode",
        position: { x: 590, y: 50 },
        style: { width: 150, height: 60 },
        data: {
          label: "Inventory Worker",
          shape: "pill",
          color: NODE_COLORS[7], // Teal
        },
      },
      {
        id: "notify-consumer",
        type: "canvasNode",
        position: { x: 590, y: 190 },
        style: { width: 150, height: 60 },
        data: {
          label: "Notification Worker",
          shape: "pill",
          color: NODE_COLORS[2], // Purple
        },
      },
    ],
    edges: [
      {
        id: "e-client-ingest",
        source: "client-app",
        target: "ingestion",
        type: "canvasEdge",
        data: {
          label: "POST /events",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-ingest-kafka",
        source: "ingestion",
        target: "kafka",
        type: "canvasEdge",
        data: {
          label: "produce",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-kafka-inv",
        source: "kafka",
        target: "inventory-consumer",
        type: "canvasEdge",
        data: {
          label: "consume",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
      {
        id: "e-kafka-notify",
        source: "kafka",
        target: "notify-consumer",
        type: "canvasEdge",
        data: {
          label: "consume",
          variant: "solid",
          arrowDirection: "source-to-target",
          connectionType: "straight",
        },
      },
    ],
  },
];
