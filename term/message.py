"""
term.message
------------
Rich message types for T.E.R.M.

All message types return or stream a RichText that the Bot passes to the renderer.

Types
-----
  plain(text, **style)          — styled plain string
  markup(text)                  — inline markup  [color bold]text[/]
  typewriter(bot, text, **kw)   — types char by char automatically
  loader(pct, width, **kw)      — progress bar  [=====>    ] 67%
  bubble(text, **kw)            — speech bubble  ( text )
"""

import time
import threading
from .richtext import RichText, Cell
from . import colors as _c


# ─── PLAIN ──────────────────────────────────────────────────────────────────────

def plain(text: str, fg: str = "", bg: str = "",
          bold: bool = False, dim: bool = False,
          underline: bool = False, reverse: bool = False) -> RichText:
    """Plain string with a single uniform style."""
    return RichText(text, fg=fg, bg=bg, bold=bold, dim=dim,
                    underline=underline, reverse=reverse)


# ─── MARKUP ─────────────────────────────────────────────────────────────────────

def markup(text: str) -> RichText:
    """
    Inline markup syntax.

    Syntax:  [flags]text[/]
    Flags:   color-name  bg:color-name  bold  dim  underline  reverse

    Examples:
      "[br_cyan bold]>>[/][white] done[/]"
      "[br_green bold bg:green] ok [/][white] All files processed[/]"
      "[red underline]ERROR[/][gray] — connection refused[/]"
    """
    return RichText.markup(text)


# ─── TYPEWRITER ──────────────────────────────────────────────────────────────────

def typewriter(bot, text, delay_ms: int = 60,
               fg: str = "", bg: str = "",
               bold: bool = False, dim: bool = False,
               underline: bool = False, reverse: bool = False,
               end_delay_ms: int = 800) -> None:
    """
    Type text character by character directly into the bot's message.

    Runs in a background thread — returns immediately.
    The bot keeps its current face animation while the text types.

    Parameters
    ----------
    bot          : TERM instance (must be started)
    text         : string to type
    delay_ms     : milliseconds between each character (default 60)
    fg / bg / bold / dim / underline / reverse : style applied to each char
    end_delay_ms : pause at end before returning control

    Example
    -------
        bot.speak()
        message.typewriter(bot, "Hello! I finished the analysis.", fg="br_blue")
    """
    def _type():
        buf = RichText()
        for ch in text:
            buf.add(ch, fg=fg, bg=bg, bold=bold, dim=dim,
                    underline=underline, reverse=reverse)
            bot.set_rich_msg(buf)
            time.sleep(delay_ms / 1000)
        time.sleep(end_delay_ms / 1000)

    t = threading.Thread(target=_type, daemon=True)
    t.start()
    return t


# ─── LOADER ─────────────────────────────────────────────────────────────────────

def loader(pct: float,
           width:    int  = 12,
           filled_char: str = "=",
           empty_char:  str = "-",
           tip_char:    str = ">",
           fg_filled: str = "br_green",
           fg_empty:  str = "gray",
           fg_pct:    str = "white",
           show_pct:  bool = True,
           bold:      bool = False) -> RichText:
    """
    Render a progress bar as RichText.

    Parameters
    ----------
    pct         : 0.0 – 100.0
    width       : total bar width in characters (brackets not counted)
    filled_char : character for completed portion  (default "=")
    empty_char  : character for remaining portion  (default "-")
    tip_char    : character at the fill boundary   (default ">")
    fg_filled   : color of filled chars
    fg_empty    : color of empty chars
    fg_pct      : color of the percentage label
    show_pct    : whether to append " 67%" at the end
    bold        : apply bold to filled portion

    Example
    -------
        bot.set_rich_msg(message.loader(67, width=14))
        # → [=========>----]  67%
    """
    pct = max(0.0, min(100.0, float(pct)))
    filled_n = round(pct / 100 * width)
    empty_n  = width - filled_n

    rt = RichText()
    rt.add("[", fg=fg_empty, dim=True)

    if filled_n > 0:
        body = filled_char * (filled_n - 1)
        if body:
            rt.add(body, fg=fg_filled, bold=bold)
        # tip
        if pct < 100:
            rt.add(tip_char, fg=fg_filled, bold=bold)
        else:
            rt.add(filled_char, fg=fg_filled, bold=bold)

    if empty_n > 0:
        rt.add(empty_char * empty_n, fg=fg_empty, dim=True)

    rt.add("]", fg=fg_empty, dim=True)

    if show_pct:
        pct_str = f" {int(pct):3d}%"
        rt.add(pct_str, fg=fg_pct, bold=bold)

    return rt


# ─── SPEECH BUBBLE ──────────────────────────────────────────────────────────────

def bubble(text: str,
           fg:       str  = "white",
           bg:       str  = "",
           bold:     bool = False,
           brackets: tuple = ("( ", " )"),
           fg_bracket: str = "gray") -> RichText:
    """
    Wrap text in a speech bubble.

    Parameters
    ----------
    text        : content of the bubble
    fg          : text color
    bg          : background color
    bold        : bold text
    brackets    : open/close strings  (default "( " and " )")
    fg_bracket  : color of the brackets

    Example
    -------
        bot.set_rich_msg(message.bubble("Analysis complete!"))
        # → ( Analysis complete! )
    """
    rt = RichText()
    rt.add(brackets[0], fg=fg_bracket, dim=True)
    rt.add(text, fg=fg, bg=bg, bold=bold)
    rt.add(brackets[1], fg=fg_bracket, dim=True)
    return rt


# ─── STATUS BADGES ──────────────────────────────────────────────────────────────

class badge:
    """Pre-built status badges as RichText."""

    @staticmethod
    def ok(label: str = "OK") -> RichText:
        return (RichText()
                .add(" ", fg="br_green")
                .add(label, fg="br_green", bold=True)
                .add(" ", fg="br_green"))

    @staticmethod
    def error(label: str = "ERR") -> RichText:
        return (RichText()
                .add(" ", fg="white", bg="red")
                .add(label, fg="white", bg="red", bold=True)
                .add(" ", fg="white", bg="red"))

    @staticmethod
    def warn(label: str = "WARN") -> RichText:
        return (RichText()
                .add(" ", fg="black", bg="yellow")
                .add(label, fg="black", bg="yellow", bold=True)
                .add(" ", fg="black", bg="yellow"))

    @staticmethod
    def info(label: str = "INFO") -> RichText:
        return (RichText()
                .add(" ", fg="white", bg="blue")
                .add(label, fg="white", bg="blue", bold=True)
                .add(" ", fg="white", bg="blue"))
