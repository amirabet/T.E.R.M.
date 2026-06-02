# T.E.R.M

T.E.R.M. is an animated ASCII terminal companion for CLI tools and LLM-powered programs. It runs in-place on a single terminal line and supports per-character styling, JSON-driven animations, and cross-language control over stdin.

## Install

```bash
pip install -e /path/to/term
```

Python 3.8 or newer is required.

## Quick Start

```python
import time
from term import TERM

bot = TERM()
bot.start("boot")
time.sleep(1.5)
bot.think("Analyzing your project...")
time.sleep(2.0)
bot.ok("Done in 2.1s")
time.sleep(1.0)
bot.stop()
```

## Documentation

The full documentation now lives in the wiki submodule under `wiki/` and in the [GitHub project wiki](https://github.com/amirabet/T.E.R.M./wiki).

- Concepts: `wiki/Concepts.md`
- Getting started: `wiki/Getting-Started.md`
- API overview: `wiki/API-Overview.md`
- API reference: `wiki/API-Reference.md`
- Rich messages: `wiki/Rich-Messages.md`
- RichText model: `wiki/RichText.md`
- Custom animations: `wiki/Custom-Animations.md`
- Color reference: `wiki/Color-Reference.md`
- Built-in states: `wiki/Built-in-States.md`
- Cross-language integration: `wiki/Cross-Language-Integration.md`
- Studio: `wiki/Studio.md`
- Terminal compatibility: `wiki/Terminal-Compatibility.md`
- Project structure: `wiki/Project-Structure.md`
- Roadmap: `wiki/Roadmap.md`
- License: `wiki/License.md`
- Wiki editing and publishing: `wiki/Editing-and-Publishing.md`

## Wiki Workflow

Initialize the wiki submodule:

```bash
git submodule update --init --recursive
```

Publish local wiki changes to the GitHub wiki:

```powershell
.\publish-wiki.ps1 -Message "Update wiki pages"
```

Publish wiki changes and update the main repo submodule pointer too:

```powershell
.\publish-wiki.ps1 -Message "Update wiki pages" -UpdateMainRepoPointer
```

## License

MIT - Terminal Empathetic Resourceful Mate
