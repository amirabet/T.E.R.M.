# Sticky-Off Concurrent Output Issue (Known Limitation)

Date: 2026-06-19
Scope: `term.renderer` + concurrent external writes (promo demo scenario)

## Summary

When TERM animation runs concurrently with high-frequency text output while sticky mode is OFF, visual corruption still appears (mixed glyphs, shifted/wrapped text, face fragments injected into content lines).

## Why It Fails

The terminal is a single shared cursor surface.

- In sticky OFF mode, TERM frames repaint relative to the active cursor flow.
- External writers (for example `write_chars`) also emit output at high frequency.
- Even with locking in Python, terminal-level behaviors like auto-wrap, line reflow, and ANSI cursor save/restore interactions are not transactional across independent write patterns.
- Result: interleaving at render-time, especially with per-character output and long lines.

In short: this is not only a Python lock problem; it is a terminal cursor model conflict under concurrent repaint + stream output on the same non-sticky surface.

## What Was Tried

1. Shared lock path for raw writes via `renderer.stream_write(...)`.
2. Non-sticky renderer change to draw one row below active cursor and restore cursor.
3. Writer-side adjustments (per-char and line-bounded variants).

These reduced some collisions but did not fully eliminate artifacts in real runs.

## Current Practical Rule

- For true simultaneous animation + scrolling text: use sticky mode ON.
- For sticky OFF: avoid concurrent repaint and high-frequency text stream at the same time.

## Revisit Plan

When returning to this, prefer a stronger architecture:

1. Introduce a single renderer-owned output queue/event loop.
2. Route both frame rendering and external text writes through one scheduling pipeline.
3. Treat text writes as explicit operations (`append line`, `append chunk`) with deterministic cursor policy.
4. Add a stress test script for sticky OFF with per-character and wrapped-line cases.

This note records the limitation so work can resume later without repeating the same experiments.
