Add resizing and inline label editing and node node connectivity to canvas nodes.

## Implementation

1. Add resizing.
   - selected nodes should show resize handles
   - prevent nodes from being resized below a minimum size
   - keep resize handles subtle and consistent with the dark canvas UI

2. Add inline label editing.
   - keep the node label centered inside the node
   - double-click the center/label area of a node to edit its label
   - show placeholder text in the same centered position when the label is empty
   - keep editing smooth without causing layout shifts
   - show a textarea directly over the label while editing
   - update the label as users type
   - close editing on blur or `Escape`
   - prevent text editing interactions from dragging or panning the canvas

3. Add node-node connectivity.
   - add a connector tool to the canvas toolbar
   - clicking the connector tool while a node is selected should allow the user to draw a connection to another node
   - the connection should be a straight line between the centers of the two nodes
   - the connection should be updated whenever the two nodes are moved or resized
   - clicking the connector tool again should exit the connector tool

4. Keep all node updates connected to the existing collaborative canvas state.

## Scope Limits

- don't change shape rendering from the previous unit
- don't change the shape panel or drag preview
- don't change how dropped nodes are created
- keep this focused on resize and label editing only

## Check When Done

- Selected nodes show resize handles.
- Resizing updates node dimensions through the existing node state flow.
- Double-clicking a node opens inline label editing.
- Nodes can connect and disconnect from each other properly.
- Connection line should be updated whenever the two nodes are moved or resized.
- Label editing updates node labels through the existing sync flow.
- Editing closes on blur or Escape.
- Text interactions do not trigger canvas drag or pan.
- `npm run build` passes without type errors.
