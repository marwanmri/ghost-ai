# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 4: Collaborative Canvas (Liveblocks & React Flow integration)

## Current Goal

- Integrate Liveblocks and React Flow to establish a collaborative canvas surface with node/edge updates.

## Completed

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

## In Progress

- None.

## Next Up

- Collaborative Canvas (Liveblocks & React Flow integration)

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

## Session Notes

- Completed the backend project API routes implementation with owner verification and unauthenticated block checks. Verified full build and lint compliance. Ready to begin Phase 4 (Collaborative Canvas integrating Liveblocks and React Flow).
