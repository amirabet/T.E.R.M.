"""
T.E.R.M. — example / smoke test
Run: python example.py
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from term import TERM

# ─── 1. BOOT + STATE TRANSITIONS ────────────────────────────────────────────────
print("── 1. Boot sequence + state transitions ──")

term = TERM()
term.start("boot")
time.sleep(2.2)

term.set_msg("Analyzing your project...")
term.think()
time.sleep(1.5)

term.work()
term.set_msg("Processing files... (1/4)")
time.sleep(0.7)
term.set_msg("Processing files... (2/4)")
time.sleep(0.7)
term.set_msg("Processing files... (3/4)")
time.sleep(0.7)
term.set_msg("Processing files... (4/4)")
time.sleep(0.5)

term.ok()
term.set_msg("Completed in 3.2s")
time.sleep(1.5)
term.stop()

# ─── 2. PROGRESS BAR ────────────────────────────────────────────────────────────
print("── 2. Progress bar ──")

term = TERM()
term.start("work", "Starting upload...")
time.sleep(0.5)

for pct in range(0, 101, 10):
    term.progress(pct, label="Uploading")
    time.sleep(0.25)

term.ok("Upload complete!")
time.sleep(1.0)
term.stop()

# ─── 3. MARKUP MESSAGE ──────────────────────────────────────────────────────────
print("── 3. Markup messages ──")

term = TERM()
term.start("think")
time.sleep(0.8)
term.markup("[br_cyan bold]42[/][cyan] issues found in [/][white]src/[/]")
time.sleep(1.5)
term.ok()
term.markup("[br_green bold] PASS [/][white] All tests passed[/]")
time.sleep(1.5)
term.stop()

# ─── 4. SPEECH BUBBLE ───────────────────────────────────────────────────────────
print("── 4. Speech bubble ──")

term = TERM()
term.start("speak")
time.sleep(0.5)
term.bubble("I found 3 potential improvements!")
time.sleep(2.0)
term.stop()

# ─── 5. TYPEWRITER ──────────────────────────────────────────────────────────────
print("── 5. Typewriter effect ──")

term = TERM()
term.start("speak")
term.say("Analysis complete. Found 12 files to refactor.", fg="br_blue", delay_ms=55)
time.sleep(0.5)
term.stop()

# ─── 6. STATUS BADGES ───────────────────────────────────────────────────────────
print("── 6. Status badges ──")

term = TERM()
term.start("ok")
term.badge("ok", "BUILD PASSED")
time.sleep(1.2)
term.error()
term.badge("error", "TESTS FAILED")
time.sleep(1.2)
term.stop()

# ─── 7. CONTEXT MANAGER + ERROR HANDLING ────────────────────────────────────────
print("── 7. Context manager ──")

try:
    with TERM() as term:
        term.think("Loading model...")
        time.sleep(1.0)
        term.work("Running inference...")
        time.sleep(1.0)
        term.ok("Done")
        time.sleep(0.8)
except Exception:
    pass

# ─── 8. CUSTOM ANIMATION ────────────────────────────────────────────────────────
print("── 8. Custom animation (shorthand strings) ──")

term = TERM()
term.add_animation(
    "scan",
    {
        "frames": [
            {"ms": 140, "face": "o.-", "msg": "Scanning..."},
            {"ms": 140, "face": "-o.", "msg": "Scanning..."},
            {"ms": 140, "face": "-.o", "msg": "Scanning..."},
            {"ms": 140, "face": "-o.", "msg": "Scanning..."},
        ]
    },
)
term.start("scan")
time.sleep(2.0)
term.ok("Scan complete — 0 vulnerabilities")
time.sleep(1.0)
term.stop()

# ─── 9. STICKY BOTTOM ───────────────────────────────────────────────────────────
print("── 9. Sticky bottom — bot stays pinned while logs scroll above ──")

term = TERM()
term.start("work", "Deploying services...").sticky()

services = ["auth-service", "api-gateway", "worker", "scheduler", "frontend"]
for svc in services:
    time.sleep(0.6)
    print(f"  ✓ deployed {svc}")
    term.set_msg(f"Deploying services... ({services.index(svc) + 1}/{len(services)})")

term.ok("All services deployed")
time.sleep(1.2)
term.stop()

print("── All done ──")
