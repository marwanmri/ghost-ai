# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 3: Project Authentication & Routes (Clerk setup)

## Current Goal

- Wire Clerk into the Next.js app including provider, auth pages (sign-in/up), redirects, route protection (proxy.ts), and user menu button.

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

## Session Notes

- Wrapped up Clerk authentication setup. Ready to begin Phase 4 (Collaborative Canvas integrating Liveblocks and React Flow).
