"""
term.daemon
-----------
Subprocess / stdin protocol for T.E.R.M.

Any language can spawn this and write commands to stdin.

Protocol (one command per line, UTF-8)
---------------------------------------
    think  [message]          switch to think state (message optional)
    work   [message]          switch to work state (message optional)
    ok     [message]          switch to ok state (message optional)
    error  [message]          switch to error state (message optional)
    idle   [message]          switch to idle state (message optional)
    speak  [message]          switch to speak state (message optional)
    boot   [message]          switch to boot state (message optional)
    state  <name> [message]   switch to any named state (message optional)
  msg    <text>             update message (plain)
  markup <text>             update message (markup syntax)
  say    <text>             typewriter effect
  progress <0-100> [label]  show progress bar
  bubble <text>             show speech bubble
  badge  <ok|error|warn|info> [label]
  list                      print available states to stderr
  quit / stop / exit        stop and exit

Lines starting with # are comments and are ignored.
"""

import signal
import sys

from .bot import TERM

_SHORTCUTS = {"idle", "think", "work", "ok", "error", "speak", "boot"}


def _parse(line: str):
    line = line.strip()
    if not line or line.startswith("#"):
        return None, None
    parts = line.split(" ", 1)
    return parts[0].lower(), (parts[1] if len(parts) > 1 else "")


def run(animations=None):
    """Enter the stdin daemon loop."""
    bot = TERM(animations=animations, auto_newline=True)
    bot.start("boot")

    def _shutdown(signum, frame):
        bot.stop()
        sys.exit(0)

    signal.signal(signal.SIGTERM, _shutdown)

    try:
        for raw in sys.stdin:
            cmd, args = _parse(raw)
            if cmd is None or args is None:
                continue

            try:
                if cmd in _SHORTCUTS:
                    if args:
                        bot.set_state(cmd, args)
                    else:
                        bot.set_state(cmd)

                elif cmd == "state":
                    parts = args.split(" ", 1)
                    if len(parts) > 1:
                        bot.set_state(parts[0], parts[1])
                    else:
                        bot.set_state(parts[0])

                elif cmd == "msg":
                    bot.set_msg(args)

                elif cmd == "markup":
                    bot.markup(args)

                elif cmd == "say":
                    bot.say(args)

                elif cmd == "progress":
                    parts = args.split(" ", 1)
                    pct = float(parts[0])
                    label = parts[1] if len(parts) > 1 else ""
                    bot.progress(pct, label=label)

                elif cmd == "bubble":
                    bot.bubble(args)

                elif cmd == "badge":
                    parts = args.split(" ", 1)
                    kind = parts[0] or "ok"
                    label = parts[1] if len(parts) > 1 else None
                    bot.badge(kind) if label is None else bot.badge(kind, label)

                elif cmd == "list":
                    print(", ".join(bot.list_animations()), file=sys.stderr, flush=True)

                elif cmd in ("quit", "stop", "exit"):
                    break

                else:
                    print(
                        f"T.E.R.M.: unknown command '{cmd}'",
                        file=sys.stderr,
                        flush=True,
                    )

            except Exception as e:
                print(f"T.E.R.M. error: {e}", file=sys.stderr, flush=True)

    except (KeyboardInterrupt, EOFError):
        pass
    finally:
        bot.stop()


if __name__ == "__main__":
    run()
