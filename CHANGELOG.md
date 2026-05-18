# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.1.0] - 2026-05-18

### Added

- Added `CHANGELOG.md` to track release history.
- Added `docs/studio/term-studio.css` by extracting the Studio page styles from the original single-file editor.
- Added `docs/studio/term-studio.js` by extracting the Studio page behavior from the original single-file editor.
- Added keyboard navigation on `docs/index.html` so pressing the number for an ordered-list entry opens its link.
- Added the following Python files:
  - `example.py` as a smoke test and usage demo covering state changes, progress messages, markup, speech bubbles, and typewriter output.
  - `term/__init__.py` as the package entry surface exporting `TERM`, rich text helpers, colors, animations, and package metadata.
  - `term/__main__.py` so `python -m term` launches the stdin daemon.
  - `term/animations.py` to load, merge, and normalize animation definitions from built-in, user, project, and runtime sources.
  - `term/bot.py` as the main public API implementing the animated terminal bot lifecycle, state changes, and message helpers.
  - `term/colors.py` to define ANSI color and attribute codes plus terminal color-capability detection.
  - `term/daemon.py` to expose the cross-language stdin protocol used to control T.E.R.M. from other processes.
  - `term/message.py` to build rich message types such as plain text, markup, typewriter output, loaders, bubbles, and badges.
  - `term/renderer.py` to handle terminal writes, in-place redraws, truncation, clearing, and newline behavior.
  - `term/richtext.py` to define the `Cell` and `RichText` structures used for per-character styling and rendering.
- Added the following HTML files:
  - `docs/index.html` as the landing page for the docs site, with navigation to Studio and keyboard shortcuts for the ordered list.
  - `docs/studio/term-studio.html` as the browser-based T.E.R.M. Studio interface for editing expressions, frames, colors, presets, library entries, and exports.

### Changed

- Translated the ASCII Face Editor interface and user-facing messages from Spanish to English.
- Updated the Studio HTML to load external stylesheet and script assets instead of inline blocks.
- Configured built-in VS Code formatters for HTML, CSS, JavaScript, and JSON, while keeping Ruff for Python.
- Converted the CRT stylesheet in `docs/style/term.css` from nested syntax to plain CSS selectors.

### Fixed

- Corrected malformed HTML in `docs/index.html`.
- Fixed encoding and mojibake issues in the Studio page text and symbols.
- Restored the Studio asset files after an intermediate split/regeneration issue during refactoring.
