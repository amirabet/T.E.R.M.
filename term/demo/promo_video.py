"""
T.E.R.M. — Promo / Demo Script
================================
Shows various bot states alongside simulated terminal output.
Run: python docs/demo/promo_video.py
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from term import TERM

# ── helpers ──────────────────────────────────────────────────────────────────

RESET = "\033[0m"
GRAY = "\033[90m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
WHITE = "\033[97m"
RED = "\033[91m"


def log(color, prefix, text, delay=0.04):
    """Print a styled terminal log line, character by character."""
    line = f"{color}[{prefix}]{RESET} {WHITE}{text}{RESET}"
    for ch in line:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def rule(title=""):
    width = 60
    if title:
        pad = (width - len(title) - 2) // 2
        print(f"\n{GRAY}{'─' * pad} {CYAN}{title}{GRAY} {'─' * pad}{RESET}\n")
    else:
        print(f"\n{GRAY}{'─' * width}{RESET}\n")


def pause(s):
    time.sleep(s)


# ── Scene 1: Boot sequence ────────────────────────────────────────────────────

rule("Boot Sequence")

term = TERM()
term.start("boot")
pause(0.6)

log(GRAY, "sys", "Initialising T.E.R.M. runtime...", delay=0.03)
pause(0.5)
log(GRAY, "sys", "Loading configuration from ~/.termrc", delay=0.03)
pause(0.4)
log(GREEN, "ok ", "Runtime ready.", delay=0.03)
pause(1.2)
term.stop()

# ── Scene 2: Thinking + analysis output ──────────────────────────────────────

rule("Code Analysis")

term = TERM()
term.think("Scanning project files...")
pause(0.5)

files = [
    ("src/main.py", "512 loc"),
    ("src/renderer.py", "278 loc"),
    ("src/utils.py", "134 loc"),
    ("tests/test_core.py", "201 loc"),
]
for fname, info in files:
    log(CYAN, "idx", f"{fname:<30} {GRAY}{info}", delay=0.02)
    pause(0.18)

pause(0.6)
term.markup("[br_cyan bold]4[/][cyan] files indexed — [/][white]1 125 lines total[/]")
pause(1.2)
term.stop()

# ── Scene 3: Working + progress ───────────────────────────────────────────────

rule("Build & Upload")

term = TERM()
term.work("Compiling...")
pause(0.3)

steps = [
    "Resolving imports",
    "Type-checking",
    "Bundling assets",
    "Minifying output",
]
for i, step in enumerate(steps, 1):
    log(GRAY, f"{i}/{len(steps)}", step, delay=0.025)
    pause(0.35)

pause(0.3)
log(GREEN, "ok ", "Build succeeded — dist/ (48 kB)", delay=0.03)
pause(0.4)

term.set_msg("Uploading to CDN...")
for pct in range(0, 101, 5):
    term.progress(pct, label="Uploading")
    pause(0.07)

term.ok("Upload complete!")
pause(1.0)
term.stop()

# ── Scene 4: Error state ──────────────────────────────────────────────────────

rule("Error Handling")

term = TERM()
term.work("Running test suite...")
pause(0.5)

tests = [
    (True, "test_renderer_basic"),
    (True, "test_color_parser"),
    (False, "test_animation_loop"),
    (True, "test_markup_roundtrip"),
]
for passed, name in tests:
    color = GREEN if passed else RED
    prefix = "pass" if passed else "FAIL"
    log(color, prefix, name, delay=0.02)
    pause(0.25)

pause(0.3)
term.error()
term.badge("error", "1 TEST FAILED")
pause(1.5)
term.stop()

# ── Scene 5: Speak + bubble ───────────────────────────────────────────────────

rule("Agent Response")

term = TERM()
term.start("speak")
pause(0.4)

term.say(
    "I spotted the issue — animation_loop uses a race condition on line 87.",
    fg="br_blue",
    delay_ms=45,
)
pause(0.3)
term.bubble("Try wrapping the loop in a threading.Lock() — should fix it!")
pause(2.0)
term.stop()

# ── Scene 6: Recovery ─────────────────────────────────────────────────────────

rule("Recovery & Done")

term = TERM()
term.think("Applying patch...")
pause(0.7)
log(YELLOW, "fix", "threading.Lock() added to animation_loop()", delay=0.03)
pause(0.5)
term.work("Re-running tests...")
pause(0.8)
log(GREEN, "pass", "test_animation_loop", delay=0.02)
pause(0.4)
term.ok("All tests passing")
term.markup("[br_green bold] PASS [/][white] 4 / 4 tests[/]")
pause(1.5)
term.stop()

rule()
print(f"{GREEN}Demo complete.{RESET}\n")
