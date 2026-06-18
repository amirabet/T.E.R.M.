import itertools
import random
import string
import time

DEFAULT_TEXT = "Ami fenestro paroli lerni biciklo ŝati arbo cent malgranda dimanĉo komputilo ruĝa ridi, knabino strato pomo lumo lundo alta nubo monato kun mateno lundo seĝo vesto malrapida tri super suno leono trajno paroli. Purpura rapida doni homo strato ĉapelo dudek sep malfermi tri aviadilo herbo kapro bruna — urbo forta mardo griza vojo sidi skribi unu, malrapida — ŝuo urbo unu fermi dudek ili veni. Memori ses skribi urso akvo semajno: flava malfermi ĉemizo morti infano li verda telefono nubo vojo griza nubo semajno, neĝo tempo."

COLORS = {
    "red": "\033[31m",
    "green": "\033[32m",
    "blue": "\033[34m",
    "white": "\033[37m",
    "reset": "\033[0m",
    "gray": "\033[90m",
}


def generate_random_text(length):
    chars = string.ascii_letters + string.digits + "     "
    return "".join(random.choice(chars) for _ in range(length))


def write_text(count=None, duration=None, text=None, color="white", delay=0):

    text = text or DEFAULT_TEXT
    color_code = COLORS.get(color, COLORS["white"])

    if count is not None:
        for _ in range(count):
            print(f"{color_code}{text}{COLORS['reset']}")
            if delay:
                time.sleep(delay)

    elif duration is not None:
        end_time = time.time() + duration

        for _ in itertools.count():
            if time.time() >= end_time:
                break

            print(f"{color_code}{text}{COLORS['reset']}")
            if delay:
                time.sleep(delay)


def write_chars(num_chars, text=None, color="white"):
    text = text or DEFAULT_TEXT
    color_code = COLORS.get(color, COLORS["white"])

    remaining = num_chars

    while remaining > 0:
        chunk = text[:remaining]
        print(f"{color_code}{chunk}{COLORS['reset']}", end="")
        remaining -= len(chunk)

    print()
