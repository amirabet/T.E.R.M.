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

import json
import copy
import warnings
from pathlib import Path
from typing import Union
from .richtext import RichText, Cell

_PACKAGE_DIR  = Path(__file__).parent
_DEFAULT_FILE = _PACKAGE_DIR / "animations" / "default.json"
_USER_GLOBAL  = Path.home() / ".term" / "animations.json"
_USER_LOCAL   = Path.cwd() / "term.json"

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

def _normalize_frame(raw: dict) -> dict:
    """Normalize one animation frame to internal format."""
    face = _normalize_richtext(raw.get("face", "._."))
    msg  = _normalize_richtext(raw.get("msg",  ""))
    ms   = max(40, int(raw.get("ms", 300)))
    return {"face": face, "msg": msg, "ms": ms}

def _normalize_state(raw: dict) -> dict:
    """Normalize one animation state."""
    frames = [_normalize_frame(f) for f in raw.get("frames", [])]
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
