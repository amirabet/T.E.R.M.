# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.5.0] - 2026-07-06

### Changed

- Updated `TERM.say(...)` and `term.message.typewriter(...)` to support `markup=True`, so inline markup tags are parsed during typewriter output instead of being shown as raw text.
- Updated typewriter pacing so per-character delay is applied to visible printable characters only.
- Updated typewriter rendering to repaint immediately per typed character, improving visual continuity when animation frame rate is lower than typing speed.
- Updated wiki/API docs to reflect new `say` and typewriter markup/timing behavior and current renderer truncation notes.

### Added

- [Driver.js](https://driverjs.com/) to Term Studio

## [0.4.0] - 2026-06-11

### Added

- Added Scenario JSON export in Studio (`term-scenarios.json`) for chained scenario definitions, including message style data and loader options.

### Changed

- Updated Studio tab labels to singular names: **STATE** and **SCENARIO**.
- Added explicit Scenario export actions in the Scenario tab header for `.json` and full-chain `.py` downloads.
- Updated `wiki/Studio.md` to document the current two-tab workflow and Scenario export options.
- Updated studio colors to default terminal color scheme

## [0.3.0] - 2026-06-03

### Added

- Added FACE and TEST tabs in T.E.R.M. Studio, with message authoring and playback moved to TEST.
- Added chained TEST scenarios in Studio (up to 5), each with configurable state, message, mode, and duration, executed sequentially in the stage preview.
- Added per-character message styling in the Studio TEST tab, including FG, BG, and text attributes.
- Added a Python quick message composition helper `term.message.compose(...)` for multi-character colored/styled blocks with default style fallbacks.
- Added `TERM.compose_msg(...)` as a convenience shortcut to compose and set rich messages directly from block definitions.

### Changed

- Reframed runtime behavior so state and message are independent. Calling `set_state(...)` (or shortcuts like `think()`, `work()`, `ok()`) without a message now preserves the current message.
- Updated stdin daemon behavior so state commands without a message only switch state and do not modify message content.
- Updated Python typewriter behavior to support fixed typing speed with optional total hold duration via `total_duration_ms`.
- Updated Studio TEST typewriter playback to use constant per-character speed.
- Migrated animation schema to face-only state frames (`msg` removed from exported/default state frames) while keeping legacy `msg` import compatibility.
- Removed the face input length cap in Studio so face strings are no longer limited to short fixed lengths.
- Updated wiki/API docs to reflect state/message decoupling, TEST workflow, schema migration, and new Python message composition APIs.

## [0.2.0] - 2026-06-02

### Added

- Added a full state management system to T.E.R.M. Studio. A states bar at the top of the editor displays all named animation states as clickable pills. States can be created, renamed (double-click), switched, and deleted without leaving the editor.
- Added JSON import to the Studio. Any `.json` file that follows the T.E.R.M. animation format (including `term/animations/default.json`) can be loaded, replacing the current state set. Both the per-character object format and the shorthand string format are accepted.
- Added JSON export to the Studio. All current states are downloaded as `term-states.json`, normalized to the Python runtime color naming convention (`br_cyan`, `br_yellow`, etc.), and ready to pass directly to `TERM(animations="term-states.json")`.
- Expanded the Expressions face grid from a small set to approximately 50 preset faces organized into semantic groups: Neutral, Happy, Winking, Sad/Tired, Surprised, Dizzy, Angry, Skeptical, Dead, and Misc.

### Changed

- The Studio Quick Actions and Expressions sections are now displayed side by side in a two-column grid instead of stacked vertically.
- Removed the EDITOR / LIBRARY / EXPORT tab navigation from the Studio. The editor is now shown directly with no tab bar, and the LIBRARY and EXPORT panels have been removed. State export is handled by the new Export JSON button in the States section.
- Rewrote `wiki/Studio.md` to document the state management workflow, JSON import/export, the expanded expressions panel, color name normalization, and usage of exported files with the Python library.

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
