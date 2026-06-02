"""
term.renderer
-------------
Terminal output — all writes go through here.
"""

import os
import sys
import threading
from .richtext import RichText
from . import colors

_SEP        = "  < "
_FALLBACK_W = 80
_lock       = threading.Lock()
IS_TTY: bool = sys.stdout.isatty()


def terminal_width() -> int:
    try:
        return os.get_terminal_size().columns
    except OSError:
        return _FALLBACK_W


def write(face: RichText, msg: RichText = None, width: int = None) -> None:
    """
    Write one frame to stdout.
    TTY mode  → \r overwrite (no scroll)
    Pipe mode → newline per frame (safe for log redirect)
    """
    w = width or terminal_width()

    face_plain = face.plain()
    face_ansi  = face.render()

    if msg and msg.width() > 0:
        available = w - len(face_plain) - len(_SEP) - 1
        if available > 0:
            msg = msg.truncate(available)
        line = f"{face_ansi}{_SEP}{msg.render()}"
        raw_len = len(face_plain) + len(_SEP) + msg.width()
    else:
        line = face_ansi
        raw_len = len(face_plain)

    padding = max(0, w - raw_len - 1)

    with _lock:
        if IS_TTY:
            sys.stdout.write(f"\r{line}{' ' * padding}")
        else:
            sys.stdout.write(f"{line}\n")
        sys.stdout.flush()


def clear() -> None:
    if not IS_TTY:
        return
    w = terminal_width()
    with _lock:
        sys.stdout.write(f"\r{' ' * (w - 1)}\r")
        sys.stdout.flush()


def newline() -> None:
    if IS_TTY:
        with _lock:
            sys.stdout.write("\n")
            sys.stdout.flush()
