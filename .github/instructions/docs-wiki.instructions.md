---
applyTo: "README.md,CHANGELOG.md,docs/**/*.md,wiki/**/*.md,docs/index.html"
---

# Docs and Wiki Instructions

This file applies to product docs and wiki content.

## Scope

- Root docs: README.md, CHANGELOG.md
- Site docs: docs/
- Wiki source: wiki/

## Content Rules

1. Keep terminology consistent across README, docs, and wiki.
2. Keep command examples aligned with real runtime capabilities.
3. Prefer concise examples that match current API names and behaviors.
4. When behavior changes, update all user-facing docs affected by that behavior.

## Accuracy Checklist

- TERM usage examples match current API.
- Built-in state names and meanings are consistent.
- Daemon command list matches implementation.
- Studio docs reflect current import/export and editor behavior.

## Publishing Note

- Wiki source is tracked in wiki/ and published via publish-wiki.ps1.
