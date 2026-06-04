"""
term.animations
---------------
Loads and merges animation definitions from JSON.

Priority (highest → lowest):
  1. Runtime overrides passed to TERM()
  2. ./term.json            (per-project)
  3. ~/.term/animations.json (user global)
  4. term/animations/default.json (built-in)
"""

import copy
import json
import warnings
from pathlib import Path
from typing import Union

from .richtext import Cell, RichText

_PACKAGE_DIR = Path(__file__).parent
_DEFAULT_FILE = _PACKAGE_DIR / "animations" / "default.json"
_USER_GLOBAL = Path.home() / ".term" / "animations.json"
_USER_LOCAL = Path.cwd() / "term.json"
DEFAULT_FRAME_MS = 300
MIN_FRAME_MS = 0
MAX_FRAME_MS = 10000

# ─── JSON LOADING ───────────────────────────────────────────────────────────────


def _load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        data.pop("_meta", None)
        return data
    except Exception as e:
        warnings.warn(f"T.E.R.M.: could not load {path}: {e}")
        return {}


def _deep_merge(base: dict, override: dict) -> dict:
    merged = copy.deepcopy(base)
    for k, v in override.items():
        merged[k] = v
    return merged


# ─── NORMALIZATION ──────────────────────────────────────────────────────────────


def _normalize_cell(raw) -> Cell:
    """Accept a cell dict or a plain char string."""
    if isinstance(raw, str):
        return Cell(char=raw)
    if isinstance(raw, dict):
        if "ch" in raw and "char" not in raw:
            raw = dict(raw)
            raw["char"] = raw.get("ch")
        if "bo" in raw and "bold" not in raw:
            raw = dict(raw)
            raw["bold"] = raw.get("bo")
        if "di" in raw and "dim" not in raw:
            raw = dict(raw)
            raw["dim"] = raw.get("di")
        if "un" in raw and "underline" not in raw:
            raw = dict(raw)
            raw["underline"] = raw.get("un")
        if "rv" in raw and "reverse" not in raw:
            raw = dict(raw)
            raw["reverse"] = raw.get("rv")
    return Cell.from_dict(raw)


def _normalize_richtext(value) -> RichText:
    """
    Accept:
      - list of cell dicts (editor format)
      - plain string
      - RichText
    """
    if isinstance(value, RichText):
        return value
    if isinstance(value, str):
        return RichText(value)
    if isinstance(value, list):
        rt = RichText()
        for item in value:
            rt.add_cell(_normalize_cell(item))
        return rt
    return RichText()


def _normalize_ms(raw) -> int:
    try:
        ms = int(raw)
    except (TypeError, ValueError):
        ms = DEFAULT_FRAME_MS
    return max(MIN_FRAME_MS, min(MAX_FRAME_MS, ms))


def _normalize_frame(raw: dict) -> dict:
    """Normalize one animation frame to internal format."""
    face = _normalize_richtext(raw.get("fa", raw.get("face", "._.")))
    msg = _normalize_richtext(raw.get("msg", ""))
    ms = _normalize_ms(raw.get("ms", DEFAULT_FRAME_MS))
    return {"face": face, "msg": msg, "ms": ms}


def _normalize_state(raw: dict) -> dict:
    """Normalize one animation state."""
    frames = [_normalize_frame(f) for f in raw.get("fr", raw.get("frames", []))]
    if not frames:
        raise ValueError("Animation state must have at least one frame.")
    return {"frames": frames}


# ─── PUBLIC API ─────────────────────────────────────────────────────────────────


def load(extra: Union[dict, str, Path, None] = None) -> dict:
    """
    Build the final animation map by merging all sources.

    Parameters
    ----------
    extra : dict | str | Path | None
        Runtime override.
        - dict  : raw animation definitions (will be normalized)
        - str / Path : path to a JSON file
        - None  : no runtime override

    Returns
    -------
    dict  { state_name -> {"frames": [normalized_frame, ...]} }
    """
    raw = _load_json(_DEFAULT_FILE)
    raw = _deep_merge(raw, _load_json(_USER_GLOBAL))
    raw = _deep_merge(raw, _load_json(_USER_LOCAL))

    if extra is not None:
        if isinstance(extra, dict):
            raw = _deep_merge(raw, extra)
        else:
            raw = _deep_merge(raw, _load_json(Path(extra)))

    result = {}
    for name, state_raw in raw.items():
        try:
            result[name] = _normalize_state(state_raw)
        except Exception as e:
            warnings.warn(f"T.E.R.M.: skipping invalid state '{name}': {e}")

    return result


def list_states(animations: dict) -> list:
    return sorted(animations.keys())


def get_frame(animations: dict, state: str, index: int) -> dict:
    frames = animations[state]["frames"]
    return frames[index % len(frames)]
