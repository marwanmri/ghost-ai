We need the base chrome components that frame every editor screen - the top navbar and the left sidebar shell. these will be reused and extended in every chapter that follows.

### Editor Navbar

Create `components/editor/editor-navbar.tsx`.

Requirements:

- fixed-height top navbar
- left, center, and right sections
- left section contains sidebar toggle button
- use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state
- right section stays empty for now
- dark background with subtle bottom border

### Project Sidebar

Create `components/editor/project-sidebar.tsx`.

Requirements:

- Sidebar should float above the editor canvas
- Opening it should not push page content
- Slides in from left
- Accepts `isOpen` prop
- Header with `Projects` title + close button
- Shadcn `Tabs`:
  - My Projects
  - Shared
- Both tabs show empty placeholder state
- full-width `New Project` button at the bottom with `Plus` icon

### Dialog Pattern

Use the existing color tokens from `globals.css` for dialog styling.

Support:

- title
- description
- footer actions

Do not build actual dialogs yet.

### Check when done

- New components compile without TypeScript errors
- No lint errors
- Dialog pattern is ready for future use
