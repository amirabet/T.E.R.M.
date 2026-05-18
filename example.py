"""
T.E.R.M. — example / smoke test
Run: python example.py
"""

import sys, os, time
sys.path.insert(0, os.path.dirname(__file__))

from term import TERM, msg

# ─── 1. BOOT + STATE TRANSITIONS ────────────────────────────────────────────────
print("── 1. Boot sequence + state transitions ──")

bot = TERM()
bot.start("boot")
time.sleep(2.2)

bot.think("Analyzing your project...")
time.sleep(1.5)

bot.work("Processing files... (1/4)")
time.sleep(0.7)
bot.set_msg("Processing files... (2/4)")
time.sleep(0.7)
bot.set_msg("Processing files... (3/4)")
time.sleep(0.7)
bot.set_msg("Processing files... (4/4)")
time.sleep(0.5)

bot.ok("Completed in 3.2s")
time.sleep(1.5)
bot.stop()

# ─── 2. PROGRESS BAR ────────────────────────────────────────────────────────────
print("── 2. Progress bar ──")

bot = TERM()
bot.start("work", "Starting upload...")
time.sleep(0.5)

for pct in range(0, 101, 10):
    bot.progress(pct, label="Uploading")
    time.sleep(0.25)

bot.ok("Upload complete!")
time.sleep(1.0)
bot.stop()

# ─── 3. MARKUP MESSAGE ──────────────────────────────────────────────────────────
print("── 3. Markup messages ──")

bot = TERM()
bot.start("think")
time.sleep(0.8)
bot.markup("[br_cyan bold]42[/][cyan] issues found in [/][white]src/[/]")
time.sleep(1.5)
bot.ok()
bot.markup("[br_green bold] PASS [/][white] All tests passed[/]")
time.sleep(1.5)
bot.stop()

# ─── 4. SPEECH BUBBLE ───────────────────────────────────────────────────────────
print("── 4. Speech bubble ──")

bot = TERM()
bot.start("speak")
time.sleep(0.5)
bot.bubble("I found 3 potential improvements!")
time.sleep(2.0)
bot.stop()

# ─── 5. TYPEWRITER ──────────────────────────────────────────────────────────────
print("── 5. Typewriter effect ──")

bot = TERM()
bot.start("speak")
t = bot.say("Analysis complete. Found 12 files to refactor.", fg="br_blue", delay_ms=55)
t.join()       # wait for typewriter to finish
time.sleep(0.5)
bot.stop()

# ─── 6. STATUS BADGES ───────────────────────────────────────────────────────────
print("── 6. Status badges ──")

bot = TERM()
bot.start("ok")
bot.badge("ok", "BUILD PASSED")
time.sleep(1.2)
bot.error()
bot.badge("error", "TESTS FAILED")
time.sleep(1.2)
bot.stop()

# ─── 7. CONTEXT MANAGER + ERROR HANDLING ────────────────────────────────────────
print("── 7. Context manager ──")

try:
    with TERM() as bot:
        bot.think("Loading model...")
        time.sleep(1.0)
        bot.work("Running inference...")
        time.sleep(1.0)
        bot.ok("Done")
        time.sleep(0.8)
except Exception:
    pass

# ─── 8. CUSTOM ANIMATION ────────────────────────────────────────────────────────
print("── 8. Custom animation (shorthand strings) ──")

bot = TERM()
bot.add_animation("scan", {
    "frames": [
        {"ms": 140, "face": "o.-", "msg": "Scanning..."},
        {"ms": 140, "face": "-o.", "msg": "Scanning..."},
        {"ms": 140, "face": "-.o", "msg": "Scanning..."},
        {"ms": 140, "face": "-o.", "msg": "Scanning..."},
    ]
})
bot.start("scan")
time.sleep(2.0)
bot.ok("Scan complete — 0 vulnerabilities")
time.sleep(1.0)
bot.stop()

print("── All done ──")
