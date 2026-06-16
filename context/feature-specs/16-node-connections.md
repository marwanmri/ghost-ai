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

The dialog popup is a floating settings card with a fixed width of `280px` placed at the double-click coordinates, offset vertically by `12px` (using `translate(-50%, -100%)`). 
It must adhere to the global design token system defined in `context/ui-context.md`:
1. **Background**: Elevated surface background (`--bg-elevated` / `#18181c` with `95%` opacity) and a backdrop blur of `8px` (`backdrop-blur-md`).
2. **Borders**: Thin border using default border color (`--border-default` / `#2a2a30` or `--border-default/40` for internal dividers).
3. **Corner Radius**: Standard modal/overlay border-radius of `rounded-3xl` (`24px`).
4. **Spacing & Padding**: Inner padding of `16px` (`p-4`), with a vertical item gap of `12px` (`gap-3`) separating each settings section. Internal dividers are styled as thin horizontal borders (`border-t border-default/40`).
5. **Typography**: Labels are in uppercase extra-small Geist Sans (`text-xs font-semibold text-copy-muted tracking-wider`) with `6px` (`mb-1.5`) bottom margin. Values and text inputs use regular Geist Sans (`text-xs text-copy-primary`) with custom padding (`px-3 py-1.5`) and background matching subtle surface (`bg-subtle` / `#1e1e23`).
6. **Icons & Controls**: Buttons use Lucide React icons styled at `16px` (`h-4 w-4`) and inline SVGs representing line variants. Selected options highlight in brand cyan accent (`--accent-primary` / `#00c8d4`) with subtle elevations and shadows.

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
