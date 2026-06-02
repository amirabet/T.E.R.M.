# T.E.R.M. — Copilot Instructions

T.E.R.M. (Terminal Empathetic Resourceful Mate) is a Python library that renders an animated ASCII-face bot in the terminal, plus a companion browser-based animation editor called **T.E.R.M. Studio**.

---

## Project Layout

```
term/                   Python package (pip install .)
  __init__.py           Public API surface
  __main__.py           Entry point for `python -m term`
  bot.py                TERM class — main public API
  animations.py         Load/merge/normalize animation JSON
  renderer.py           ANSI terminal writes and in-place redraws
  richtext.py           Cell + RichText — per-character styled text
  colors.py             ANSI color codes, color-capability detection
  message.py            Message builders: plain, markup, typewriter, loader, bubble
  daemon.py             stdin protocol — cross-language subprocess control
  animations/
    default.json        Built-in animation states

docs/
  index.html            Docs landing page
  style/term.css        CRT stylesheet
  studio/
    term-studio.html    T.E.R.M. Studio browser editor (no build step)
    term-studio.css     Studio styles
    term-studio.js      All studio logic (vanilla JS, no framework)

wiki/                   GitHub Wiki source (tracked in repo)
pyproject.toml          Package metadata (name: term-mate, version: 0.1.0)
example.py              Usage demo / smoke test
```

---

## Core Python Concepts

### TERM class (`term/bot.py`)

```python
from term import TERM

bot = TERM()                          # starts idle
bot = TERM(animations="term.json")    # load extra/custom states
bot.start()                           # begin animation loop
bot.think("Analyzing...")
bot.work("Processing...")
bot.ok("Done!")
bot.error("Something went wrong")
bot.speak("Hello!")
bot.say("Typed out char by char", delay_ms=60)   # typewriter
bot.progress(67, label="Uploading...")
bot.stop()
```

Convenience methods (`idle`, `think`, `work`, `ok`, `error`, `speak`, `boot`) are aliases for `set_state(name, msg)`. All return `self` for chaining.

### Custom States

Any state name works as long as the animation definition exists:

```python
bot = TERM(animations="my-states.json")
bot.set_state("my_custom_state", "Running custom animation")
```

**Animation load priority** (highest → lowest):

1. `TERM(animations=...)` / `bot.add_animation(...)`
2. `./term.json` (per-project, auto-loaded)
3. `~/.term/animations.json` (user global, auto-loaded)
4. `term/animations/default.json` (built-in)

### Animation JSON Format

```json
{
  "_meta": { "version": 1 },
  "my_state": {
    "frames": [
      {
        "ms": 200,
        "face": [
          {
            "char": "^",
            "fg": "br_cyan",
            "bg": "",
            "bold": true,
            "dim": false,
            "underline": false,
            "reverse": false
          }
        ],
        "msg": [
          {
            "char": "H",
            "fg": "white",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          }
        ]
      }
    ]
  }
}
```

Both per-character **object format** and **shorthand string** are valid:

```json
{ "idle": { "frames": [{ "ms": 400, "face": "._.", "msg": "..." }] } }
```

### RichText and Cells (`term/richtext.py`)

`RichText` is a list of `Cell` objects. Each `Cell` has: `char`, `fg`, `bg`, `bold`, `dim`, `underline`, `reverse`.

```python
from term.richtext import RichText

rt = RichText("[br_cyan bold]>>[/][white] done[/]")   # markup
rt = RichText("plain text")
rt = (RichText()
      .add("T", fg="br_cyan", bold=True)
      .add(".E.R.M."))
```

### Markup Syntax

```
[fg_color bg:bg_color bold dim underline reverse]text[/]
```

Examples: `[br_cyan bold]>>[/]`, `[red bg:black]FAIL[/]`, `[dim]...waiting[/]`

### Message Types (`term/message.py`)

| Function                                  | Description                             |
| ----------------------------------------- | --------------------------------------- |
| `message.plain(text, **style)`            | Uniformly styled string                 |
| `message.markup(text)`                    | Inline markup syntax                    |
| `message.typewriter(bot, text, delay_ms)` | Types char-by-char in background thread |
| `message.loader(pct, width, **kw)`        | Progress bar `[=====>    ] 67%`         |
| `message.bubble(text)`                    | Speech bubble `( text )`                |

### Daemon / Cross-Language Protocol (`term/daemon.py`)

Spawn `python -m term` as a subprocess and write commands to stdin (UTF-8, one per line):

```
think  [message]
work   [message]
ok     [message]
error  [message]
idle   [message]
speak  [message]
state  <name> [message]
msg    <text>
markup <text>
say    <text>
progress <0-100> [label]
bubble <text>
badge  <ok|error|warn|info> [label]
quit
```

---

## T.E.R.M. Studio (`docs/studio/`)

Vanilla HTML/CSS/JS — open `term-studio.html` directly in a browser, no build step.

### Architecture (term-studio.js)

Key globals:

- `stateSet` — `{ stateName: [frame, frame, …] }` — all states being edited
- `currentState` — name of the state currently shown in the editor
- `frames` — the live frame array for the current state
- `target` — which slot is being painted: `"face"` or `"msg"`
- `PRESETS` — the six default states used to bootstrap a fresh session
- `FACES` — ~50 preset face expressions grouped by emotion

Key functions:

- `initDefaultStates()` — bootstraps `stateSet` from `PRESETS`
- `switchState(name)` — saves current state, loads another
- `saveCurrentStateToSet()` — flushes `frames` into `stateSet[currentState]`
- `addNewState()` — creates a blank state from the name input
- `deleteCurrentState()` — removes the active state (min 1 state enforced)
- `renderStatesBar()` — redraws the states pill bar
- `importStatesFromJSON(data)` — parses a JSON object into `stateSet`
- `exportStatesToJSON()` — serializes `stateSet` to a Python-compatible JSON object
- `importStatesFile()` — triggers file picker
- `exportStatesFile()` — downloads `term-states.json`

### Color Name Normalization

The editor internally uses shortened bright-color names. Export normalizes them to the Python runtime names:

| Editor (internal) | Python (exported) |
| ----------------- | ----------------- |
| `br_cyn`          | `br_cyan`         |
| `br_yel`          | `br_yellow`       |
| `br_grn`          | `br_green`        |
| `br_blu`          | `br_blue`         |
| `br_mag`          | `br_magenta`      |
| `br_wht`          | `br_white`        |

All other names (`red`, `cyan`, `white`, `black`, `gray`, `dim`, etc.) are identical.

### Studio UI Sections (top → bottom)

1. **States bar** — pill buttons; click to switch, double-click to rename, `+` to add, Delete State to remove
2. **Timeline (Frames)** — frame list with duration control and add/remove
3. **Character editor** — face and message cell editors with color/attribute selection
4. **Quick Actions / Expressions** — two-column grid; left: fill/clear/copy-paste; right: ~50 preset faces
5. **Stage** — live preview of current frame
6. **Color palettes (right column)** — foreground, background, attribute toggles

---

## Built-in States

| State   | Description          |
| ------- | -------------------- |
| `boot`  | Wakes up; plays once |
| `idle`  | Slow blink, waiting  |
| `think` | Eye scan, analysis   |
| `work`  | Tension, processing  |
| `ok`    | Relief, success      |
| `error` | Escalating alarm     |
| `speak` | Mouth movement       |

---

## Development Notes

- **No runtime dependencies** — pure Python stdlib, `requires-python = ">=3.8"`
- **Package name**: `term-mate` (PyPI), import as `term`
- **Formatter**: Ruff for Python; VS Code built-in for HTML/CSS/JS/JSON
- **Wiki source** is in `wiki/` and is published via `publish-wiki.ps1`
- When editing the Studio, all logic is in `term-studio.js` — HTML is a shell only
- `default.json` is the canonical schema reference for animation files
- `example.py` is the integration smoke test — run it to verify the whole stack
