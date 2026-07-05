"""
term.renderer
-------------
Terminal output — all writes go through here.
"""

import os
import sys
import threading
from typing import Optional

from .richtext import RichText

_SEP = "  < "
_FALLBACK_W = 80
_FALLBACK_H = 24
_lock = threading.Lock()
IS_TTY: bool = sys.stdout.isatty()

# ── Sticky-bottom state ──────────────────────────────────────────────────────
_sticky: bool = False


def terminal_width() -> int:
    try:
        return os.get_terminal_size().columns
    except OSError:
        return _FALLBACK_W


def terminal_height() -> int:
    try:
        return os.get_terminal_size().lines
    except OSError:
        return _FALLBACK_H


def _build_line(face: RichText, msg: Optional[RichText], w: int) -> tuple:
    """Return (ansi_line_str, raw_display_len)."""
    face_plain = face.plain()
    face_ansi = face.render()

    if msg and msg.width() > 0:
        available = w - len(face_plain) - len(_SEP) - 1
        if available > 0:
            msg = msg.truncate(available)
        line = f"{face_ansi}{_SEP}{msg.render()}"
        raw_len = len(face_plain) + len(_SEP) + msg.width()
    else:
        line = face_ansi
        raw_len = len(face_plain)

    return line, raw_len


def enter_sticky() -> None:
    """Reserve the bottom terminal row for the bot frame."""
    global _sticky
    if not IS_TTY:
        return
    with _lock:
        try:
            rows = terminal_height()
            w = terminal_width()
            sys.stdout.write(
                f"\033[{rows};1H"  # jump to last row
                f"\r{' ' * (w - 1)}\r"  # clear it (reserve for bot)
                f"\033[1;{rows - 1}r"  # set scroll region 1…N-1 (cursor resets to 1,1)
                f"\033[{rows - 1};1H"  # move cursor to row N-1 AFTER setting region
                "\033[s"  # save cursor here (row N-1, just above bot)
            )
            sys.stdout.flush()
            _sticky = True
        except OSError:
            # Terminal does not support the required escape sequences; skip sticky mode.
            _sticky = False


def exit_sticky() -> None:
    """Release the reserved bottom row and restore normal scrolling."""
    global _sticky
    if not IS_TTY:
        return
    with _lock:
        try:
            rows = terminal_height()
            w = terminal_width()
            # Clear the sticky row, reset scroll region, then park the cursor
            # at the last content row so newline() lands the prompt at the bottom.
            sys.stdout.write(
                f"\033[{rows};1H"  # jump to last row
                f"\r{' ' * (w - 1)}\r"  # clear it
                "\033[r"  # reset scroll region to full terminal
                f"\033[{rows - 1};1H"  # move to last content row (not saved pos)
            )
            sys.stdout.flush()
        except OSError:
            pass
        finally:
            _sticky = False


def write(
    face: RichText, msg: Optional[RichText] = None, width: Optional[int] = None
) -> None:
    """
    Write one frame to stdout.
    TTY mode  → \r overwrite (no scroll); sticky mode pins frame to last row.
    Pipe mode → newline per frame (safe for log redirect).
    """
    w = width or terminal_width()
    line, raw_len = _build_line(face, msg, w)
    padding = max(0, w - raw_len - 1)

    with _lock:
        try:
            if not IS_TTY:
                sys.stdout.write(f"{line}\n")
            elif _sticky:
                rows = terminal_height()
                sys.stdout.write(
                    "\033[s"  # save cursor (inside scroll region)
                    f"\033[{rows};1H"  # jump to last row, col 1
                    f"\r{line}{' ' * padding}"  # overwrite sticky row
                    "\033[u"  # restore cursor
                )
            else:
                # Non-sticky cooperative mode: draw bot one line below the current
                # cursor so foreground text and bot frames do not compete for a row.
                sys.stdout.write(
                    "\033[s"  # save current text cursor
                    "\033[1E"  # move to next line, col 1
                    f"\r{line}{' ' * padding}"
                    "\033[u"  # restore text cursor
                )
            sys.stdout.flush()
        except OSError:
            pass


def stream_write(text: str, flush: bool = True) -> None:
    """Write raw text to stdout while sharing the renderer lock."""
    with _lock:
        try:
            sys.stdout.write(text)
            if flush:
                sys.stdout.flush()
        except OSError:
            pass


def clear() -> None:
    if not IS_TTY:
        return
    with _lock:
        try:
            w = terminal_width()
            if _sticky:
                rows = terminal_height()
                sys.stdout.write(f"\033[{rows};1H\r{' ' * (w - 1)}\r\033[u")
            else:
                sys.stdout.write(
                    "\033[s"  # save current text cursor
                    "\033[1E"  # clear bot row (one line below text cursor)
                    f"\r{' ' * (w - 1)}\r"
                    "\033[u"  # restore text cursor
                )
            sys.stdout.flush()
        except OSError:
            pass


def newline() -> None:
    if IS_TTY:
        with _lock:
            try:
                sys.stdout.write("\n")
                sys.stdout.flush()
            except OSError:
                pass
