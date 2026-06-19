"""
fake_prompt.py
--------------
Simulates a clean terminal prompt for video recording — no real path
exposed, just a generic styled prompt with an optional blinking cursor.

Usage
-----
    from fake_prompt import Prompt

    p = Prompt()
    p.show()                      # prints prompt, no cursor blink
    p.show(blink=True, cycles=4)  # prompt + blinking cursor for a moment
    p.type("term install demo")   # simulates the user typing a command

Standalone demo
----------------
    python fake_prompt.py
"""

import random
import string
import sys
import time

# ─── ANSI ───────────────────────────────────────────────────────────────────────

RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[32m"
BR_GREEN = "\033[92m"
BLUE = "\033[34m"
BR_BLUE = "\033[94m"
CYAN = "\033[36m"
GRAY = "\033[90m"
WHITE = "\033[97m"


class Prompt:
    """
    Generates and prints a fake terminal prompt line.

    Parameters
    ----------
    user : str
        Fake username shown before @. Default: "dev"
    host : str
        Fake hostname shown after @. Default: "term"
    path_style : str
        "random_hex"   → ~/4f9a2c1e
        "random_words" → ~/sandbox/x7k2p
        "static"       → ~ (no random path, cleanest for video)
    """

    def __init__(self, user="dev", host="term", path_style="static"):
        self.user = user
        self.host = host
        self.path_style = path_style

    # ─── PATH GENERATION ────────────────────────────────────────────────────────

    def _random_path(self):
        chars = string.ascii_lowercase + string.digits
        if self.path_style == "random_hex":
            return "~/" + "".join(random.choices("0123456789abcdef", k=8))
        if self.path_style == "random_words":
            seg = lambda n: "".join(random.choices(chars, k=n))
            return f"~/{seg(7)}/{seg(5)}"
        return "~"  # static — safest for repeatable video takes

    # ─── PROMPT TEXT ────────────────────────────────────────────────────────────

    def render(self):
        """Return the styled prompt string (no trailing cursor)."""
        path = self._random_path()
        return (
            f"{BR_GREEN}{self.user}@{self.host}{RESET}"
            f"{WHITE}:{RESET}"
            f"{BR_BLUE}{path}{RESET}"
            f"{WHITE}$ {RESET}"
        )

    # ─── DISPLAY ────────────────────────────────────────────────────────────────

    def show(self, blink=False, cycles=6, blink_ms=400):
        """
        Print the prompt. If blink=True, animate a block cursor
        after it for `cycles` on/off blinks before returning
        (cursor disappears, ready for the next thing to print on
        the same line — e.g. typed text or T.E.R.M. taking over).
        """
        prompt = self.render()
        cursor = f"{WHITE}\u2588{RESET}"  # solid block cursor

        if not blink:
            sys.stdout.write(prompt)
            sys.stdout.flush()
            return

        for i in range(cycles):
            visible = i % 2 == 0
            sys.stdout.write(f"\r{prompt}{cursor if visible else ' '}")
            sys.stdout.flush()
            time.sleep(blink_ms / 1000)

        # leave prompt clean, no cursor, ready for next content
        sys.stdout.write(f"\r{prompt}")
        sys.stdout.flush()

    def type(self, command, delay_ms=70, end_pause_ms=500):
        """
        Simulate the user typing a command character by character
        after the prompt (must call show() first, without newline).
        """
        for ch in command:
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(delay_ms / 1000)
        time.sleep(end_pause_ms / 1000)
        sys.stdout.write("\n")
        sys.stdout.flush()


# ─── STANDALONE DEMO ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    p = Prompt(user="dev", host="term", path_style="static")

    # 1. Prompt appears with blinking cursor
    p.show(blink=True, cycles=6)

    # 2. User "types" a command
    p.type("python my_script.py", delay_ms=60)

    # 3. Hand off to T.E.R.M. — import here to avoid requiring it
    #    just to test the prompt visuals on their own.
    try:
        from term import TERM

        bot = TERM()
        bot.start("boot")
        time.sleep(1.5)
        bot.think("Analyzing your project...")
        time.sleep(1.8)
        bot.ok("Ready!")
        time.sleep(1.0)
        bot.stop()
    except ImportError:
        print("(T.E.R.M. not installed — prompt demo only)")

    # 4. New clean prompt at the end, cursor blinking, ready for next take
    p.show(blink=True, cycles=8)
    print()  # final newline so shell prompt doesn't overlap
