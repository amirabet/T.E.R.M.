"""
T.E.R.M. — Terminal Empathetic Resourceful Mate
================================================

An animated ASCII terminal character with per-character color,
rich message types, and a cross-language subprocess API.

Quick start
-----------
    from term import TERM, msg

    bot = TERM()
    bot.think("Analyzing your project...")
    do_something()
    bot.ok("Done!")
    bot.stop()

Rich messages
-------------
    bot.markup("[br_cyan bold]FOUND[/][white] 42 issues[/]")
    bot.progress(67, label="Uploading...")
    bot.say("Hello! Analysis complete.", fg="br_blue")
    bot.bubble("Everything looks good!")
    bot.badge("ok", "BUILD PASSED")

Context manager
---------------
    with TERM() as bot:
        bot.think("Loading...")
        result = load()
        bot.ok(f"Loaded {result.count} items")

Custom animations
-----------------
    bot = TERM(animations="my_animations.json")
    bot.add_animation("upload", {"frames": [...]})

Cross-language subprocess protocol
-----------------------------------
    python -m term          # launches stdin daemon
    term                    # CLI entry point after pip install
"""

from .bot     import TERM
from .richtext import RichText, Cell
from . import message as msg
from . import colors
from . import animations

__all__    = ["TERM", "RichText", "Cell", "msg", "colors", "animations"]
__version__ = "0.1.0"
__author__  = "T.E.R.M. project"
