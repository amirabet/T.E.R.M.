# T.E.R.M. - Global Copilot Instructions

T.E.R.M. is a Python package for terminal animation plus a browser-based editor (T.E.R.M. Studio).

Use this file for always-on rules only. Domain details live in scoped instruction files so only relevant guidance is loaded.

## Always-On Priorities

1. Preserve public API behavior unless explicitly asked to change it.
2. Prefer minimal, surgical edits over broad rewrites.
3. Keep runtime dependency-free in Python package code unless requested.
4. Follow existing style in touched files.
5. Update docs when behavior or public interfaces change.

## High-Level Map

- Python runtime package: term/
- Studio app: docs/studio/
- Docs site and wiki content: docs/, wiki/

## Where Deep Guidance Lives

- Python runtime guidance: .github/instructions/python-runtime.instructions.md
- Studio guidance: .github/instructions/studio.instructions.md
- Docs and wiki guidance: .github/instructions/docs-wiki.instructions.md

## Validation Defaults

- For Python changes, run focused smoke checks (example.py or narrow script checks).
- For Studio changes, verify in browser and check import/export behavior.
- For docs/wiki changes, keep terminology and command examples aligned with runtime behavior.
