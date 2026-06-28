Add autosave and loading for the collaborative canvas so project state is persisted before adding AI generation. Canvas JSON should be stored in Supabase Storage, and the saved storage path should be stored on the Prisma project record.

## What to install

- `@supabase/supabase-js`
- `@supabase/ssr`

## Implementation

1. Check the existing project schema.

- review `prisma/model/project.prisma`
- add or reuse a field for the canvas storage path (e.g., canvasStoragePath or canvasPath)
- keep Prisma responsible for metadata only

2. Add canvas save/load API routes.
   Create: `PUT /api/projects/[projectId]/canvas`
   This route should:

- receive the latest canvas JSON
- upload the JSON to Supabase Storage (e.g., into a canvases bucket under a path like projects/{projectId}/canvas.json)
- store the returned Supabase storage path on the matching Prisma project record

Create: GET /api/projects/[projectId]/canvas
This route should:

- read the project's saved storage path from Prisma
- fetch the saved canvas JSON from Supabase Storage using the stored path
- return the canvas state to the editor

3. Add an autosave hook in the `/hook` folder.

- watch the canvas nodes and edges
- debounce saves to avoid excessive writes
- save through the canvas API route
- track save status: saving, saved, error

4. Load saved canvas state in the editor.

- when the editor loads, check if the Liveblocks room has any existing nodes or edges
- if the room is empty and the project has a saved canvas storage path, fetch and load the saved canvas state
- if the room already has nodes or edges, skip the load entirely to avoid overwriting active collaboration

5. Add a small save status indicator in the editor Save button.

- show saving, saved, or error states

## Storage Pattern

- Prisma stores project metadata and the Supabase Storage path.
- Supabase Storage stores the actual canvas JSON.

## Check When Done

- `@supabase/supabase-js` and `@supabase/ssr` are installed.
- Supabase Storage bucket (e.g., canvases) is configured with appropriate RLS policies.
- Project schema supports storing the canvas storage path.
- Save/load routes use Prisma for metadata and Supabase Storage for canvas JSON.
- Autosave hook debounces canvas saves.
- Editor shows save status.
- Saved canvas does not load if the room already has active nodes or edges.
- `npm run build` passes.
