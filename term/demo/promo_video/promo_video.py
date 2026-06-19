"""
T.E.R.M. — Promo / Demo Script
================================
Shows various bot states alongside simulated terminal output.
Run: python docs/demo/promo_video.py
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fakeprompt import Prompt
from writer import generate_random_text, write_chars, write_text

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


def lines(n=1):
    sys.stdout.write("\n" * n)
    sys.stdout.flush()


def clear_screen():
    sys.stdout.write("\033[2J\033[H")
    sys.stdout.flush()


# ── Scenes Activation ────────────────────────────────────────────────────────

SCENE0 = True
SCENE1 = True
SCENE2 = True

# ── Scene 0: Fake Prompt ─────────────────────────────────────────────────────
term = TERM()
term.stop()

if SCENE0:
    clear_screen()
    # lines(50)
    pause(2)

    p = Prompt(user="dev", host="term", path_style="static")

    # 1. Prompt appears with blinking cursor
    p.show(blink=False, cycles=24)
    pause(1.2)

    # 2. User "types" a command
    p.type("start T.E.R.M. demo", delay_ms=60)
    lines(1)
    pause(1)


# ── Scene 1: Boot sequence ────────────────────────────────────────────────────
DEFAULT_TEXT = "Ami fenestro paroli lerni biciklo ŝati arbo cent malgranda dimanĉo komputilo ruĝa ridi, knabino strato pomo lumo lundo alta nubo monato kun mateno lundo seĝo vesto malrapida tri super suno leono trajno paroli. Purpura rapida doni homo strato ĉapelo dudek sep malfermi tri aviadilo herbo kapro bruna — urbo forta mardo griza vojo sidi skribi unu, malrapida — ŝuo urbo unu fermi dudek ili veni. Memori ses skribi urso akvo semajno: flava malfermi ĉemizo morti infano li verda telefono nubo vojo griza nubo semajno, neĝo tempo."

if SCENE1:
    # The video starts with an huge and fast terminal text flow (randomly generated)
    # write_chars(5000, None, "gray")

    # Boot
    term.sticky(False)
    term.start("boot")
    pause(3.4)
    term.say("Hi!")
    pause(0.5)
    # term.stop()

    # Suddenly gets overflowed by terminal text again.

    term.work("")
    write_chars(5000, DEFAULT_TEXT, "gray", 1)

    # log(GRAY, "sys", "Initialising T.E.R.M. runtime...", delay=0.03)
    # pause(0.5)
    # log(GRAY, "sys", "Loading configuration from ~/.termrc", delay=0.03)
    # pause(0.4)
    # log(GREEN, "ok ", "Runtime ready.", delay=0.03)
    # pause(1.2)

    # pause(4)
    # term.stop()


# ── The End ──────────────────────────────────────────────────────────────────

rule()
print(f"{GREEN}Demo complete.{RESET}\n")

# ALWAYS finish stopping TERM!
term.stop()
