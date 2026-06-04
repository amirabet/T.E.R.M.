---
applyTo: "docs/studio/**/*.{html,css,js}"
---

# T.E.R.M. Studio Instructions

This file applies when editing the Studio frontend.

## Scope

- Studio shell: docs/studio/term-studio.html
- Studio styles: docs/studio/term-studio.css
- Studio logic: docs/studio/term-studio.js

## Architecture Rules

1. Keep Studio framework-free (vanilla HTML/CSS/JS).
2. Treat term-studio.js as source of truth for editor behavior.
3. Preserve state model shape and core globals used by editor flow.
4. Keep import/export JSON compatible with Python runtime animation schema.

## UX and Data Integrity

- Avoid destructive state changes without clear user intent.
- Keep minimum one state enforced in editor flows.
- Preserve frame duration and per-cell style data on roundtrip import/export.
- Keep color name normalization correct for bright color aliases on export.

## Editing Guidance

- Prefer small, local updates to event handlers and rendering paths.
- Avoid broad CSS rewrites unless explicitly requested.
- Validate key flows after edits:
  - switching states
  - adding/removing frames
  - importing and exporting JSON
  - stage preview updates
