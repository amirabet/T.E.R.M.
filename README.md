# T.E.R.M.

### Terminal Empathetic Resourceful Mate

```
._.  < Waiting...
o..  < Analyzing your project...
>_<  < Working on it...
^_^  < Done in 2.1s
```

T.E.R.M. is an animated ASCII terminal character designed to accompany CLI tools and LLM-powered programs. It runs in a background thread, animates in-place on a single line, and communicates state through carefully crafted per-character expressions with full color and text attribute support.

---

## Design principles

**One line.** T.E.R.M. lives on a single terminal line, redrawn in-place with `\r` — the same technique used by `pip`, `npm`, and `cargo`. No cursor tricks. No VT100 gymnastics.

**ASCII only.** Every character is printable ASCII — no Unicode blocks, no font dependencies. Renders identically on Linux, macOS, Windows, SSH, Termux, and Raspberry Pi.

**Per-character styling.** Each character in both the face and the message carries its own color, background, and text attributes. The face is not limited to 3 characters — it can be any width.

**Animations as data.** All states and frames live in JSON. Change them without touching code.

**Zero dependencies.** Pure Python stdlib — `threading`, `time`, `os`, `sys`. Nothing to `pip install` beyond T.E.R.M. itself.

**Cross-language.** Any language that can spawn a subprocess can control T.E.R.M. over stdin.

---

## Character anatomy

```
o..  < Analyzing your project...
^^^    ^^^^^^^^^^^^^^^^^^^^^^^
face   message
```

The **face** is a variable-width expression where each character has its own color, background, and attributes. The **message** follows a ` <` separator. Both are rendered as rich text with per-character styling.

---

## Installation

```bash
# From source (development mode)
pip install -e /path/to/term

# Or copy the term/ directory next to your script
```

Python ≥ 3.8 required. No other dependencies.

---

## Quick start

```python
import time
from term import TERM

bot = TERM()
bot.start("boot")
time.sleep(1.5)
bot.think("Analyzing your project...")
time.sleep(2.0)
bot.ok("Done in 2.1s")
time.sleep(1.0)
bot.stop()
```

### Context manager

Starts automatically and stops cleanly when the block exits. If an exception is raised, T.E.R.M. switches to the `error` state before stopping.

```python
with TERM() as bot:
    bot.think("Loading model...")
    result = load_model()
    bot.work("Running inference...")
    output = run(result)
    bot.ok(f"Completed — {len(output)} tokens")
```

---

## API reference

### `TERM(animations=None, auto_newline=True)`

Creates a new T.E.R.M. instance.

| Parameter      | Type                          | Description                                                     |
| -------------- | ----------------------------- | --------------------------------------------------------------- |
| `animations`   | `dict \| str \| Path \| None` | Extra animation definitions merged on top of defaults           |
| `auto_newline` | `bool`                        | Print a newline on `stop()` so the shell prompt appears cleanly |

---

### Lifecycle

#### `bot.start(state="boot", msg=None) → TERM`

Starts the animation loop in a background thread. Non-blocking.

#### `bot.stop(clear=True) → TERM`

Stops the animation, clears the line, and advances the cursor.

---

### State control

#### `bot.set_state(state, msg=None) → TERM`

Switch to any named animation state. `msg` can be `str`, `RichText`, `list[cell_dict]`, or `None` (uses frame default).

```python
bot.set_state("work", "Processing file 3/10")
```

#### `bot.set_msg(msg) → TERM`

Update the message without changing the animation state. Accepts `str | RichText | list[cell_dict]`.

```python
for i, f in enumerate(files):
    process(f)
    bot.set_msg(f"Processing {i+1}/{len(files)}: {f}")
```

### Shortcut methods

```python
bot.idle("Waiting...")
bot.think("Analyzing...")
bot.work("Processing...")
bot.ok("Done!")
bot.error("Connection failed")
bot.speak("Generating response...")
bot.boot()
```

All shortcuts accept an optional `msg` argument (any supported type).

---

## Rich message types

T.E.R.M. provides several message types beyond plain strings.

### Plain string

```python
bot.set_msg("Processing file 3 of 10...")
```

### Markup

Inline styling using `[flags]text[/]` syntax. Flags: color names, `bg:color`, `bold`, `dim`, `underline`, `reverse`.

```python
bot.markup("[br_cyan bold]FOUND[/][white] 42 issues in [/][gray]src/[/]")
bot.markup("[br_green bold bg:green] OK [/][white] All tests passed[/]")
bot.markup("[red underline]ERROR[/][gray] — connection refused[/]")
```

### Typewriter

Types text character by character automatically. The face keeps animating while the text types.

```python
bot.say("Analysis complete. Found 12 files to refactor.", fg="br_blue", delay_ms=55)
```

Or via the `message` module for more control:

```python
from term import msg
t = msg.typewriter(bot, "Hello! I finished the analysis.", fg="br_cyan", delay_ms=60)
t.join()  # wait for typing to finish
```

### Progress bar

```python
bot.progress(67, label="Uploading")
# → Uploading [=========>----]  67%

# With custom style
bot.progress(42, label="Building", width=20, fg_filled="br_cyan", fg_empty="gray")
```

Available parameters:

| Parameter     | Default    | Description                 |
| ------------- | ---------- | --------------------------- |
| `pct`         | —          | 0.0 – 100.0                 |
| `width`       | 12         | Bar width in characters     |
| `filled_char` | `=`        | Completed portion character |
| `empty_char`  | `-`        | Remaining portion character |
| `tip_char`    | `>`        | Boundary character          |
| `fg_filled`   | `br_green` | Color of filled portion     |
| `fg_empty`    | `gray`     | Color of empty portion      |
| `fg_pct`      | `white`    | Color of percentage label   |
| `show_pct`    | `True`     | Show percentage number      |

### Speech bubble

```python
bot.bubble("I found 3 potential improvements!")
# → ( I found 3 potential improvements! )

bot.bubble("Done!", brackets=("[ ", " ]"), fg="br_green", bold=True)
# → [ Done! ]
```

### Status badges

```python
bot.badge("ok",    "BUILD PASSED")   # →  BUILD PASSED
bot.badge("error", "TESTS FAILED")   # →  TESTS FAILED
bot.badge("warn",  "DEPRECATED")     # →  DEPRECATED
bot.badge("info",  "3 WARNINGS")     # →  3 WARNINGS
```

---

## RichText — per-character styling

`RichText` is the core data structure. Each character carries its own color, background, and attributes — matching exactly the format exported by the ASCII Face Editor.

### Building RichText

```python
from term import RichText

# Builder pattern
rt = (RichText()
      .add("T.E.R.M.", fg="br_cyan", bold=True)
      .add(" ready",   fg="gray",    dim=True))

# From markup
rt = RichText.markup("[br_green bold]PASS[/][white] 12/12 tests[/]")

# From editor JSON (list of cell dicts)
rt = RichText.from_cells([
    {"char": "o", "fg": "br_cyan", "bg": "", "bold": True,
     "dim": False, "underline": False, "reverse": False},
    {"char": "_", "fg": "cyan",    "bg": "", "bold": False,
     "dim": False, "underline": False, "reverse": False},
    {"char": "o", "fg": "br_cyan", "bg": "", "bold": True,
     "dim": False, "underline": False, "reverse": False},
])

# Concatenation
rt = RichText("Status: ", fg="gray") + RichText("OK", fg="br_green", bold=True)
```

### Using RichText as a message

```python
bot.set_rich_msg(rt)
bot.set_msg(rt)          # also accepts RichText directly
```

### Cell format (per-character)

```python
{
    "char":      "o",       # single character
    "fg":        "br_cyan", # foreground color name
    "bg":        "",        # background color name ("" = none)
    "bold":      True,      # boolean
    "dim":       False,     # boolean
    "underline": False,     # boolean
    "reverse":   False      # boolean
}
```

---

## Custom animations

### Priority order (highest wins)

```
bot.add_animation() / TERM(animations=...)   ← runtime
./term.json                                  ← per-project
~/.term/animations.json                      ← user global
term/animations/default.json                 ← built-in
```

### Per-character format (full control)

```json
{
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
          },
          {
            "char": ".",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": true,
            "underline": false,
            "reverse": false
          },
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
            "char": "L",
            "fg": "cyan",
            "bg": "",
            "bold": true,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "o",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "a",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "d",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "i",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "n",
            "fg": "cyan",
            "bg": "",
            "bold": false,
            "dim": false,
            "underline": false,
            "reverse": false
          },
          {
            "char": "g",
            "fg": "cyan",
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

### Shorthand strings (uniform style)

```json
{
  "scan": {
    "frames": [
      { "ms": 140, "face": "o.-", "msg": "Scanning..." },
      { "ms": 140, "face": "-o.", "msg": "Scanning..." },
      { "ms": 140, "face": "-.o", "msg": "Scanning..." }
    ]
  }
}
```

Both formats can be mixed within the same file.

### Adding at runtime

```python
# Shorthand
bot.add_animation("scan", {
    "frames": [
        {"ms": 140, "face": "o.-", "msg": "Scanning..."},
        {"ms": 140, "face": "-o.", "msg": "Scanning..."},
        {"ms": 140, "face": "-.o", "msg": "Scanning..."},
    ]
})
bot.set_state("scan")

# Per-character (copy from editor export)
bot.add_animation("upload", {
    "frames": [
        {"ms": 200, "face": [...cell dicts...], "msg": [...cell dicts...]}
    ]
})
```

### Removing

```python
bot.remove_animation("scan")   # cannot remove the currently active state
```

### Listing

```python
bot.list_animations()
# → ['boot', 'error', 'idle', 'ok', 'scan', 'speak', 'think', 'work']
```

---

## Color reference

### Foreground colors

| Name               |                  | Name           |                               |
| ------------------ | ---------------- | -------------- | ----------------------------- |
| `""` / `"default"` | terminal default | `"gray"`       | bright black                  |
| `"red"`            | red              | `"br_red"`     | bright red                    |
| `"green"`          | green            | `"br_green"`   | bright green                  |
| `"yellow"`         | yellow           | `"br_yellow"`  | bright yellow                 |
| `"blue"`           | blue             | `"br_blue"`    | bright blue                   |
| `"magenta"`        | magenta          | `"br_magenta"` | bright magenta                |
| `"cyan"`           | cyan             | `"br_cyan"`    | bright cyan                   |
| `"white"`          | white            | `"br_white"`   | bright white                  |
| `"black"`          | black ⚠          |                | invisible on dark backgrounds |

Same names apply to background colors.

### Text attributes

| Attribute     | Code      | Notes                                            |
| ------------- | --------- | ------------------------------------------------ |
| `"bold"`      | `\033[1m` | Universal                                        |
| `"dim"`       | `\033[2m` | Universal                                        |
| `"underline"` | `\033[4m` | Universal                                        |
| `"reverse"`   | `\033[7m` | Universal — swaps FG/BG; works on any background |

### Theme detection

T.E.R.M. assumes **dark background** by default. Override:

```bash
TERM_THEME=light python my_script.py
```

T.E.R.M. also reads `COLORFGBG` (set by iTerm2, Konsole, xterm) for automatic detection.

---

## Built-in states

| State   | Face progression      | Color            | Description              |
| ------- | --------------------- | ---------------- | ------------------------ |
| `boot`  | `... o.. oo. ooo ._.` | cyan             | Waking up — runs once    |
| `idle`  | `._. . .`             | gray/dim         | Slow blink. Waiting.     |
| `think` | `o.. .o. ..o`         | cyan             | Eye scan. Analyzing.     |
| `work`  | `-_- >_- >_< -_<`     | yellow           | Tension. Processing.     |
| `ok`    | `o_o ^_o ^_^ ^v^`     | green            | Relief and joy. Done.    |
| `error` | `o_o o_O O_O @_@ x_x` | red→white/red bg | Escalating alarm.        |
| `speak` | `^-^ ^o^ ^u^`         | blue             | Mouth movement. Talking. |

---

## Cross-language integration

### Starting the daemon

```bash
python -m term        # via module
term                  # via CLI entry point (after pip install)
```

### Protocol (one command per line, UTF-8)

```
think  [message]              switch to think
work   [message]              switch to work
ok     [message]              switch to ok
error  [message]              switch to error
idle   [message]              switch to idle
speak  [message]              switch to speak
boot   [message]              switch to boot
state  <name> [message]       any named state
msg    <text>                  plain message update
markup <[flags]text[/]...>    markup message
say    <text>                  typewriter effect
progress <0-100> [label]      progress bar
bubble <text>                  speech bubble
badge  <ok|error|warn|info> [label]
list                           print states to stderr
quit                           stop and exit
```

Lines starting with `#` are ignored.

### Node.js

```javascript
const { spawn } = require("child_process");

const bot = spawn("python3", ["-m", "term"]);
const cmd = (line) => bot.stdin.write(line + "\n");

async function run() {
  cmd("boot");
  await sleep(1500);
  cmd("think Analyzing codebase...");
  await analyze();
  cmd("work Refactoring...");
  await refactor();
  cmd("ok Done!");
  await sleep(1000);
  cmd("quit");
}
```

### Go

```go
cmd := exec.Command("python3", "-m", "term")
stdin, _ := cmd.StdinPipe()
cmd.Start()

fmt.Fprintln(stdin, "think Loading data...")
time.Sleep(2 * time.Second)
fmt.Fprintln(stdin, "progress 50 Processing")
time.Sleep(time.Second)
fmt.Fprintln(stdin, "ok Done!")
time.Sleep(time.Second)
fmt.Fprintln(stdin, "quit")
cmd.Wait()
```

### Bash

```bash
python3 -m term &
BOT=$!
FIFO=/tmp/term_$$
mkfifo $FIFO
python3 -m term < $FIFO &
exec 3>$FIFO

echo "think Backing up..." >&3
rsync -a ./src/ ./backup/
echo "ok Backup complete!" >&3
sleep 1
echo "quit" >&3
exec 3>&-
```

---

## ASCII Face Editor

The project includes a standalone HTML tool for designing animations visually.

```
ascii-face-editor.html
```

Open in any browser — no build step, no server.

**Features:**

- Per-character color, background, and text attributes
- Live dark-terminal preview stage
- Frame timeline with drag-to-reorder
- Export to Python (ANSI escape codes) and JSON — paste directly into `default.json`
- Animation library to save and compare states

---

## Terminal compatibility

### `\r` animation technique

T.E.R.M. writes the frame followed by `\r` (carriage return, ASCII 13), moving the cursor back to the start of the current line without advancing. When `stdout` is not a TTY, it falls back to printing a new line per frame — safe for pipes and log redirection. Detected automatically via `sys.stdout.isatty()`.

### Color support

| Environment                  | 16-color ANSI | Notes                         |
| ---------------------------- | ------------- | ----------------------------- |
| Linux xterm / bash           | ✓             | Full support                  |
| macOS Terminal / iTerm2      | ✓             | Full support                  |
| Windows Terminal (Win10+)    | ✓             | VT enabled automatically      |
| VS Code integrated terminal  | ✓             | Full support                  |
| SSH (generic)                | ✓             | Depends on client             |
| Termux (Android)             | ✓             | Full support                  |
| Raspberry Pi via SSH         | ✓             | Full support                  |
| cmd.exe (Win10+)             | ✓             | VT enabled automatically      |
| RPi framebuffer (direct tty) | partial       | 8 colors                      |
| Serial / UART                | ✗             | No ANSI — plain text fallback |
| Jupyter / Output panel       | ✗             | No TTY — newline fallback     |

---

## Project structure

```
term/
├── __init__.py            Public API: from term import TERM, msg, RichText
├── __main__.py            python -m term → launches daemon
├── bot.py                 TERM class — state machine, threading, lifecycle
├── renderer.py            Terminal output: \r overwrite, TTY detection
├── colors.py              ANSI codes, capability + theme detection
├── richtext.py            RichText + Cell — per-character styled text
├── message.py             Message types: plain, markup, typewriter, loader, bubble, badge
├── animations.py          JSON loader, merge system, normalization
├── animations/
│   └── default.json       All built-in animations — edit freely
```

---

## Roadmap (phase 2)

- Frame timing constrained to multiples of 100ms for rhythmic consistency
- Expanded expression presets in the editor
- Richer, longer state animations with personality arcs
- Claude Code hook integration (`PreToolUse` / `PostToolUse` events)
- API configuration: separator, width override, color mode, theme

---

## License

MIT — Terminal Empathetic Resourceful Mate
