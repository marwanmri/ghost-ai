Review the canvas implementation and fix the visual issues. The canvas space is currently crowded with unnecessary node instances that need to be cleaned up.
Also certain shapes are not representative. Check `context/screenshots/image.png` for the current broken state.

Read the current canvas component code in `components/editor` and `components/canvas`.

Canvas space issues:
The entire 'CanvasStatusOverlay' is redundant in `components/collaborative-canvas.tsx`

Canvas and panel shapes issues:
Some shape are not representative of their original counterparts in the diagram. ( like diamond shows rectangle)

After documenting all the issues fix them.
