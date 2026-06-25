# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 4: Collaborative Canvas (Liveblocks & React Flow integration)

## Current Goal
 
- Implement AI architecture generation from prompts using a durable background task (Trigger.dev integration).
 
## Completed

- Collaborative Canvas Refinements & Bug Fixes:
  - Wrapped Clerk `currentUser()` API call in `lib/project-access.ts` (`getCurrentIdentity`) in a `try/catch` block to handle transient Clerk network/API errors gracefully without crashing request handlers with 500 errors.
  - Updated keyboard shortcuts in `hooks/useKeyboardShortcuts.ts` to only intercept `+`, `=`, and `-` zoom keys when the modifier keys (Cmd/Ctrl) are not held down, keeping browser-native zoom functional.
  - Strongly typed `ReactFlowInstance` inside `hooks/useKeyboardShortcuts.ts` using concrete `CanvasNode` and `CanvasEdge` types to replace the generic `any` types.
  - Replaced the fragile 150ms timeout delay in the template import viewport focus (`fitView` and node selection) flow with a robust React `useEffect` hook that waits for all imported nodes to be mounted and measured by React Flow.
  - Removed the debug page `view-images.html` from the workspace.

- Starter System Designs (`18-starter-template.md` & `current-issues.md` refinements):
  - Created `components/editor/starter-templates.ts` to define types and library data for three static layouts (Microservices Architecture, CI/CD Pipeline, Event-Driven System).
  - Created `components/editor/starter-templates-context.tsx` to share modal opening/closing state between `EditorNavbar` and `CollaborativeCanvas`.
  - Refactored `components/editor/starter-templates-modal.tsx` to expand the modal width (`max-w-5xl w-full`) preventing squishing. Re-ordered the card layouts to place the template diagram preview at the top of the cards above titles and descriptions (eliminating description text truncation). Set header title to "Import Template" and removed sparkles.
  - Modified `components/editor/editor-shell.tsx` to wrap the editor in the starter templates context provider.
  - Modified `components/editor/editor-navbar.tsx` to add a new "Templates" button next to "Share" / "AI" controls when a project is active.
  - Modified `components/editor/collaborative-canvas.tsx` to render the templates modal and implemented `importTemplate` Liveblocks mutation to append the new nodes and edges maps into existing storage.
  - Refactored `handleImportTemplate` in `collaborative-canvas.tsx` to map node and edge IDs to unique values client-side to prevent ID collisions, select all newly imported nodes on load, and fit the React Flow viewport specifically around the imported group.
  - Verified compilation and strict lint checks across all added/modified components.
- Boilerplate cleanup (globals.css, public directory SVGs, page.tsx layout).
- Design system and UI primitive components implementation (`01-design-system.md`).
- Base Editor Chrome & Sidebar Layout (`02-editor.md`):
  - Created `EditorNavbar` with sidebar toggle logic.
  - Created floating `ProjectSidebar` with project/shared tabs and empty states.
  - Aligned shadcn Dialog component to the standard `rounded-3xl` border radius.
  - Integrated and validated components interactively in `app/page.tsx`.
  - Added accessibility support (`aria-hidden` and `inert`) to `ProjectSidebar` to prevent keyboard/screen-reader navigation when closed.
- Environment & Dependency Maintenance:
  - Upgraded Node.js to v26.0.0 via Homebrew and npm to v11.12.1.
  - Added package overrides to pin `postcss` to a secure version (`^8.5.10`) to resolve vulnerabilities without breaking Next.js.
  - Ran a safe `npm update` and verified full build and lint compliance.
- Clerk Authentication & Routes (`03-auth.md`):
  - Installed `@clerk/nextjs` and `@clerk/ui`.
  - Added Clerk redirection mapping variables to `.env.local`.
  - Configured `proxy.ts` (Next.js 16 middleware) to secure routes by default.
  - Wrapped root layout with `ClerkProvider`, customizing the appearance using dark theme properties mapped directly to our CSS variables.
  - Created customized, responsive two-panel sign-in and sign-up routes.
  - Extracted duplicated two-panel layout markup into a reusable `AuthShell` component to avoid copy-pasting layouts.
  - Relocated the mock editor workspace/showcase layout to the protected `/editor` page.
  - Set up server-side auth check on the root page `/` to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
  - Embedded Clerk's `<UserButton />` in the `EditorNavbar` component.
- Project Dialogs & Sidebar Actions (`04-project-dialogs.md`):
  - Built custom hook `useProjectDialogs` to handle in-memory project array, active projects, live slug previews, form validation, and mock loading delays.
  - Replaced editor page placeholder showcase widgets with the minimal `/editor` landing screen and active project workspace display.
  - Implemented Create, Rename, and Delete shadcn Dialog modal overlays utilizing standardized `rounded-3xl` styling.
  - Upgraded `ProjectSidebar` to render lists of projects under the respective owned/shared tabs with action buttons (rename/delete) visible only on owned items.
  - Positioned a backdrop scrim overlay for mobile layouts that closes the projects sidebar on external clicks.
  - Validated full codebase with a clean `npm run build` and `npm run lint`.
  - Refined the Content Tabs design in `ProjectSidebar` to match the capsule/pill-shaped segmented control reference design:
    - Updated `TabsList` and `TabsTrigger` to fully rounded `rounded-full` capsule shapes.
    - Integrated Lucide icons (`FolderKanban` and `Share2`) into the tabs with smooth color transition animations.
    - Styled the active tab with an elevated background (`bg-subtle`), subtle borders, custom drop-shadow, and highlighted the icon with the brand's cyan accent color (`text-brand`).
    - Fixed triggers alignment and vertical padding overflow by defining a fixed height (`h-9`) on the `TabsList` container and making the triggers fill it cleanly (`h-full`).
  - Added `suppressHydrationWarning` to the `<html>` element in root `RootLayout` ([layout.tsx](file:///Users/marvanmiri/Desktop/ghost_ai/app/layout.tsx)) to resolve hydration mismatch warnings caused by browser extensions (e.g. Grammarly adding custom data attributes to the `<body>` element).
  - Prisma Database Integration & Models Setup (`05-prisma.md`):
    - Defined `Project` and `ProjectCollaborator` relational schema with cascade deletes, custom indexes, and status enums in `prisma/models/project.prisma`.
    - Created `lib/prisma.ts` as a cached singleton, configuring dynamic resolution of the datasource between Accelerate (`prisma+postgres://` / `prisma+postgress://`) and direct SQL adapter connection using `@prisma/adapter-pg` and `pg.Pool`.
    - Aligned `prisma` devDependency to `7.8.0` to match `@prisma/client`.
    - Fixed schema compatibility for Prisma v7 by removing deprecated `url` parameters from `prisma/schema.prisma` and legacy `engine: "classic"` from `prisma.config.ts`.
    - Generated the typed Prisma Client under `app/generated/prisma/` and executed database migration.
  - Backend Project API Routes (`06-project-apis.md`):
    - Created `GET /api/projects` endpoint to list the current user's projects (retrieved using the Clerk user ID for owned projects, and Clerk email address matching for collaborative projects).
    - Created `POST /api/projects` endpoint to create a project, defaulting missing/empty names to `"Untitled Project"` and using UUIDs for primary keys.
    - Created `PATCH /api/projects/[projectId]` endpoint to rename a project with strict owner verification checks.
    - Created `DELETE /api/projects/[projectId]` endpoint to delete a project (and cascadingly delete collaborators) with strict owner verification checks.
    - Configured centralized middleware handling in `proxy.ts` to return programmatic JSON `401 Unauthorized` status for unauthenticated API requests instead of page redirects.
  - Wire Editor Home & Dialogs to API (`07-wire-editor-home.md`):
    - Extracted server-side helper `lib/projects.ts` to fetch user's projects.
    - Updated `POST /api/projects` endpoint to accept optional `id` parameter.
    - Created `hooks/useProjectActions.ts` hook for dialog states, short suffix generation, room ID slugification, and API mutation requests (POST, PATCH, DELETE).
    - Extracted common editor layout into `components/editor/editor-shell.tsx` client component.
    - Converted `/editor` index route (`app/editor/page.tsx`) to a Server Component.
    - Added dynamic workspace page at `/editor/[projectId]` (`app/editor/[projectId]/page.tsx`).
    - Fixed project renaming to update the project ID/slug dynamically (preserving the unique suffix) and cascade the update in the database.
    - Configured client-side redirection to push browser navigation to the new workspace URL (`/editor/[newProjectId]`) upon renaming the active project.
    - Verified complete build and TypeScript checking is fully passing.
  - Code improvements and bug fixes:
    - Fixed error handling on project rename (`PATCH /api/projects/[projectId]`) to catch unique ID conflicts and return a 409 Conflict response.
    - Updated project creation (`POST /api/projects`) to stop accepting client-side controlled primary key IDs and return 400 Bad Request on JSON parse failures.
    - Updated `useProjectActions.ts` client hook to not pass custom client-side project IDs, encode dynamic route parameters in pushes/replaces, and strongly type catch errors.
    - Updated Accelerate protocol checks in `lib/prisma.ts` to consistently match `prisma+postgres://`.
    - Added `emailNormalized` field, unique constraint, and index on `ProjectCollaborator` model to enable case-insensitive identity lookups, and successfully generated/applied DB migrations.
    - Corrected the `07-wire-editor-home.md` spec document to match the single Project[] sidebar data contract.
    - Fixed Next.js build optimization hanging by restoring `allowExitOnIdle: true` and `idleTimeoutMillis: 1000` to the pg pool connection options in `lib/prisma.ts`.
  - Editor Workspace Shell (`08-editor-workspace-shell.md`):
    - Created `components/editor/access-denied.tsx` with centered layout, lock icon, and back link.
    - Extracted identity and access checking logic into `lib/project-access.ts` to enforce server-side rules.
    - Configured `app/editor/[projectId]/page.tsx` as a Server Component handling unauthorized access/redirects to `/sign-in` and missing projects to `AccessDenied`.
    - Updated `EditorNavbar` inside `EditorShell` to receive and display the active project context, including Share and Sparkle AI toggle placeholders.
  - Project Share Dialog (`09-share-dialog.md`):
    - Implemented Backend Collaborators API route (`app/api/projects/[projectId]/collaborators/route.ts`) supporting GET (list and Clerk-enrich), POST (invite and access checks), and DELETE (remove).
    - Integrated Clerk Backend SDK using direct client instantiation to resolve collaborator names and avatars.
    - Created reusable `useCollaborators` client hook to manage collaborator data queries and API requests.
    - Built premium `ShareDialog` component with `rounded-3xl` modal styles, copy links with 2-second visual clipboard feedback, and initials-avatar fallbacks.
    - Integrated ShareDialog triggers into Editor Navbar and Shell.
  - Liveblocks Setup (`10-liveblocks-setup.md`):
    - Added `@liveblocks/node` for server-side Liveblocks room and token APIs.
    - Configured `liveblocks.config.ts` with typed realtime presence (`cursor`, `isThinking`) and user metadata (`name`, `avatar`, `color`).
    - Created cached Liveblocks Node client infrastructure in `lib/liveblocks.ts`.
    - Added deterministic user cursor color mapping from Clerk user IDs using a fixed palette.
    - Created `POST /api/liveblocks-auth` to require Clerk authentication, verify project access, use the project ID as the room ID, create the room if needed, ensure the verified user has room write access, and return a Liveblocks identity token with user metadata.
  - Collaborative Canvas Foundation (`11-bsse-canvas.md`):
    - Added the initial Liveblocks-backed React Flow canvas foundation, including visible empty-canvas chrome.
  - Canvas Shape Panel (`12-shape-panel.md`):
    - Added a floating pill-shaped toolbar at the bottom-center of the canvas.
    - Added draggable icon buttons for rectangle, diamond, circle, pill, cylinder, and hexagon shapes.
    - Implemented drag payload with shape name and default size.
    - Added dragover and drop handling to the ReactFlow instance.
    - On drop, converted screen position to canvas coordinates and created live collaborative nodes.
    - Generated node IDs using shape name, timestamp, and a counter.
    - Created a basic renderer for the custom `canvasNode` type.
- Node Resizing, Inline Label Editing, and Node Connectivity (`14-node-editing.md`):
  - Integrated React Flow `<NodeResizer>` controls inside `CanvasNodeComponent` visible when selected, configured with constraints (`minWidth={80}`, `minHeight={60}`).
  - Built inline double-click label editing utilizing an overlay textarea that auto-resizes to fit text lines centered within the node shape, updating values in real-time.
  - Implemented custom `CenterConnectionEdge` drawing straight lines between node centers, which dynamically updates source/target layout coordinates upon movement or resize.
  - Created a bottom toolbar connector tool that triggers crosshair connection state, tracking mouse movement to display a dashed live connection line, and completing edges on target node click.
  - Verified code correctness with successful production build and linting checks.
- Floating Node Color Toolbar (`15-nodes-color-toolbar.md`):
  - Imported `NODE_COLORS` palette mapping from `types/canvas.ts`.
  - Built custom `ColorSwatch` component rendering swatches with hover glows matching their text colors and styled active indicator dots.
  - Implemented the floating toolbar in `CanvasNodeComponent` absolutely positioned above selected nodes.
  - Added click and drag interceptors (`nodrag`, `nopan`, `stopPropagation()`) preventing canvas navigation during swatch interactions.
  - Wired swatch click to React Flow's `setNodes` state updates to change background and text colors dynamically without server calls.
  - Verified compilation and layout updates cleanly in local test environment.
- Node Connections & Custom Edges (`16-node-connections.md`):
  - Added types `CanvasEdgeVariant`, `CanvasEdgeArrowDirection`, `CanvasEdgeConnectionType`, and `CanvasEdgeControlPoint` in `types/canvas.ts`.
  - Added boundary intersection calculations `getNodeIntersection` so arrowheads align perfectly with node boundaries.
  - Implemented path spline math for curve routing and polyline midpoints for flexible label rendering.
  - Created interactive drag handles and body click-to-create controls for flexible path drawing.
  - Implemented a premium floating settings dialog card (`EdgeSettingsDialog`) overlay at click coordinates supporting text labels, variant styles (solid, dotted, dashed), arrow direction settings, and curve routing options, syncing to all collaborators in real-time.
  - Verified compilation and lint rules pass cleanly with zero compiler warnings in updated files.
- Node Connection Refinements (`context/current-issues.md`):
  - Implemented canvas auto-panning and dialog bounding inside `handleEdgeDoubleClick` so settings popup is never cut off.
  - Changed the click-outside overlay listener to run in the capture phase, enabling background click-closing to work reliably.
  - Replaced text-based buttons for variants, directions, and routings with visual inline SVG previews and Lucide icons.
  - Scaled connection line arrowheads markers sizes from 5 to 7.
  - Refactored `CenterConnectionEdge` to support adjustable curve curvature by dragging the curve body and editing handles.
  - Verified compilation and lint check passes successfully.
- Canvas Ergonomics (`17-canvas-ergonomics.md`):
  - Created `hooks/useKeyboardShortcuts.ts` to handle zooming and undo/redo keyboard shortcuts, ignoring events when inputs/textareas are focused.
  - Custom-styled and implemented a floating, pill-shaped control bar at the bottom-left of the canvas.
  - Integrated Zoom Out, Fit View, and Zoom In buttons with smooth animated transition options.
  - Wired Undo and Redo actions directly to Liveblocks room history state hooks, with visual disabled/dimmed styling.
  - Configured control bar styling with `z-20` to place it underneath the projects sidebar (`z-30`) when opened.
  - Removed the canvas minimap from the bottom-right corner.
  - Successfully verified execution end-to-end with unit builds and manual browser interaction.

## In Progress

- None.

## Next Up

- AI Architecture Generation (Trigger.dev workflows)

## Open Questions

- None.

## Architecture Decisions

- **Floating Sidebar Overlay**: The sidebar is styled to float above the canvas/page contents rather than reflowing the page layout when toggled, matching the specification in `02-editor.md`.
- **Dialog Border Radius**: The default shadcn/ui dialog component's border radius is updated to `rounded-3xl` to comply with the modal/overlay design standard defined in `ui-context.md`.
- **Renamed Middleware to Proxy**: Implemented route protection using Next.js 16's new `proxy.ts` file convention at the root instead of the deprecated `middleware.ts`.
- **CSS Variable Theme Mapping**: Leveraged CSS custom properties (`var(...)`) inside the `ClerkProvider` variables option to dynamically theme Clerk's widgets without hardcoding colors.
- **Dynamic Database Adapter Singleton**: Designed the cached Prisma Client to dynamically choose between serverless/edge Accelerate caching or direct connection pooling with `@prisma/adapter-pg` depending on the `DATABASE_URL` protocol.
- **Prisma v7 Multi-file Directory Schema**: Configured directory schema loader resolving schema files under `prisma/models` dynamically, removing deprecated datasource params from the schema.
- **Unified Prisma Client Return Type**: Applied the `.$extends(withAccelerate())` extension across all database client instantiation branches in `lib/prisma.ts`. This unifies the client's return type to a single extended Prisma Client signature, resolving a TypeScript compiler "expression is not callable" error on union type methods (e.g. `findUnique`).
- **Middleware API Route Protection**: Configured `proxy.ts` middleware to intercept unauthenticated requests targeting `/api/...` paths and return structured `401 Unauthorized` JSON responses directly, preventing invalid page-redirect HTML returns on fetch calls.
- **Liveblocks Room Authorization Boundary**: Liveblocks room IDs are the existing project IDs, and `POST /api/liveblocks-auth` issues tokens only after Clerk authentication and `checkProjectAccess(projectId)` succeeds.

## Session Notes

- Implemented the Liveblocks collaboration infrastructure setup from `10-liveblocks-setup.md`, including typed presence/user metadata, cached Node client setup, deterministic cursor colors, private room creation, per-user room write access, and a project-access-protected auth endpoint. Verified the change set with a successful `npm run build`.
- Added the initial Liveblocks-backed React Flow canvas foundation for `11-bsse-canvas.md`, including visible empty-canvas chrome so an empty shared room reads as an active collaborative canvas instead of a blank page.
- Implemented Canvas Shape Panel from `12-shape-panel.md` with dragging shapes, dropping to create new collaborative nodes, and a basic `canvasNode` custom renderer. Verified with `npm run build`.
- Fixed visual issues from `context/current-issues.archived.md`:
  - Removed the redundant `CanvasStatusOverlay` placeholder layers (including the central message modal and badge status bars) to clean up the canvas workspace.
  - Rewrote the custom node renderer (`CanvasNodeComponent`) to accurately represent all target shapes (rectangle, circle, pill, diamond, hexagon, and cylinder) utilizing responsive inline SVG wrappers and CSS styling. Verified with `npm run build`.
- Implemented the Floating Node Color Toolbar (`15-nodes-color-toolbar.md`):
  - Built floating toolbar with 8 swatches matching predefined color pairs from `types/canvas.ts`.
  - Added micro-interaction styling to swatches, including scaling up and showing a tight, controlled glow based on their foreground text color on hover.
  - Placed click/drag event interceptors to prevent canvas panning and node dragging during swatch interaction.
  - Verified compilation and visual updates interactively via browser subagent.
- Implemented Node Connections and Custom Edges (`16-node-connections.md`):
  - Engineered path intersection math to terminate connections at bounding box borders, keeping arrow markers perfectly visible.
  - Integrated spline and polyline midpoints with support for double-click settings dialog and interactive control points.
  - Resolved hook ordering and eslint-disable warnings. Verified compile and build.
- Refined Node Connections and Settings Dialog Overlay (`context/current-issues.md`):
  - Implemented canvas auto-panning and position bounding for popup settings card visibility.
  - Upgraded click-outside listener to capture phase, enabling background click-closing.
  - Swapped text buttons with inline SVG visual style lines and Lucide React icons (`Ban`, `ArrowRight`, `ArrowLeft`, `ArrowLeftRight`, `Minus`, `Spline`, `Route`).
  - Scaled arrowhead markers to 7px.
  - Engineered adjustable curves supporting custom curve midpoint drag-editing and reset.
- Fixed template import canvas crash error (`TypeError: nodesMap.clear is not a function`):
  - Replaced `.clear()` calls on Liveblocks `LiveMap` objects (`nodesMap` and `edgesMap` in `importTemplate` mutation inside `components/editor/collaborative-canvas.tsx`) by converting the keys iterator to an array with `Array.from()` and deleting each key iteratively, since Liveblocks `LiveMap` does not natively support a `.clear()` method.
- Resolved database SSL warning and optimized Liveblocks authentication endpoint:
  - Updated `DATABASE_URL` in `.env` and `.env.local` to use `sslmode=verify-full` instead of `sslmode=require` to resolve the `pg-connection-string` security deprecation warning and guarantee consistent libpq SSL behavior.
  - Modified [route.ts](file:///Users/marvanmiri/Desktop/ghost_ai/app/api/liveblocks-auth/route.ts) to return `{ error: "forbidden", reason: "..." }` instead of general error payloads on unauthorized requests, preventing the Liveblocks client from falling into infinite reconnect-and-log loops.
  - Wrapped Clerk `currentUser()` API calls in a `try-catch` block inside the auth endpoint to handle network timeouts/rate limits gracefully and return "Anonymous" metadata rather than throwing a 500 error.
- Resolved database connection timeout error (PrismaClientKnownRequestError):
  - Identified that the remote Prisma Postgres hostname (`pooled.db.prisma.io:5432`) is unreachable due to network timeouts in the local development environment.
  - Initialized a local Prisma Postgres dev server via `npx prisma dev --detach`.
  - Configured `DATABASE_URL` in `.env` and `.env.local` to use the direct local TCP connection string: `postgres://postgres:postgres@localhost:51214/template1?sslmode=disable`.
  - Synchronized the local database schema using `npx prisma db push`.
- Fixed Starter Template modal layout, styling, and replacement functionality (`context/current-issues.md`):
  - Overrode the default `sm:max-w-sm` width constraint with `sm:max-w-5xl` to prevent modal content/columns from being squeezed vertically.
  - Aligned the title and subtitle to match `proper_templateUI.png`, using a styled `<kbd>⌘Z</kbd>` element for the keyboard shortcut.
  - Redesigned the template cards to use the recessed `--bg-base` dark color theme (`bg-base`) and structured text layouts (using `font-semibold` titles and `line-clamp-3` descriptions).
  - Styled import buttons as outlined full-width buttons (`variant="outline"`) displaying a `Download` icon and standard "Import" text.
  - Updated `importTemplate` mutation in `collaborative-canvas.tsx` to clear existing nodes and edges dynamically before inserting the template's structures, conforming to the requirement that the imported template replaces current canvas elements.




