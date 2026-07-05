"""
T.E.R.M. — Promo / Demo Script
================================
Shows various bot states alongside simulated terminal output.
Run: python docs/demo/promo_video.py
"""

import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from fakeprompt import Prompt
from writer import write_chars, write_chars_async

from term import TERM

# ── helpers ──────────────────────────────────────────────────────────────────

art = r"""
████████╗███████╗   ██████╗    ███╗   ███╗       ██╗         ▄▄███▄▄·
╚══██╔══╝██╔════╝   ██╔══██╗   ████╗ ████║       ╚██╗        ██╔════╝
   ██║   █████╗     ██████╔╝   ██╔████╔██║        ╚██╗       ███████╗
   ██║   ██╔══╝     ██╔══██╗   ██║╚██╔╝██║        ██╔╝       ╚════██║
   ██║██╗███████╗██╗██║  ██║██╗██║ ╚═╝ ██║██╗    ██╔╝███████╗███████║
   ╚═╝╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝    ╚═╝ ╚══════╝╚═▀▀▀══╝
"""

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
SCENE3 = True
SCENE4 = True

# ── Scene 0: Fake Prompt ─────────────────────────────────────────────────────
term = TERM()
term.stop()

if SCENE0:
    clear_screen()
    lines(50)
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

if SCENE1:
    # The video starts with an huge and fast terminal text flow (randomly generated)
    # Boot
    term.sticky(True)
    term.start("boot")
    pause(3.4)
    term.say("Hi!")
    pause(0.5)
    # term.stop()

    # Suddenly gets overflowed by terminal text again.
    term.work("")
    write_chars(1000, None, "gray", 1)

    term.speak(None)
    term.say("The terminal can be overwhelming, right?")

    term.idle("")
    pause(2)

if SCENE2:
    if not SCENE1:
        term.start("boot")

    term.speak(None)
    term.say(
        "My name is [br_cyan]T[/].[br_cyan]E[/].[br_cyan]R[/].[br_cyan]M[/]., which stands for:",
        markup=True,
    )
    pause(0.4)

    term.idle(None)

    term.say("[br_cyan]T[/] E R M I N A L ", delay_ms=100, markup=True)

    term.say("[br_cyan]E[/] M P A T H E T I C ", delay_ms=100, markup=True)

    term.say("[br_cyan]R[/] E S O U R C E F U L ", delay_ms=100, markup=True)

    term.say("[br_cyan]M[/] A T E ", delay_ms=100, markup=True)

    term.ok()
    term.badge("ok", "NICE TO MEET YOU!")
    pause(1)
    term.work(None)
    term.say("Now, let's get to work!")
    pause(1)
    term.stop()

if SCENE3:
    term.sticky(True)
    term.start("speak")
    noise = write_chars_async(2000, None, "gray", 1)
    term.say(
        "My mission is to make the terminal [br_cyan]easier for users[/]", markup=True
    )
    noise.join()
    pause(0.5)

    term.think(None)
    noise = write_chars_async(2000, None, "gray", 1)
    term.say(
        "And [br_magenta]help developers[/] communicate more effectively", markup=True
    )
    noise.join()
    pause(0.5)

    term.speak(None)
    noise = write_chars_async(2000, None, "gray", 1)
    term.say(
        "I can display useful and [br_white bg:green bold]C[/][red bold]U[/][black bg:br_yellow bold]S[/][blue bold]T[/][magenta bg:white bold]O[/][br_white bold]M[/][br_yellow bg:br_blue bold]I[/][br_green bold]Z[/][br_cyan bg:br_magenta bold]E[/][br_yellow bold]D[/] messages",
        markup=True,
    )
    noise.join()
    pause(0.5)

    term.ok(None)
    noise = write_chars_async(2000, None, "gray", 1)
    term.say("When everything goes [br_green]smoothly[/]...", markup=True)
    noise.join()
    pause(0.5)

    term.error(None)
    noise = write_chars_async(2000, None, "gray", 1)
    term.say("...or when it goes [br_red]bananas[/]", markup=True)
    noise.join()
    pause(0.5)

    term.speak(None)
    term.say(
        "I'm compatible with all major terminals and operating systems",
    )
    pause(0.5)

    term.set_state("demo")
    term.say(
        "and fully customizable via [magenta]T.E.R.M. STUDIO![/]",
        markup=True,
    )
    pause(4)
    term.stop()

if SCENE4:
    term.start("work")
    steps = 20
    for i in range(steps + 1):
        term.progress(i * 100 / steps, "DEMO COMPLETED")
        time.sleep(0.1)
    pause(2)

    term.ok(None)
    term.say("[br_green]Let me help with your next project![/]", markup=True)
    pause(2.2)

    term.stop()

    write_chars(422, art, "cyan", 10)
    term.sticky(True)
    term.start("idle")
    term.say("[br_cyan]Find me on GitHub![/]", markup=True)
    pause(10)


# ── The End ──────────────────────────────────────────────────────────────────

# print(f"{GREEN}Demo complete.{RESET}\n")

# ALWAYS finish stopping TERM!
# term.stop()

# TODO: add all scenes
# TODO: change demo frames duration
