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

import threading
import time

from .richtext import RichText

# ─── PLAIN ──────────────────────────────────────────────────────────────────────


def plain(
    text: str,
    fg: str = "",
    bg: str = "",
    bold: bool = False,
    dim: bool = False,
    underline: bool = False,
    reverse: bool = False,
) -> RichText:
    """Plain string with a single uniform style."""
    return RichText(
        text, fg=fg, bg=bg, bold=bold, dim=dim, underline=underline, reverse=reverse
    )


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


# ─── COMPOSE ───────────────────────────────────────────────────────────────────


def compose(
    blocks,
    default_fg: str = "white",
    default_bg: str = "",
    default_bold: bool = False,
    default_dim: bool = False,
    default_underline: bool = False,
    default_reverse: bool = False,
) -> RichText:
    """
    Compose a rich message from quick blocks.

    Supported block forms
    ---------------------
    - str
      Uses the default style.
    - tuple(text, fg)
    - tuple(text, fg, bg)
    - dict(text=..., fg=..., bg=..., bold=..., dim=..., underline=..., reverse=...)
    - RichText

    Notes
    -----
    - Multi-character strings are appended as one styled block.
    - This is intended for fast composition of mixed-color messages.

    Example
    -------
        rt = compose([
            (">> ", "br_cyan"),
            {"text": "BUILD", "fg": "black", "bg": "green", "bold": True},
            " completed in ",
            ("2.1s", "br_green"),
        ], default_fg="gray")
    """
    rt = RichText()

    def _add(
        text,
        fg=default_fg,
        bg=default_bg,
        bold=default_bold,
        dim=default_dim,
        underline=default_underline,
        reverse=default_reverse,
    ):
        if text:
            rt.add(
                str(text),
                fg=fg,
                bg=bg,
                bold=bold,
                dim=dim,
                underline=underline,
                reverse=reverse,
            )

    for block in blocks or []:
        if isinstance(block, RichText):
            rt = rt + block
            continue

        if isinstance(block, str):
            _add(block)
            continue

        if isinstance(block, tuple):
            if len(block) == 2:
                _add(block[0], fg=block[1])
                continue
            if len(block) >= 3:
                _add(block[0], fg=block[1], bg=block[2])
                continue

        if isinstance(block, dict):
            _add(
                block.get("text", ""),
                fg=block.get("fg", default_fg),
                bg=block.get("bg", default_bg),
                bold=bool(block.get("bold", default_bold)),
                dim=bool(block.get("dim", default_dim)),
                underline=bool(block.get("underline", default_underline)),
                reverse=bool(block.get("reverse", default_reverse)),
            )
            continue

        raise TypeError(f"Unsupported compose block type: {type(block)}")

    return rt


# ─── TYPEWRITER ──────────────────────────────────────────────────────────────────


def typewriter(
    bot,
    text,
    delay_ms: int = 60,
    fg: str = "",
    bg: str = "",
    bold: bool = False,
    dim: bool = False,
    underline: bool = False,
    reverse: bool = False,
    end_delay_ms: int = 800,
    total_duration_ms: int | None = None,
) -> "threading.Thread":
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
    total_duration_ms : if provided, keep the fully typed message visible
                        until this total duration elapses (typing + hold)

    Example
    -------
        bot.speak()
        message.typewriter(bot, "Hello! I finished the analysis.", fg="br_blue")
    """

    def _type():
        started = time.time()
        buf = RichText()
        for ch in text:
            buf.add(
                ch,
                fg=fg,
                bg=bg,
                bold=bold,
                dim=dim,
                underline=underline,
                reverse=reverse,
            )
            bot.set_rich_msg(buf)
            time.sleep(delay_ms / 1000)
        if total_duration_ms is not None:
            total_s = max(0.0, float(total_duration_ms) / 1000.0)
            elapsed_s = max(0.0, time.time() - started)
            remaining_s = max(0.0, total_s - elapsed_s)
            if remaining_s > 0:
                time.sleep(remaining_s)
        elif end_delay_ms > 0:
            time.sleep(end_delay_ms / 1000)

    t = threading.Thread(target=_type, daemon=True)
    t.start()
    return t  # type: ignore[return-value]


# ─── LOADER ─────────────────────────────────────────────────────────────────────


def loader(
    pct: float,
    width: int = 12,
    filled_char: str = "=",
    empty_char: str = "-",
    tip_char: str = ">",
    fg_filled: str = "br_green",
    fg_empty: str = "gray",
    fg_pct: str = "white",
    show_pct: bool = True,
    bold: bool = False,
) -> RichText:
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
    empty_n = width - filled_n

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


def bubble(
    text: str,
    fg: str = "white",
    bg: str = "",
    bold: bool = False,
    brackets: tuple = ("( ", " )"),
    fg_bracket: str = "gray",
) -> RichText:
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
        return (
            RichText()
            .add(" ", fg="br_green")
            .add(label, fg="br_green", bold=True)
            .add(" ", fg="br_green")
        )

    @staticmethod
    def error(label: str = "ERR") -> RichText:
        return (
            RichText()
            .add(" ", fg="white", bg="red")
            .add(label, fg="white", bg="red", bold=True)
            .add(" ", fg="white", bg="red")
        )

    @staticmethod
    def warn(label: str = "WARN") -> RichText:
        return (
            RichText()
            .add(" ", fg="black", bg="yellow")
            .add(label, fg="black", bg="yellow", bold=True)
            .add(" ", fg="black", bg="yellow")
        )

    @staticmethod
    def info(label: str = "INFO") -> RichText:
        return (
            RichText()
            .add(" ", fg="white", bg="blue")
            .add(label, fg="white", bg="blue", bold=True)
            .add(" ", fg="white", bg="blue")
        )
