"""
term.bot
--------
T.E.R.M. — Terminal Empathetic Resourceful Mate

Main public API. The TERM class manages the animation loop and
exposes state control, message types, and animation management.
"""

import threading
import time
from pathlib import Path
from typing import Union

from . import animations as _anim_module
from . import message as msg_module
from . import renderer
from .richtext import RichText


class TERM:
    """
    T.E.R.M. — Terminal Empathetic Resourceful Mate.

    Parameters
    ----------
    animations : dict | str | Path | None
        Extra animation definitions merged on top of defaults.
    auto_newline : bool
        Print a newline on stop() so the shell prompt appears cleanly.

    Quick start
    -----------
        from term import TERM
        bot = TERM()
        bot.think("Analyzing...")
        do_work()
        bot.ok("Done!")
        bot.stop()
    """

    def __init__(
        self, animations: Union[dict, str, Path, None] = None, auto_newline: bool = True
    ):
        self._anims = _anim_module.load(animations)
        self._auto_nl = auto_newline
        self._state = "idle"
        self._face: RichText = RichText("._.")
        self._msg: RichText = RichText()
        self._frame_idx = 0
        self._running = False
        self._thread = None
        self._lock = threading.Lock()

    # ─── STATE CONTROL ──────────────────────────────────────────────────────────

    def set_state(self, state: str, msg=None) -> "TERM":
        """
        Switch to a named animation state.

                State and message are independent.

                msg can be:
                    - str          → plain text
                    - RichText     → pre-styled rich text
                    - list         → list of cell dicts (editor format)
                    - None         → keep the current message unchanged
        """
        if state not in self._anims:
            if "idle" in self._anims:
                state = "idle"
            elif self._anims:
                state = next(iter(self._anims))
            else:
                raise KeyError("No animations loaded.")
        with self._lock:
            self._state = state
            self._frame_idx = 0
            if msg is not None:
                self._msg = RichText.coerce(msg)
            elif not renderer._sticky:
                self._msg = RichText()
        return self

    def set_msg(self, msg) -> "TERM":
        """
        Update the message without changing the animation state.
        Accepts str | RichText | list[cell_dict].
        """
        with self._lock:
            self._msg = RichText.coerce(msg)
        return self

    def set_rich_msg(self, rich: RichText) -> "TERM":
        """Set a pre-built RichText message directly."""
        with self._lock:
            self._msg = rich
        return self

    def compose_msg(
        self,
        blocks,
        default_fg: str = "white",
        default_bg: str = "",
        default_bold: bool = False,
        default_dim: bool = False,
        default_underline: bool = False,
        default_reverse: bool = False,
    ) -> "TERM":
        """
        Build and set a rich message from quick blocks.

        See term.message.compose for supported block formats.
        """
        rt = msg_module.compose(
            blocks,
            default_fg=default_fg,
            default_bg=default_bg,
            default_bold=default_bold,
            default_dim=default_dim,
            default_underline=default_underline,
            default_reverse=default_reverse,
        )
        return self.set_rich_msg(rt)

    # ─── CONVENIENCE SHORTCUTS ──────────────────────────────────────────────────

    def idle(self, msg=None) -> "TERM":
        return self.set_state("idle", msg)

    def think(self, msg=None) -> "TERM":
        return self.set_state("think", msg)

    def work(self, msg=None) -> "TERM":
        return self.set_state("work", msg)

    def ok(self, msg=None) -> "TERM":
        return self.set_state("ok", msg)

    def error(self, msg=None) -> "TERM":
        return self.set_state("error", msg)

    def speak(self, msg=None) -> "TERM":
        return self.set_state("speak", msg)

    def boot(self, msg=None) -> "TERM":
        # Kept for compatibility. Studio defaults do not define a dedicated boot state.
        return self.set_state("idle", msg)

    # ─── RICH MESSAGE SHORTCUTS ─────────────────────────────────────────────────

    def say(
        self,
        text: str,
        delay_ms: int = 60,
        total_duration_ms: int | None = None,
        markup: bool = False,
        **style,
    ) -> "TERM":
        """
        Type a message character by character (typewriter effect).
        Blocks until all characters are typed and any hold time has elapsed.
        Keeps the current animation state.
        """
        t = msg_module.typewriter(
            self,
            text,
            delay_ms=delay_ms,
            total_duration_ms=total_duration_ms,
            markup=markup,
            **style,
        )
        t.join()
        return self

    def progress(self, pct: float, label: str = "", **loader_kw) -> "TERM":
        """
        Show a progress bar message.

        Example:
            bot.progress(67, label="Uploading...")
        """
        bar = msg_module.loader(pct, **loader_kw)
        if label:
            rt = RichText(label + " ", fg="gray") + bar
        else:
            rt = bar
        return self.set_rich_msg(rt)

    def bubble(self, text: str, **kw) -> "TERM":
        """Show a speech bubble message."""
        return self.set_rich_msg(msg_module.bubble(text, **kw))

    def badge(self, kind: str = "ok", label: str | None = None) -> "TERM":
        """Show a status badge. kind: ok | error | warn | info"""
        badge_fn = getattr(msg_module.badge, kind, msg_module.badge.ok)
        rt = badge_fn(label) if label else badge_fn()
        return self.set_rich_msg(rt)

    def markup(self, text: str) -> "TERM":
        """Set message from markup syntax. Example: '[br_cyan bold]Done![/]'"""
        return self.set_rich_msg(msg_module.markup(text))

    # ─── LIFECYCLE ──────────────────────────────────────────────────────────────

    def start(self, state: str = "idle", msg=None) -> "TERM":
        """Start the animation loop in a background thread (non-blocking)."""
        if self._running:
            return self
        self.set_state(state, msg)
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        return self

    def stop(self, clear: bool = True) -> "TERM":
        """Stop the animation and clean up the terminal line."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=1.0)
            self._thread = None
        if renderer._sticky:
            renderer.exit_sticky()
        elif clear:
            renderer.clear()
        if self._auto_nl:
            renderer.newline()
        return self

    def sticky(self, enabled: bool = True) -> "TERM":
        """
        Pin the bot frame to the bottom of the terminal so that any output
        printed above it scrolls normally without overwriting the animation.

        Can be called before or after start(), and toggled at any time.

        Example
        -------
            bot.start().sticky()          # enable immediately
            print("some log line")        # scrolls above the bot
            bot.sticky(False)             # back to normal inline mode
        """
        if enabled and not renderer._sticky:
            renderer.enter_sticky()
        elif not enabled and renderer._sticky:
            renderer.exit_sticky()
        return self

    # ─── CONTEXT MANAGER ────────────────────────────────────────────────────────

    def __enter__(self) -> "TERM":
        return self.start()

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        if exc_type is not None:
            try:
                self.set_state("error", str(exc_val)[:60] if exc_val else None)
                time.sleep(0.9)
            except Exception:
                pass
        self.stop()
        return False

    # ─── ANIMATION LOOP ─────────────────────────────────────────────────────────

    def _loop(self) -> None:
        while self._running:
            with self._lock:
                state = self._state
                override = self._msg
                idx = self._frame_idx

            frame = _anim_module.get_frame(self._anims, state, idx)

            face = frame["face"]
            msg = override

            renderer.write(face=face, msg=msg)

            frame_ms = max(0, int(frame["ms"]))

            if frame_ms == 0:
                # 0ms is a stop sentinel: hold this frame until state changes or stop() is called.
                with self._lock:
                    held_state = state
                    held_msg = override
                while self._running:
                    with self._lock:
                        if self._state != held_state or self._msg is not held_msg:
                            break
                    time.sleep(0.05)
                continue

            with self._lock:
                self._frame_idx += 1

            time.sleep(frame_ms / 1000)

    def _render_once(self) -> None:
        """Render current face+message immediately without advancing animation."""
        with self._lock:
            state = self._state
            override = self._msg
            idx = self._frame_idx

        frame = _anim_module.get_frame(self._anims, state, idx)
        renderer.write(face=frame["face"], msg=override)

    # ─── ANIMATION MANAGEMENT ───────────────────────────────────────────────────

    def add_animation(self, name: str, definition: dict) -> "TERM":
        """
        Add or replace an animation at runtime.

        The definition follows the same JSON format as default.json.
        Frames can use per-character cell format or plain strings.

        Example (per-character)
        -----------------------
            bot.add_animation("upload", {
                "frames": [
                    {"ms": 200, "face": [
                        {"char":"^","fg":"cyan","bg":"","bold":False,"dim":False,"underline":False,"reverse":False},
                        {"char":".","fg":"gray","bg":"","bold":False,"dim":True, "underline":False,"reverse":False},
                        {"char":"^","fg":"cyan","bg":"","bold":False,"dim":False,"underline":False,"reverse":False},
                    ], "msg": [
                        {"char":"U","fg":"cyan","bg":"","bold":True, "dim":False,"underline":False,"reverse":False},
                        ...
                    ]}
                ]
            })

        Example (shorthand strings — uniform style per frame)
        ------------------------------------------------------
            bot.add_animation("upload", {
                "frames": [
                    {"ms": 200, "face": "^.^", "msg": "Uploading..."},
                    {"ms": 200, "face": "^o^", "msg": "Uploading..."},
                ]
            })
        """
        from . import animations as _am

        normalized = _am._normalize_state(definition)
        with self._lock:
            self._anims[name] = normalized
        return self

    def remove_animation(self, name: str) -> "TERM":
        """Remove a named animation. Cannot remove the currently active state."""
        with self._lock:
            if name == self._state:
                raise ValueError(f"Cannot remove the currently active state '{name}'.")
            self._anims.pop(name, None)
        return self

    def list_animations(self) -> list:
        """Return sorted list of all available animation names."""
        return _anim_module.list_states(self._anims)

    # ─── REPR ───────────────────────────────────────────────────────────────────

    def __repr__(self) -> str:
        status = "running" if self._running else "stopped"
        return f"<T.E.R.M. state={self._state!r} {status}>"
