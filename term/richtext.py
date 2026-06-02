"""
term.richtext
-------------
Per-character styled text — the core data structure for T.E.R.M.

A RichText is a sequence of Cell objects. Each Cell carries:
  - char       : single character
  - fg         : foreground color name (see colors.FG)
  - bg         : background color name (see colors.BG)
  - bold       : bool
  - dim        : bool
  - underline  : bool
  - reverse    : bool

This matches exactly the JSON format exported by the ASCII Face Editor.

Building RichText
-----------------

  # 1. From a plain string (no styling)
  rt = RichText("working...")

  # 2. Builder pattern
  rt = (RichText()
        .add("T", fg="br_cyan", bold=True)
        .add(".E.R.M.", fg="cyan")
        .add(" done", fg="br_green", bold=True))

  # 3. From markup  [fg bg? bold? dim? underline? reverse?]text[/]
  rt = RichText.markup("[br_cyan bold]>>[/][white] processing[/]")

  # 4. From editor JSON (list of cell dicts)
  rt = RichText.from_cells([
      {"char": ".", "fg": "gray", "bg": "", "bold": False, "dim": True,
       "underline": False, "reverse": False},
      ...
  ])

Rendering
---------
  ansi_str = rt.render()       # returns ANSI-escaped string
  plain_str = rt.plain()       # no ANSI codes
  width = rt.width()           # character count (no ANSI)
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Union
from . import colors as _c

# ─── CELL ───────────────────────────────────────────────────────────────────────

@dataclass
class Cell:
    """One styled character."""
    char:      str  = " "
    fg:        str  = ""
    bg:        str  = ""
    bold:      bool = False
    dim:       bool = False
    underline: bool = False
    reverse:   bool = False

    def attrs(self) -> list:
        result = []
        if self.bold:      result.append("bold")
        if self.dim:       result.append("dim")
        if self.underline: result.append("underline")
        if self.reverse:   result.append("reverse")
        return result

    def render(self) -> str:
        """Return ANSI-styled character."""
        prefix = _c.build_ansi(self.fg, self.bg, self.attrs())
        if not prefix:
            return self.char
        return f"{prefix}{self.char}{_c.RESET}"

    def to_dict(self) -> dict:
        """Serialize to editor-compatible dict."""
        return {
            "char":      self.char,
            "fg":        self.fg,
            "bg":        self.bg,
            "bold":      self.bold,
            "dim":       self.dim,
            "underline": self.underline,
            "reverse":   self.reverse,
        }

    @staticmethod
    def from_dict(d: dict) -> "Cell":
        """Deserialize from editor-exported dict."""
        return Cell(
            char      = d.get("char",      " "),
            fg        = d.get("fg",        ""),
            bg        = d.get("bg",        ""),
            bold      = bool(d.get("bold",      False)),
            dim       = bool(d.get("dim",       False)),
            underline = bool(d.get("underline", False)),
            reverse   = bool(d.get("reverse",   False)),
        )


# ─── RICH TEXT ──────────────────────────────────────────────────────────────────

class RichText:
    """Sequence of styled cells. Immutable after construction."""

    def __init__(self, text: str = "", fg: str = "", bg: str = "",
                 bold: bool = False, dim: bool = False,
                 underline: bool = False, reverse: bool = False):
        self._cells: List[Cell] = []
        if text:
            self.add(text, fg=fg, bg=bg, bold=bold, dim=dim,
                     underline=underline, reverse=reverse)

    # ─── BUILDER ────────────────────────────────────────────────────────────────

    def add(self, text: str, fg: str = "", bg: str = "",
            bold: bool = False, dim: bool = False,
            underline: bool = False, reverse: bool = False) -> "RichText":
        """Append styled characters. Returns self for chaining."""
        for ch in text:
            self._cells.append(Cell(
                char=ch, fg=fg, bg=bg,
                bold=bold, dim=dim, underline=underline, reverse=reverse))
        return self

    def add_cell(self, cell: Cell) -> "RichText":
        """Append a single Cell. Returns self for chaining."""
        self._cells.append(cell)
        return self

    # ─── FACTORIES ──────────────────────────────────────────────────────────────

    @staticmethod
    def from_cells(cells: list) -> "RichText":
        """
        Build from a list of cell dicts (editor JSON format).

          [{"char":"o","fg":"cyan","bg":"","bold":false,...}, ...]
        """
        rt = RichText()
        for item in cells:
            if isinstance(item, dict):
                rt._cells.append(Cell.from_dict(item))
            elif isinstance(item, Cell):
                rt._cells.append(item)
        return rt

    @staticmethod
    def from_str(text: str, fg: str = "", bg: str = "",
                 bold: bool = False, dim: bool = False,
                 underline: bool = False, reverse: bool = False) -> "RichText":
        """Build from a plain string with uniform style."""
        return RichText(text, fg=fg, bg=bg, bold=bold, dim=dim,
                        underline=underline, reverse=reverse)

    @staticmethod
    def markup(text: str) -> "RichText":
        """
        Parse simple markup into a RichText.

        Syntax:  [flags]text[/]
        Flags (space-separated in any order):
          color names  : red  green  cyan  br_cyan  gray  …
          bg:color     : bg:red  bg:br_green  …
          bold  dim  underline  reverse

        Examples:
          "[br_cyan bold]>>[/][white] processing[/]"
          "[gray dim]._.[/]"
          "[br_green bold bg:green] ok [/]"
        """
        rt = RichText()
        i = 0
        fg, bg, bold, dim, underline, reverse = "", "", False, False, False, False

        while i < len(text):
            if text[i] == "[":
                end = text.find("]", i)
                if end == -1:
                    rt.add(text[i], fg=fg, bg=bg, bold=bold, dim=dim,
                           underline=underline, reverse=reverse)
                    i += 1
                    continue
                tag = text[i+1:end].strip()
                if tag == "/":
                    # reset
                    fg, bg, bold, dim, underline, reverse = "", "", False, False, False, False
                else:
                    # parse flags
                    fg, bg, bold, dim, underline, reverse = "", "", False, False, False, False
                    for token in tag.split():
                        tl = token.lower()
                        if tl == "bold":      bold = True
                        elif tl == "dim":     dim = True
                        elif tl == "underline": underline = True
                        elif tl == "reverse": reverse = True
                        elif tl.startswith("bg:"):
                            bg = tl[3:]
                        elif tl in _c.FG:
                            fg = tl
                i = end + 1
            else:
                rt.add(text[i], fg=fg, bg=bg, bold=bold, dim=dim,
                       underline=underline, reverse=reverse)
                i += 1

        return rt

    # ─── COERCE ─────────────────────────────────────────────────────────────────

    @staticmethod
    def coerce(value, **kwargs) -> "RichText":
        """
        Accept str | list | RichText and always return a RichText.
        Used internally so every API accepts any of the three forms.
        """
        if isinstance(value, RichText):
            return value
        if isinstance(value, list):
            return RichText.from_cells(value)
        if isinstance(value, str):
            return RichText(value, **kwargs)
        raise TypeError(f"Cannot coerce {type(value)} to RichText")

    # ─── OUTPUT ─────────────────────────────────────────────────────────────────

    def render(self) -> str:
        """ANSI-escaped string for terminal output."""
        return "".join(c.render() for c in self._cells)

    def plain(self) -> str:
        """Plain string, no ANSI codes."""
        return "".join(c.char for c in self._cells)

    def width(self) -> int:
        """Number of characters (visible width, no ANSI)."""
        return len(self._cells)

    def truncate(self, max_width: int, ellipsis: str = "…") -> "RichText":
        """Return a new RichText truncated to max_width visible characters."""
        if self.width() <= max_width:
            return self
        rt = RichText()
        rt._cells = list(self._cells[:max_width - 1])
        rt._cells.append(Cell(char=ellipsis))
        return rt

    def to_cells(self) -> list:
        """Serialize to list of cell dicts (editor JSON format)."""
        return [c.to_dict() for c in self._cells]

    # ─── OPERATORS ──────────────────────────────────────────────────────────────

    def __add__(self, other: "RichText") -> "RichText":
        rt = RichText()
        rt._cells = list(self._cells) + list(other._cells)
        return rt

    def __len__(self) -> int:
        return self.width()

    def __repr__(self) -> str:
        return f"RichText({self.plain()!r})"
