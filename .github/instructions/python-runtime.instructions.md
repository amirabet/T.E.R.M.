---
applyTo: "term/**/*.py,example.py"
---

# Python Runtime Instructions

This file applies when working in Python runtime code.

## Scope

- Core runtime: term/
- Smoke usage example: example.py

## Behavioral Rules

1. Preserve TERM chaining behavior by returning self from state/message APIs.
2. Keep convenience state methods as thin aliases over shared state-setting logic.
3. Do not break animation load precedence:
   - explicit TERM(animations=...) or add_animation(...)
   - local term.json
   - ~/.term/animations.json
   - term/animations/default.json
4. Maintain compatibility with both shorthand and per-cell animation frame formats.

## RichText and Message Expectations

- RichText is cell-based styled text; avoid lossy conversion of style attributes.
- Keep markup parsing stable for fg, bg, and text attributes.
- Keep message helpers aligned with runtime behavior (plain, markup, typewriter, loader, bubble).

## Daemon Protocol Expectations

- Preserve existing command words and optional message semantics.
- If a state command omits message, state changes while current message is kept.
- Maintain UTF-8 stdin line protocol compatibility.

## Change Discipline

- Prefer targeted fixes in touched modules over cross-module refactors.
- Add/update tests or smoke checks when behavior changes.
- If public behavior changes, update README and wiki pages in same change.
