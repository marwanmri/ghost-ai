Add functionality to the connection lines between nodes so that we can choose their varient (line, dotted, dashed), their arrow pointer direction (bidirectional, eader direction) and their connetion type (straight line, curve, flexible) also we can name that connection lines.

## Implementation

Connection line beween nodes should be clickable for adding label and changing its properties.

- by dubble clicking the connection line we can open a dialog 1. Label: Text name displayed on the line, aligned to the line's path midpoint. Use a neutral, readable font. The label should have the same color as the line it belongs to.

2. Variant (Style):
   - Solid: Standard continuous line (default).
   - Dotted: Series of dots (use an SVG stroke-dasharray with a small gap).
   - Dashed: Short dashes with longer gaps (use a longer stroke-dasharray).
3. Arrow Direction:
   - None: No arrows at either end.
   - Bidirectional: Arrows at both ends.
   - One Direction (Source → Target):
     - Arrow at the target node's end.
     - Head points toward the target node.
   - One Direction (Target → Source):
     - Arrow at the source node's end.
     - Head points toward the source node.
       Implement standard SVG arrowheads (`<marker>`).
4. Connection Type:
   - Straight: Render a direct straight line between start and end points.
   - Curve: Render a Bezier curve between endpoints.
     - Use `curveType='cardinal'` with tension of 0.5 for smooth curves.
   - Flexible: Render a straight line between endpoints.
     - Allow manual control points: Dragging the line's body or endpoints in Flexible mode creates a flexible path. This control should only apply in Flexible mode.

## Behavior

When the connection line is dubble clicked, a popup diolog will appear on top of exactly that point of line that has been clicked.

## Dialog layout

The dialog popup should be somewhat close to reference picture `context/screenshots/dialog.png`. It should have proper white space and each group of settings should be devided by a thin line.

the colors and UI should be compatible with overall desin and using our global design reference

## Scope Limits

- don't change how nodes are created
- don't change the shape panel
- don't redesign the node renderer beyond the required
  connection handles
- keep this focused on edge rendering, labels, and
  connection behavior

## Check When Done

- Double-clicking a connection opens the settings dialog at the clicked point and allows editing label, variant, arrow direction, and connection type.
- Labels, line variants, arrow directions, and connection types render correctly, including flexible-only manual path controls.
- Updated connection settings persist after rerendering or reopening the editor.
- Dialog styling matches the reference design and existing node creation, shape panel, and unrelated node rendering remain unchanged.
- npm run build passes without type errors.
