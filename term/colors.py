"""
term.colors
-----------
ANSI escape codes and terminal capability detection.
"""

import os
import sys

# ─── CODES ──────────────────────────────────────────────────────────────────────

RESET = "\033[0m"

FG = {
    "":           "",
    "default":    "",
    "black":      "\033[30m",
    "red":        "\033[31m",
    "green":      "\033[32m",
    "yellow":     "\033[33m",
    "blue":       "\033[34m",
    "magenta":    "\033[35m",
    "cyan":       "\033[36m",
    "white":      "\033[37m",
    "gray":       "\033[90m",
    "br_red":     "\033[91m",
    "br_green":   "\033[92m",
    "br_yellow":  "\033[93m",
    "br_blue":    "\033[94m",
    "br_magenta": "\033[95m",
    "br_cyan":    "\033[96m",
    "br_white":   "\033[97m",
}

BG = {
    "":           "",
    "none":       "",
    "black":      "\033[40m",
    "red":        "\033[41m",
    "green":      "\033[42m",
    "yellow":     "\033[43m",
    "blue":       "\033[44m",
    "magenta":    "\033[45m",
    "cyan":       "\033[46m",
    "white":      "\033[47m",
    "gray":       "\033[100m",
    "br_red":     "\033[101m",
    "br_green":   "\033[102m",
    "br_yellow":  "\033[103m",
    "br_blue":    "\033[104m",
    "br_magenta": "\033[105m",
    "br_cyan":    "\033[106m",
    "br_white":   "\033[107m",
}

# Universal attributes (supported everywhere)
ATTR = {
    "bold":      "\033[1m",
    "dim":       "\033[2m",
    "underline": "\033[4m",
    "reverse":   "\033[7m",
}

# ─── CAPABILITY DETECTION ───────────────────────────────────────────────────────

def _supports_color() -> bool:
    if not sys.stdout.isatty():
        return False
    if os.name == "nt":
        try:
            import ctypes
            ctypes.windll.kernel32.SetConsoleMode(
                ctypes.windll.kernel32.GetStdHandle(-11), 7)
            return True
        except Exception:
            return False
    return os.environ.get("TERM", "") != "dumb"

def _detect_theme() -> str:
    cfg = os.environ.get("COLORFGBG", "")
    if cfg:
        try:
            return "light" if int(cfg.split(";")[-1]) >= 8 else "dark"
        except ValueError:
            pass
    return os.environ.get("TERM_THEME", "dark")

# ─── HELPERS ────────────────────────────────────────────────────────────────────

def build_ansi(fg: str = "", bg: str = "", attrs: list = None) -> str:
    if not COLOR_ENABLED:
        return ""
    parts = [ATTR[a] for a in (attrs or []) if a in ATTR]
    fg_code = FG.get(fg, "")
    bg_code = BG.get(bg, "")
    if fg_code: parts.append(fg_code)
    if bg_code: parts.append(bg_code)
    return "".join(parts)

def style(text: str, fg: str = "", bg: str = "", attrs: list = None) -> str:
    prefix = build_ansi(fg, bg, attrs)
    return f"{prefix}{text}{RESET}" if prefix else text

def reset() -> str:
    return RESET if COLOR_ENABLED else ""

# ─── INIT ───────────────────────────────────────────────────────────────────────

COLOR_ENABLED: bool = _supports_color()
THEME: str = _detect_theme()
