// ═══════════════════════════════════════════════════════════
//  COLOR / ATTR DEFINITIONS
// ═══════════════════════════════════════════════════════════
const FG = [
	{
		n: "default",
		css: "#bbbbbb",
		code: "",
		lbl: "default terminal's color",
	},
	{
		n: "black",
		css: "#000000",
		code: "30",
		lbl: "black invisible on dark terminal",
	},
	{ n: "gray", css: "#808080", code: "90", lbl: "gray (bright black)" },
	{ n: "red", css: "#CD3131", code: "31", lbl: "red" },
	{ n: "green", css: "#0DBC79", code: "32", lbl: "green" },
	{ n: "yellow", css: "#949800", code: "33", lbl: "yellow" },
	{ n: "blue", css: "#2472C8", code: "34", lbl: "blue" },
	{ n: "magenta", css: "#BC3FBC", code: "35", lbl: "magenta" },
	{ n: "cyan", css: "#11A8CD", code: "36", lbl: "cyan" },
	{ n: "white", css: "#E5E5E5", code: "37", lbl: "white" },

	{ n: "br_red", css: "#F14C4C", code: "91", lbl: "br.red" },
	{ n: "br_grn", css: "#23D18B", code: "92", lbl: "br.grn" },
	{ n: "br_yel", css: "#F5F543", code: "93", lbl: "br.yel" },
	{ n: "br_blu", css: "#3B8EEA", code: "94", lbl: "br.blue" },
	{ n: "br_mag", css: "#D670D6", code: "95", lbl: "br.mag" },
	{ n: "br_cyn", css: "#29B8DB", code: "96", lbl: "br.cyan" },
	{ n: "br_wht", css: "#FFFFFF", code: "97", lbl: "br.wht" }
];

const BG = [
	{ n: "none", css: "transparent", code: "", lbl: "none" },

	{ n: "black", css: "#000000", code: "40", lbl: "black" },
	{ n: "red", css: "#CD3131", code: "41", lbl: "red" },
	{ n: "green", css: "#0DBC79", code: "42", lbl: "green" },
	{ n: "yellow", css: "#949800", code: "43", lbl: "yellow" },
	{ n: "blue", css: "#2472C8", code: "44", lbl: "blue" },
	{ n: "magenta", css: "#BC3FBC", code: "45", lbl: "magenta" },
	{ n: "cyan", css: "#11A8CD", code: "46", lbl: "cyan" },
	{ n: "white", css: "#E5E5E5", code: "47", lbl: "white" },

	{ n: "br_red", css: "#F14C4C", code: "101", lbl: "br.red" },
	{ n: "br_grn", css: "#23D18B", code: "102", lbl: "br.grn" },
	{ n: "br_yel", css: "#F5F543", code: "103", lbl: "br.yel" },
	{ n: "br_blu", css: "#3B8EEA", code: "104", lbl: "br.blue" },
	{ n: "br_mag", css: "#D670D6", code: "105", lbl: "br.mag" },
	{ n: "br_cyn", css: "#29B8DB", code: "106", lbl: "br.cyan" },
	{ n: "br_wht", css: "#FFFFFF", code: "107", lbl: "br.wht" },
];

const ATTRS = [
	{ n: "bold", lbl: "Bold", css: "font-weight:700;" },
	{ n: "dim", lbl: "Dim", css: "opacity:.4;" },
	{ n: "underline", lbl: "Underline", css: "text-decoration:underline;" },
	{ n: "reverse", lbl: "Reverse", css: "filter:invert(1);" },
];

// ═══════════════════════════════════════════════════════════
//  COLOR NAME NORMALIZATION  (editor short ↔ Python/JSON long)
// ═══════════════════════════════════════════════════════════
// Editor uses abbreviated bright names (br_cyn, br_yel…).
// Python runtime and JSON files use full names (br_cyan, br_yellow…).
const _FG_IMPORT = { "": "default", "br_cyan": "br_cyn", "br_yellow": "br_yel", "br_green": "br_grn", "br_blue": "br_blu", "br_magenta": "br_mag", "br_white": "br_wht" };
const _BG_IMPORT = { "": "none", "br_cyan": "br_cyn", "br_yellow": "br_yel", "br_green": "br_grn", "br_blue": "br_blu", "br_magenta": "br_mag", "br_white": "br_wht" };
const _FG_EXPORT = { "default": "", "br_cyn": "br_cyan", "br_yel": "br_yellow", "br_grn": "br_green", "br_blu": "br_blue", "br_mag": "br_magenta", "br_wht": "br_white" };
const _BG_EXPORT = { "none": "", "br_cyn": "br_cyan", "br_yel": "br_yellow", "br_grn": "br_green", "br_blu": "br_blue", "br_mag": "br_magenta", "br_wht": "br_white" };

const normFg = (v) => Object.prototype.hasOwnProperty.call(_FG_IMPORT, v) ? _FG_IMPORT[v] : v;
const normBg = (v) => Object.prototype.hasOwnProperty.call(_BG_IMPORT, v) ? _BG_IMPORT[v] : v;
const denormFg = (v) => Object.prototype.hasOwnProperty.call(_FG_EXPORT, v) ? _FG_EXPORT[v] : v;
const denormBg = (v) => Object.prototype.hasOwnProperty.call(_BG_EXPORT, v) ? _BG_EXPORT[v] : v;

// ═══════════════════════════════════════════════════════════
//  DATA MODEL
// ═══════════════════════════════════════════════════════════
const DEFAULT_FRAME_MS = 300;
const MIN_FRAME_MS = 0;
const MAX_FRAME_MS = 10000;
const FRAME_MS_STEP = 100;

function parseFrameMs(raw, opts = {}) {
	const n = Number.parseInt(raw, 10);
	if (Number.isNaN(n)) return DEFAULT_FRAME_MS;
	const clamped = Math.max(MIN_FRAME_MS, Math.min(MAX_FRAME_MS, n));
	if (opts.snap === true) return Math.round(clamped / FRAME_MS_STEP) * FRAME_MS_STEP;
	return clamped;
}

// cell: { char, fg, bg, bold, dim, underline, reverse }
const mkCell = (ch) => ({
	char: ch,
	fg: "default",
	bg: "none",
	bold: false,
	dim: false,
	underline: false,
	reverse: false,
});
const mkFrame = (face, ms, msg) => ({
	face: Array.from(face || "._.", (c) => mkCell(c)),
	msg: Array.from(msg || "", (c) => mkCell(c)),
	ms: parseFrameMs(ms),
});
const cloneCell = (c) => ({ ...c });
const cloneFrame = (f) => ({
	face: f.face.map(cloneCell),
	msg: f.msg.map(cloneCell),
	ms: f.ms,
});

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════
let frames = [mkFrame("._.", 500, "")];
let curFrame = 0;
let playing = false;
let playTimer = null;
let speedMul = 1.0;
let target = "face"; // 'face' | 'msg'
let selFace = new Set();
let selMsg = new Set();
let library = {};

// ─── Multi-state set ────────────────────────────────────────
let stateSet = {};      // { name: [frame, frame, …] }
let currentState = "";  // name of the state currently being edited

// ─── TEST tab chain runner ──────────────────────────────────
const MAX_TEST_SCENARIOS = 5;
let testScenarios = [];
let testRunToken = 0;
let testIsRunning = false;
const TYPEWRITER_CHAR_MS = 60;

// ═══════════════════════════════════════════════════════════
//  STYLE HELPERS
// ═══════════════════════════════════════════════════════════
function fgCss(n) {
	const c = FG.find((x) => x.n === n);
	return c ? c.css : "#bbbbbb";
}
function bgCss(n) {
	const c = BG.find((x) => x.n === n);
	return c && c.css !== "transparent" ? c.css : null;
}
// Text-only styles (FG color + attrs) — used on the inner span
function cellFgStyle(cell) {
	let s = "color:" + fgCss(cell.fg) + ";";
	if (cell.bold) s += "font-weight:700;";
	if (cell.dim) s += "opacity:.35;";
	if (cell.underline) s += "text-decoration:underline;";
	if (cell.reverse) s += "filter:invert(1) hue-rotate(180deg);";
	return s;
}
// Stage preview: each char wrapped in a BG span + inner FG span
function renderStageChar(cell) {
	const bg = bgCss(cell.bg);
	const isSpace = cell.char === " " || cell.char === "\u00a0" || cell.char === "&nbsp;";
	const ch = isSpace ? "&nbsp;" : esc(cell.char);
	const inner = `<span style="${cellFgStyle(cell)}">${ch}</span>`;
	if (!bg) return inner;
	// space needs min-width so BG is visible; others get a small padding
	const spaceStyle =
		isSpace
			? `background:${bg};min-width:1ch;`
			: `background:${bg};padding:0 2px;`;
	return `<span style="${spaceStyle}">${inner}</span>`;
}
// Legacy alias (used in renderFrames / renderLib previews)
function cellCSS(cell) {
	return cellFgStyle(cell);
}
function cellANSI(cell) {
	const codes = [];
	if (cell.bold) codes.push("1");
	if (cell.dim) codes.push("2");
	if (cell.underline) codes.push("4");
	if (cell.reverse) codes.push("7");
	const fg = FG.find((x) => x.n === cell.fg);
	if (fg && fg.code) codes.push(fg.code);
	const bg = BG.find((x) => x.n === cell.bg);
	if (bg && bg.code) codes.push(bg.code);
	if (!codes.length) return cell.char;
	return `\\033[${codes.join(";")}m${cell.char}\\033[0m`;
}

// ═══════════════════════════════════════════════════════════
//  RENDER — STAGE
// ═══════════════════════════════════════════════════════════
function renderStage(f) {
	f = f || frames[curFrame];
	const stageFace = document.getElementById("stage-face");
	if (!stageFace) return;
	let fh = "";
	f.face.forEach((c) => {
		fh += renderStageChar(c);
	});
	stageFace.innerHTML = fh;
	const stageMsg = document.getElementById("stage-msg");
	if (!stageMsg) return;
	let mh = "";
	if (f.msg.length) {
		mh = '<span style="color:#333">&lt;&nbsp;</span>';
		f.msg.forEach((c) => {
			mh += renderStageChar(c);
		});
	}
	stageMsg.innerHTML = mh;
}

// ═══════════════════════════════════════════════════════════
//  RENDER — CHAR ROWS
// ═══════════════════════════════════════════════════════════
function renderRow(tgt) {
	const f = frames[curFrame];
	const cells = tgt === "face" ? f.face : f.msg;
	const sel = tgt === "face" ? selFace : selMsg;
	const rowEl = document.getElementById(
		tgt === "face" ? "face-row" : "msg-row",
	);
	if (!rowEl) return;
	rowEl.innerHTML = "";
	cells.forEach((cell, i) => {
		const d = document.createElement("div");
		d.className = "ccel" + (sel.has(i) ? " sel" : "");
		// BG goes on the cell itself — accurate to how terminals render character cells
		const bg = bgCss(cell.bg);
		if (bg) d.style.background = bg;
		// FG + attrs go on the inner span only
		const isSpace = cell.char === " " || cell.char === "\u00a0" || cell.char === "&nbsp;";
		const ch = isSpace ? "&nbsp;" : esc(cell.char);
		d.innerHTML = `<span style="${cellFgStyle(cell)}">${ch}</span>`;
		d.onclick = (e) => toggleSel(tgt, i, e.shiftKey);
		rowEl.appendChild(d);
	});
	// placeholder when empty
	if (!cells.length) {
		const p = document.createElement("div");
		p.style.cssText = "font-size:10px;color:var(--text3);padding:2px;";
		p.textContent = "(vacío)";
		rowEl.appendChild(p);
	}
}
function renderAllRows() {
	renderRow("face");
	renderRow("msg");
}

// ═══════════════════════════════════════════════════════════
//  RENDER — FRAMES TIMELINE  (with drag-to-reorder)
// ═══════════════════════════════════════════════════════════
let dragSrc = null;

function renderFrames() {
	const row = document.getElementById("frames-row");
	row.innerHTML = "";

	frames.forEach((f, i) => {
		const d = document.createElement("div");
		d.className = "fcard" + (i === curFrame ? " on" : "");
		d.draggable = true;
		d.dataset.idx = i;

		let mini = "";
		f.face.forEach((c) => {
			mini += renderStageChar(c);
		});
		d.innerHTML = `<div class="fcard-face">${mini}</div><div class="fcard-ms">${f.ms}ms</div>`;

		// click to select (ignore if we just dragged)
		d.addEventListener("click", () => {
			if (!d._dragged) selectFrame(i);
			d._dragged = false;
		});

		// drag events
		d.addEventListener("dragstart", (e) => {
			dragSrc = i;
			d.classList.add("dragging");
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", i); // required for Firefox
		});
		d.addEventListener("dragend", () => {
			d._dragged = true;
			document.querySelectorAll(".fcard").forEach((el) => {
				el.classList.remove("dragging", "drag-over-left", "drag-over-right");
			});
			dragSrc = null;
		});
		d.addEventListener("dragover", (e) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = "move";
			if (dragSrc === null || dragSrc === i) return;
			document
				.querySelectorAll(".fcard")
				.forEach((el) =>
					el.classList.remove("drag-over-left", "drag-over-right"),
				);
			// show indicator left or right depending on cursor position
			const rect = d.getBoundingClientRect();
			const mid = rect.left + rect.width / 2;
			d.classList.add(e.clientX < mid ? "drag-over-left" : "drag-over-right");
		});
		d.addEventListener("dragleave", () => {
			d.classList.remove("drag-over-left", "drag-over-right");
		});
		d.addEventListener("drop", (e) => {
			e.preventDefault();
			d.classList.remove("drag-over-left", "drag-over-right");
			if (dragSrc === null || dragSrc === i) return;

			// determine insert position (left/right of drop target)
			const rect = d.getBoundingClientRect();
			let insertAt = e.clientX < rect.left + rect.width / 2 ? i : i + 1;

			// remove src from array
			const [moved] = frames.splice(dragSrc, 1);

			// adjust insertAt after splice
			if (dragSrc < insertAt) insertAt--;

			frames.splice(insertAt, 0, moved);

			// keep selection on the moved frame
			curFrame = insertAt;
			selectFrame(curFrame);
		});

		row.appendChild(d);
	});
}

// ═══════════════════════════════════════════════════════════
//  RENDER — PALETTE HIGHLIGHTS
// ═══════════════════════════════════════════════════════════
function reflectPalette() {
	const f = frames[curFrame];
	const cells = target === "face" ? f.face : f.msg;
	const sel = [...(target === "face" ? selFace : selMsg)];
	if (!sel.length) {
		clearHighlights();
		return;
	}
	const first = cells[sel[0]];
	if (!first) return;
	FG.forEach((c) => {
		const b = document.getElementById("fg-" + c.n);
		if (b) b.classList.toggle("on", c.n === first.fg);
	});
	BG.forEach((c) => {
		const b = document.getElementById("bg-" + c.n);
		if (b) b.classList.toggle("on", c.n === first.bg);
	});
	ATTRS.forEach((a) => {
		const b = document.getElementById("at-" + a.n);
		if (b) b.classList.toggle("on", !!first[a.n]);
	});
}
function clearHighlights() {
	FG.forEach((c) => {
		const b = document.getElementById("fg-" + c.n);
		if (b) b.classList.remove("on");
	});
	BG.forEach((c) => {
		const b = document.getElementById("bg-" + c.n);
		if (b) b.classList.remove("on");
	});
	ATTRS.forEach((a) => {
		const b = document.getElementById("at-" + a.n);
		if (b) b.classList.remove("on");
	});
}

// ═══════════════════════════════════════════════════════════
//  RENDER — SEL INFO
// ═══════════════════════════════════════════════════════════
function renderSelInfo() {
	const f = frames[curFrame];
	const cells = target === "face" ? f.face : f.msg;
	const sel = [...(target === "face" ? selFace : selMsg)];
	const el = document.getElementById("sel-info");
	if (!sel.length) {
		el.textContent = "— click a character to select | shift+click = multiselection";
		return;
	}
	const chars = sel.map((i) => (cells[i] ? cells[i].char : "?")).join("");
	el.textContent = `selected: "${chars}"  (${sel.length} char${sel.length > 1 ? "s" : ""})`;
}

// ═══════════════════════════════════════════════════════════
//  MASTER RENDER
// ═══════════════════════════════════════════════════════════
function renderAll() {
	renderStage();
	renderAllRows();
	renderFrames();
	reflectPalette();
	renderSelInfo();
}

// ═══════════════════════════════════════════════════════════
//  SELECTION
// ═══════════════════════════════════════════════════════════
function toggleSel(tgt, idx, shift) {
	// switching target clears opposite selection
	if (tgt !== target) {
		selFace.clear();
		selMsg.clear();
		setTarget(tgt);
	}
	const sel = tgt === "face" ? selFace : selMsg;
	if (!shift) {
		sel.clear();
		sel.add(idx);
	} else {
		sel.has(idx) ? sel.delete(idx) : sel.add(idx);
	}
	renderAllRows();
	reflectPalette();
	renderSelInfo();
}
function selectAll(tgt) {
	const f = frames[curFrame];
	const cells = tgt === "face" ? f.face : f.msg;
	const sel = tgt === "face" ? selFace : selMsg;
	sel.clear();
	cells.forEach((_, i) => sel.add(i));
	if (tgt !== target) setTarget(tgt);
	renderAllRows();
	reflectPalette();
	renderSelInfo();
}

// ═══════════════════════════════════════════════════════════
//  TARGET TOGGLE
// ═══════════════════════════════════════════════════════════
function setTarget(t) {
	target = t;
	const wrapFace = document.getElementById("wrap-face");
	const wrapMsg = document.getElementById("wrap-msg");
	if (wrapFace) wrapFace.style.display = t === "face" ? "block" : "none";
	if (wrapMsg) wrapMsg.style.display = t === "msg" ? "block" : "none";
	renderAllRows();
	reflectPalette();
	renderSelInfo();
}

// ═══════════════════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════════════════
function switchTab(id, btn) {
	document.querySelectorAll(".tp").forEach((p) => p.classList.remove("on"));
	document.querySelectorAll(".tab").forEach((b) => b.classList.remove("on"));
	document.getElementById("tp-" + id).classList.add("on");
	if (btn) btn.classList.add("on");

	if (id === "face") setTarget("face");
	if (id === "test") {
		setTarget("face");
		renderTestScenarios();
		renderTestStageStatic();
	}
}

// ═══════════════════════════════════════════════════════════
//  APPLY STYLE
// ═══════════════════════════════════════════════════════════
function getSelCells() {
	const f = frames[curFrame];
	const cells = target === "face" ? f.face : f.msg;
	const sel = [...(target === "face" ? selFace : selMsg)];
	return { cells, sel };
}
function applyFg(name) {
	const { cells, sel } = getSelCells();
	if (!sel.length) {
		toast("Select characters first");
		return;
	}
	sel.forEach((i) => {
		if (cells[i]) cells[i].fg = name;
	});
	FG.forEach((c) => {
		const b = document.getElementById("fg-" + c.n);
		if (b) b.classList.toggle("on", c.n === name);
	});
	renderStage();
	renderAllRows();
	renderFrames();
}
function applyBg(name) {
	const { cells, sel } = getSelCells();
	if (!sel.length) {
		toast("Select characters first");
		return;
	}
	sel.forEach((i) => {
		if (cells[i]) cells[i].bg = name;
	});
	BG.forEach((c) => {
		const b = document.getElementById("bg-" + c.n);
		if (b) b.classList.toggle("on", c.n === name);
	});
	renderStage();
	renderAllRows();
	renderFrames();
}
function applyAttr(name) {
	const { cells, sel } = getSelCells();
	if (!sel.length) {
		toast("Select characters first");
		return;
	}
	const newVal = !cells[sel[0]][name];
	sel.forEach((i) => {
		if (cells[i]) cells[i][name] = newVal;
	});
	const b = document.getElementById("at-" + name);
	if (b) b.classList.toggle("on", newVal);
	renderStage();
	renderAllRows();
	renderFrames();
}
function clearSelStyle() {
	const { cells, sel } = getSelCells();
	sel.forEach((i) => {
		if (cells[i]) {
			cells[i].fg = "default";
			cells[i].bg = "none";
			cells[i].bold = false;
			cells[i].dim = false;
			cells[i].underline = false;
			cells[i].reverse = false;
		}
	});
	renderAll();
}
function clearAllStyles() {
	const f = frames[curFrame];
	[...f.face, ...f.msg].forEach((c) => {
		c.fg = "default";
		c.bg = "none";
		c.bold = false;
		c.dim = false;
		c.underline = false;
		c.reverse = false;
	});
	renderAll();
}

// ═══════════════════════════════════════════════════════════
//  INPUTS
// ═══════════════════════════════════════════════════════════
function onFaceInput() {
	const val = document.getElementById("face-in").value || "._.";
	const old = frames[curFrame].face;
	frames[curFrame].face = Array.from(val, (c, i) => {
		const oc = cloneCell(i < old.length ? old[i] : mkCell(c));
		oc.char = c;
		return oc;
	});
	selFace.clear();
	renderAll();
}
function onMsgInput() {
	if (!document.getElementById("msg-in")) return;
	const val = document.getElementById("msg-in").value || "";
	const old = frames[curFrame].msg;
	frames[curFrame].msg = Array.from(val, (c, i) => {
		const oc = cloneCell(i < old.length ? old[i] : mkCell(c));
		oc.char = c;
		return oc;
	});
	selMsg.clear();
	renderAll();
}
function onMsInput() {
	const input = document.getElementById("ms-in");
	const ms = parseFrameMs(input.value, { snap: true });
	frames[curFrame].ms = ms;
	input.value = ms;
	renderFrames();
}

// ═══════════════════════════════════════════════════════════
//  FRAME OPS
// ═══════════════════════════════════════════════════════════
function selectFrame(i) {
	curFrame = i;
	selFace.clear();
	selMsg.clear();
	const f = frames[i];
	document.getElementById("face-in").value = f.face.map((c) => c.char).join("");
	document.getElementById("ms-in").value = parseFrameMs(f.ms);
	const msgIn = document.getElementById("msg-in");
	if (msgIn) msgIn.value = f.msg.map((c) => c.char).join("");
	renderAll();
}
function addFrame() {
	const nf = cloneFrame(frames[curFrame]);
	nf.face = nf.face.map((c) => mkCell(c.char)); // clear styles on new frame
	frames.splice(curFrame + 1, 0, nf);
	selectFrame(curFrame + 1);
}
function dupFrame() {
	frames.splice(curFrame + 1, 0, cloneFrame(frames[curFrame]));
	selectFrame(curFrame + 1);
}
function delFrame() {
	if (frames.length <= 1) return;
	frames.splice(curFrame, 1);
	selectFrame(Math.min(curFrame, frames.length - 1));
}
function stepFrame(d) {
	selectFrame((curFrame + d + frames.length) % frames.length);
}
function goFirstFrame() {
	selectFrame(0);
}
function goLastFrame() {
	selectFrame(frames.length - 1);
}

// ═══════════════════════════════════════════════════════════
//  PLAY
// ═══════════════════════════════════════════════════════════
function setSpeed(v) {
	speedMul = 200 / parseInt(v);
	document.getElementById("speed-lbl").textContent = "x" + speedMul.toFixed(1);
}
function togglePlay() {
	playing = !playing;
	const b = document.getElementById("play-btn");
	b.textContent = playing ? "⏸" : "▶";
	b.classList.toggle("on", playing);
	if (playing) sched();
	else clearTimeout(playTimer);
}
function sched() {
	if (!playing) return;
	const frameMs = parseFrameMs(frames[curFrame].ms, { snap: false });
	if (frameMs === 0) {
		playing = false;
		const b = document.getElementById("play-btn");
		b.textContent = "▶";
		b.classList.remove("on");
		return;
	}
	const ms = Math.max(30, Math.round(frameMs * speedMul));
	playTimer = setTimeout(() => {
		selectFrame((curFrame + 1) % frames.length);
		sched();
	}, ms);
}

// ═══════════════════════════════════════════════════════════
//  QUICK FACES
// ═══════════════════════════════════════════════════════════
const FACES = [
	// neutral / waiting
	"._.", ".o.", ". .", "o_o", "o.o", "0_0",
	// happy / positive
	"^_^", "^-^", "^.^", "^o^", "^v^", "^w^", "n_n", ">w<",
	// winking / cheeky
	"^_-", "-_^", "o_^", "^.~", "o_-", "-_o",
	// sad / tired
	"u_u", "v_v", "T_T", "-_-", "=_=", "=.=", "-.-",
	// surprised / wide-eyed
	"o_O", "O_o", "O_O", "!_!",
	// dizzy / overwhelmed
	"@_@", "+_+", "*_*", "#_#", "~_~", "o~o",
	// angry / intense
	">_<", ">.<", ">_>",
	// skeptical / side-eye
	"<_<", "._o", "o_.", "?.?",
	// dead / distressed
	"x_x", "X_X",
	// misc
	"*o*", "q_p", "p_q", "d_b", "o_0",
];
function setFace(str) {
	document.getElementById("face-in").value = str;
	const old = frames[curFrame].face;
	frames[curFrame].face = Array.from(str, (c, i) => {
		const oc = cloneCell(i < old.length ? old[i] : mkCell(c));
		oc.char = c;
		return oc;
	});
	selFace.clear();
	renderAll();
}

// ═══════════════════════════════════════════════════════════
//  PRESETS
// ═══════════════════════════════════════════════════════════
const PRESETS_JSON_PATH = "./term-studio-presets.json";
const K_FRAMES = "fr";
const K_FACE = "fa";
const K_CHAR = "ch";
const K_BOLD = "bo";
const K_DIM = "di";
const K_UNDERLINE = "un";
const K_REVERSE = "rv";
const REQUIRED_STATES = ["idle", "think", "work", "ok", "error", "speak", "boot"];

function mkEmptyFrame() {
	return {
		face: [],
		msg: [],
		ms: DEFAULT_FRAME_MS,
	};
}

function ensureRequiredStates(setObj) {
	const missing = [];
	for (const name of REQUIRED_STATES) {
		const framesForState = setObj[name];
		if (!Array.isArray(framesForState) || !framesForState.length) {
			setObj[name] = [mkEmptyFrame()];
			missing.push(name);
		}
	}
	return missing;
}

function _stateSetFromPresetJSON(data) {
	if (!data || typeof data !== "object") return {};
	const src = data._meta ? Object.fromEntries(Object.entries(data).filter(([k]) => k !== "_meta")) : data;
	const out = {};
	for (const [name, sd] of Object.entries(src)) {
		const sFrames = sd && (sd[K_FRAMES] ?? sd.frames);
		if (!Array.isArray(sFrames) || !sFrames.length) continue;
		out[name] = _framesFromJSON(sFrames);
	}
	return out;
}

async function _loadPresetStateSetFromFile() {
	try {
		const res = await fetch(PRESETS_JSON_PATH, { cache: "no-store" });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		const loaded = _stateSetFromPresetJSON(data);
		if (!Object.keys(loaded).length) throw new Error("No valid states in presets JSON");
		return loaded;
	} catch (err) {
		console.warn("Preset JSON load failed, using minimal fallback state:", err);
		return null;
	}
}

// ═══════════════════════════════════════════════════════════
//  STATE SET MANAGEMENT
// ═══════════════════════════════════════════════════════════

async function initDefaultStates() {
	const loaded = await _loadPresetStateSetFromFile();
	if (loaded) {
		stateSet = loaded;
	} else {
		stateSet = {
			idle: [mkFrame("._.", 500, "")],
		};
	}

	const missing = ensureRequiredStates(stateSet);
	if (missing.length) {
		toast(`Missing required states were added: ${missing.join(", ")}`);
	}
}

function saveCurrentStateToSet() {
	if (currentState) stateSet[currentState] = frames.map(cloneFrame);
}

function switchState(name) {
	saveCurrentStateToSet();
	currentState = name;
	frames = stateSet[name].map(cloneFrame);
	curFrame = 0;
	selFace.clear();
	selMsg.clear();
	if (playing) togglePlay();
	selectFrame(0);
	renderStatesBar();
	ensureTestScenarioStates();
}

function addNewState() {
	const inp = document.getElementById("new-state-in");
	const raw = inp.value.trim();
	if (!raw) { toast("Enter a state name"); return; }
	const name = raw.replace(/\s+/g, "_").toLowerCase();
	if (stateSet[name]) { toast("State already exists: " + name); return; }
	saveCurrentStateToSet();
	stateSet[name] = [mkFrame("._.", DEFAULT_FRAME_MS, "")];
	inp.value = "";
	currentState = ""; // prevent overwriting old state on switch
	switchState(name);
	toast("Created state: " + name);
}

function deleteCurrentState() {
	const keys = Object.keys(stateSet);
	if (keys.length <= 1) { toast("Cannot delete the last state"); return; }
	if (REQUIRED_STATES.includes(currentState)) {
		toast(`Cannot delete required state: ${currentState}`);
		return;
	}
	if (!window.confirm(`Delete state "${currentState}"?`)) return;
	delete stateSet[currentState];
	const next = Object.keys(stateSet)[0];
	currentState = "";
	switchState(next);
	ensureTestScenarioStates();
	toast("Deleted state");
}

function renderStatesBar() {
	const bar = document.getElementById("states-bar");
	if (!bar) return;
	bar.innerHTML = "";
	Object.keys(stateSet).forEach((name) => {
		const b = document.createElement("button");
		b.className = "scard" + (name === currentState ? " on" : "");
		b.textContent = name;
		b.title = "Click to edit · double-click to rename";
		b.onclick = () => { if (name !== currentState) switchState(name); };
		b.ondblclick = () => {
			const newName = window.prompt("Rename state:", name);
			if (!newName) return;
			const clean = newName.trim().replace(/\s+/g, "_").toLowerCase();
			if (!clean || clean === name) return;
			if (stateSet[clean]) { toast("Name already taken"); return; }
			saveCurrentStateToSet();
			stateSet[clean] = stateSet[name];
			delete stateSet[name];
			if (currentState === name) currentState = clean;
			remapTestScenarioState(name, clean);
			renderStatesBar();
			toast("Renamed \u2192 " + clean);
		};
		bar.appendChild(b);
	});
}

// ─── JSON import / export ───────────────────────────────────

function _cellFromJSON(item) {
	if (typeof item === "string") return mkCell(item);
	const c = mkCell(item[K_CHAR] ?? item.char ?? " ");
	c.fg = normFg(item.fg ?? "");
	c.bg = normBg(item.bg ?? "");
	c.bold = !!(item[K_BOLD] ?? item.bold);
	c.dim = !!(item[K_DIM] ?? item.dim);
	c.underline = !!(item[K_UNDERLINE] ?? item.underline);
	c.reverse = !!(item[K_REVERSE] ?? item.reverse);
	return c;
}

function _framesFromJSON(jsonFrames) {
	return jsonFrames.map((jf) => ({
		face: (Array.isArray(jf[K_FACE]) ? jf[K_FACE] : Array.isArray(jf.face) ? jf.face : Array.from(String(jf[K_FACE] ?? jf.face ?? "._."))).map(_cellFromJSON),
		// Keep backward compatibility with legacy files that still include frame.msg.
		msg: (Array.isArray(jf.msg) ? jf.msg : Array.from(String(jf.msg ?? ""))).map(_cellFromJSON),
		ms: parseFrameMs(jf.ms),
	}));
}

function importStatesFromJSON(data) {
	if (data._meta) { data = Object.assign({}, data); delete data._meta; }
	const newSet = {};
	for (const [name, sd] of Object.entries(data)) {
		const sFrames = sd && (sd[K_FRAMES] ?? sd.frames);
		if (!Array.isArray(sFrames) || !sFrames.length) continue;
		newSet[name] = _framesFromJSON(sFrames);
	}
	if (!Object.keys(newSet).length) { toast("No valid states found in JSON"); return; }
	const missing = ensureRequiredStates(newSet);
	stateSet = newSet;
	currentState = "";
	switchState(Object.keys(stateSet)[0]);
	ensureTestScenarioStates();
	if (missing.length) {
		toast(`Loaded ${Object.keys(stateSet).length} state(s). Added missing required states: ${missing.join(", ")}`);
		return;
	}
	toast(`Loaded ${Object.keys(stateSet).length} state(s)`);
}

// ═══════════════════════════════════════════════════════════
//  TEST TAB — CHAINED SCENARIOS
// ═══════════════════════════════════════════════════════════
function _defaultScenario() {
	const first = Object.keys(stateSet)[0] || "idle";
	return {
		state: first,
		message: "",
		mode: "plain",
		duration: 1800,
		msgCells: [],
		sel: new Set(),
		loaderOpts: { width: 12, filled_char: "=", empty_char: "-", tip_char: ">", fg_filled: "br_grn", fg_empty: "gray", fg_pct: "white", show_pct: true, bold: false },
	};
}

function _scenarioSel(sc) {
	if (!(sc.sel instanceof Set)) sc.sel = new Set();
	return sc.sel;
}

function _syncScenarioMsgCells(sc) {
	const text = sc.message || "";
	const old = Array.isArray(sc.msgCells) ? sc.msgCells : [];
	sc.msgCells = Array.from(text, (ch, i) => {
		const oc = cloneCell(i < old.length ? old[i] : mkCell(ch));
		oc.char = ch;
		return oc;
	});
}

function initTestScenarios() {
	testScenarios = [_defaultScenario()];
	renderTestScenarios();
	renderTestStageStatic();
}

function ensureTestScenarioStates() {
	const names = Object.keys(stateSet);
	if (!names.length) return;
	testScenarios.forEach((sc) => {
		if (!names.includes(sc.state)) sc.state = names[0];
		_syncScenarioMsgCells(sc);
		_scenarioSel(sc);
	});
	renderTestScenarios();
	renderTestStageStatic();
}

function remapTestScenarioState(oldName, newName) {
	testScenarios.forEach((sc) => {
		if (sc.state === oldName) sc.state = newName;
	});
	renderTestScenarios();
	renderTestStageStatic();
}

function addTestScenario() {
	if (testScenarios.length >= MAX_TEST_SCENARIOS) {
		toast("Maximum 5 scenarios");
		return;
	}
	testScenarios.push(_defaultScenario());
	renderTestScenarios();
}

function removeTestScenario(i) {
	if (testScenarios.length <= 1) {
		toast("Keep at least one scenario");
		return;
	}
	testScenarios.splice(i, 1);
	renderTestScenarios();
	renderTestStageStatic();
}

function updateTestScenario(i, key, value) {
	if (!testScenarios[i]) return;
	if (key === "duration") {
		const n = parseInt(value);
		testScenarios[i].duration = Math.max(200, Number.isNaN(n) ? 1800 : n);
	} else {
		testScenarios[i][key] = value;
		if (key === "message") {
			_syncScenarioMsgCells(testScenarios[i]);
			_scenarioSel(testScenarios[i]).clear();
			renderTestMsgRow(i);
			renderTestSelInfo(i);
			reflectTestPalette(i);
		}
	}
	renderTestStageStatic(i);
}

function _fgOptions(selected) {
	return FG.filter((c) => c.n !== "default")
		.map((c) => `<option value="${c.n}" ${c.n === selected ? "selected" : ""}>${c.lbl || c.n}</option>`)
		.join("");
}

function updateLoaderOpt(i, key, value) {
	const sc = testScenarios[i];
	if (!sc) return;
	if (!sc.loaderOpts) sc.loaderOpts = {};
	if (key === "width") {
		sc.loaderOpts.width = Math.max(1, parseInt(value) || 12);
	} else if (key === "show_pct" || key === "bold") {
		sc.loaderOpts[key] = !!value;
	} else {
		sc.loaderOpts[key] = value;
	}
	renderTestStageStatic(i);
}

function toggleLoaderOpts(i, mode) {
	const loaderEl = document.getElementById(`loader-opts-${i}`);
	const editorEl = document.getElementById(`test-scenario-editor-${i}`);
	if (loaderEl) loaderEl.style.display = mode === "loading" ? "block" : "none";
	if (editorEl) editorEl.style.display = mode === "loading" ? "none" : "block";
}

function renderTestScenarios() {
	const wrap = document.getElementById("test-scenarios");
	if (!wrap) return;
	const stateNames = Object.keys(stateSet);
	wrap.innerHTML = "";

	testScenarios.forEach((sc, i) => {
		_syncScenarioMsgCells(sc);
		_scenarioSel(sc);
		const row = document.createElement("div");
		row.className = "test-scenario-row";
		const options = stateNames
			.map((name) => `<option value="${esc(name)}" ${name === sc.state ? "selected" : ""}>${esc(name)}</option>`)
			.join("");
		const lo = sc.loaderOpts || {};
		row.innerHTML = `
			<div class="test-scenario-head">
				<span>Scenario ${i + 1}</span>
				<div style="display:flex;gap:5px">
					<button class="btn" onclick="downloadScenarioPy(${i})" title="Download as Python file">&#8595; .py</button>
					<button class="btn danger" onclick="removeTestScenario(${i})">✕ remove</button>
				</div>
			</div>
			<div class="test-scenario-grid">
				<label>State</label>
				<select onchange="updateTestScenario(${i}, 'state', this.value)">${options}</select>
				<label>Message</label>
				<input type="text" value="${esc(sc.message)}" placeholder="Type message here..." oninput="updateTestScenario(${i}, 'message', this.value)">
				<label>Mode</label>
				<select onchange="updateTestScenario(${i}, 'mode', this.value); toggleLoaderOpts(${i}, this.value)">
					<option value="plain" ${sc.mode === "plain" ? "selected" : ""}>Plain</option>
					<option value="typewriter" ${sc.mode === "typewriter" ? "selected" : ""}>Typewriter</option>
					<option value="loading" ${sc.mode === "loading" ? "selected" : ""}>Loading bar</option>
				</select>
				<label>Duration (ms)</label>
				<input type="number" min="200" step="100" value="${sc.duration}" oninput="updateTestScenario(${i}, 'duration', this.value)">
			</div>
			<div class="loader-opts" id="loader-opts-${i}" style="display:${sc.mode === 'loading' ? 'block' : 'none'}; margin-top:8px; padding-top:8px; border-top:0.5px solid var(--bord2)">
				<div class="sh" style="margin-bottom:6px">Loader Options</div>
				<div class="test-scenario-grid">
					<label>Width</label>
					<input type="number" min="4" max="40" value="${lo.width ?? 12}" oninput="updateLoaderOpt(${i}, 'width', this.value)" />
					<label>Filled char</label>
					<input type="text" maxlength="1" value="${esc(lo.filled_char ?? '=')}" oninput="updateLoaderOpt(${i}, 'filled_char', this.value)" style="width:40px" />
					<label>Empty char</label>
					<input type="text" maxlength="1" value="${esc(lo.empty_char ?? '-')}" oninput="updateLoaderOpt(${i}, 'empty_char', this.value)" style="width:40px" />
					<label>Tip char</label>
					<input type="text" maxlength="1" value="${esc(lo.tip_char ?? '>')}" oninput="updateLoaderOpt(${i}, 'tip_char', this.value)" style="width:40px" />
					<label>Fill color</label>
					<select onchange="updateLoaderOpt(${i}, 'fg_filled', this.value)">${_fgOptions(lo.fg_filled ?? 'br_grn')}</select>
					<label>Empty color</label>
					<select onchange="updateLoaderOpt(${i}, 'fg_empty', this.value)">${_fgOptions(lo.fg_empty ?? 'gray')}</select>
					<label>% color</label>
					<select onchange="updateLoaderOpt(${i}, 'fg_pct', this.value)">${_fgOptions(lo.fg_pct ?? 'white')}</select>
					<label>Show %</label>
					<input type="checkbox" ${(lo.show_pct !== false) ? 'checked' : ''} onchange="updateLoaderOpt(${i}, 'show_pct', this.checked)" />
					<label>Bold</label>
					<input type="checkbox" ${lo.bold ? 'checked' : ''} onchange="updateLoaderOpt(${i}, 'bold', this.checked)" />
				</div>
			</div>
			<div class="test-scenario-editor" id="test-scenario-editor-${i}" style="display:${sc.mode === 'loading' ? 'none' : 'block'}">
				<div class="sh" style="margin: 8px 0 6px">Message Style (Per Character)</div>
				<div class="char-row" id="test-msg-row-${i}"></div>
				<div class="sel-info" id="test-sel-info-${i}">— click a character to select | shift+click = multi-selection</div>
				<div style="display: flex; gap: 6px;">
					<button class="btn" onclick="selectAllTest(${i})">select all</button>
					<button class="btn danger" onclick="clearTestSelStyle(${i})">clear selected</button>
					<button class="btn danger" onclick="clearAllTestStyles(${i})">clear all</button>
				</div>
				<div class="test-scenario-palettes">
					<div>
						<div class="sh" style="margin-bottom: 5px">Text Color</div>
						<div class="palette" id="test-fg-pal-${i}"></div>
					</div>
					<div>
						<div class="sh" style="margin-bottom: 5px">Background</div>
						<div class="palette" id="test-bg-pal-${i}"></div>
					</div>
				</div>
				<div style="margin-top:6px;">
					<div class="sh" style="margin-bottom: 5px">Attributes</div>
					<div class="attr-row" id="test-attr-row-${i}"></div>
				</div>
			</div>
		`;
		wrap.appendChild(row);
		renderTestMsgRow(i);
		buildScenarioPalette(i);
		renderTestSelInfo(i);
		reflectTestPalette(i);
	});

	const count = document.getElementById("test-count");
	if (count) count.textContent = `${testScenarios.length}/${MAX_TEST_SCENARIOS}`;
}

function buildScenarioPalette(i) {
	const fgEl = document.getElementById("test-fg-pal-" + i);
	if (fgEl && !fgEl.childElementCount) {
		FG.forEach((c) => {
			const d = document.createElement("div");
			d.className = "sw";
			d.id = `test-${i}-fg-${c.n}`;
			const swBg = c.n === "black" ? "#aaaaaa" : c.n === "default" ? "#2a2a2a" : c.css;
			d.style.background = swBg;
			d.innerHTML = `<span style="font-weight:700;color:${c.css};">A</span><span class="sw-tip">${c.lbl}</span>`;
			d.onclick = () => applyTestFg(i, c.n);
			fgEl.appendChild(d);
		});
	}
	const bgEl = document.getElementById("test-bg-pal-" + i);
	if (bgEl && !bgEl.childElementCount) {
		BG.forEach((c) => {
			const d = document.createElement("div");
			d.className = "sw";
			d.id = `test-${i}-bg-${c.n}`;
			d.style.background = c.css === "transparent" ? "#1a1a1a" : c.css;
			d.style.color = c.css === "transparent" ? "#555" : "#ccc";
			d.innerHTML = `<span style="font-size:9px;">${c.n === "none" ? "∅" : "■"}</span><span class="sw-tip">${c.lbl}</span>`;
			d.onclick = () => applyTestBg(i, c.n);
			bgEl.appendChild(d);
		});
	}
	const atEl = document.getElementById("test-attr-row-" + i);
	if (atEl && !atEl.childElementCount) {
		ATTRS.forEach((a) => {
			const b = document.createElement("button");
			b.className = "attr-btn";
			b.id = `test-${i}-at-${a.n}`;
			b.textContent = a.lbl;
			b.style.cssText += ";" + a.css;
			b.onclick = () => applyTestAttr(i, a.n);
			atEl.appendChild(b);
		});
	}
}

function renderTestMsgRow(scenarioIdx) {
	const rowEl = document.getElementById("test-msg-row-" + scenarioIdx);
	if (!rowEl) return;
	const sc = testScenarios[scenarioIdx];
	if (!sc) {
		rowEl.innerHTML = "";
		return;
	}
	const sel = _scenarioSel(sc);
	_syncScenarioMsgCells(sc);
	rowEl.innerHTML = "";
	sc.msgCells.forEach((cell, charIdx) => {
		const d = document.createElement("div");
		d.className = "ccel" + (sel.has(charIdx) ? " sel" : "");
		const bg = bgCss(cell.bg);
		if (bg) d.style.background = bg;
		const isSpace = cell.char === " " || cell.char === "\u00a0" || cell.char === "&nbsp;";
		const ch = isSpace ? "&nbsp;" : esc(cell.char);
		d.innerHTML = `<span style="${cellFgStyle(cell)}">${ch}</span>`;
		d.onclick = (e) => toggleTestSel(scenarioIdx, charIdx, e.shiftKey);
		rowEl.appendChild(d);
	});
	if (!sc.msgCells.length) {
		const p = document.createElement("div");
		p.style.cssText = "font-size:10px;color:var(--text3);padding:2px;";
		p.textContent = "(empty message)";
		rowEl.appendChild(p);
	}
}

function renderTestSelInfo(i) {
	const el = document.getElementById("test-sel-info-" + i);
	if (!el) return;
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) {
		el.textContent = "— click a character to select · shift+click = multi —";
		return;
	}
	const chars = [...sel].map((idx) => (sc.msgCells[idx] ? sc.msgCells[idx].char : "?")).join("");
	el.textContent = `selected: "${chars}"  (${sel.size} char${sel.size > 1 ? "s" : ""})`;
}

function toggleTestSel(scenarioIdx, idx, shift) {
	const sc = testScenarios[scenarioIdx];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!shift) {
		sel.clear();
		sel.add(idx);
	} else {
		sel.has(idx) ? sel.delete(idx) : sel.add(idx);
	}
	renderTestMsgRow(scenarioIdx);
	reflectTestPalette(scenarioIdx);
	renderTestSelInfo(scenarioIdx);
}

function reflectTestPalette(i) {
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) {
		FG.forEach((c) => {
			const b = document.getElementById(`test-${i}-fg-${c.n}`);
			if (b) b.classList.remove("on");
		});
		BG.forEach((c) => {
			const b = document.getElementById(`test-${i}-bg-${c.n}`);
			if (b) b.classList.remove("on");
		});
		ATTRS.forEach((a) => {
			const b = document.getElementById(`test-${i}-at-${a.n}`);
			if (b) b.classList.remove("on");
		});
		return;
	}
	const first = sc.msgCells[[...sel][0]];
	if (!first) return;
	FG.forEach((c) => {
		const b = document.getElementById(`test-${i}-fg-${c.n}`);
		if (b) b.classList.toggle("on", c.n === first.fg);
	});
	BG.forEach((c) => {
		const b = document.getElementById(`test-${i}-bg-${c.n}`);
		if (b) b.classList.toggle("on", c.n === first.bg);
	});
	ATTRS.forEach((a) => {
		const b = document.getElementById(`test-${i}-at-${a.n}`);
		if (b) b.classList.toggle("on", !!first[a.n]);
	});
}

function selectAllTest(i) {
	const sc = testScenarios[i];
	if (!sc) return;
	_syncScenarioMsgCells(sc);
	const sel = _scenarioSel(sc);
	sel.clear();
	sc.msgCells.forEach((_, idx) => sel.add(idx));
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestSelInfo(i);
}

function clearTestSelStyle(i) {
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) { toast("Select message characters first"); return; }
	sel.forEach((idx) => {
		if (sc.msgCells[idx]) {
			sc.msgCells[idx].fg = "default";
			sc.msgCells[idx].bg = "none";
			sc.msgCells[idx].bold = false;
			sc.msgCells[idx].dim = false;
			sc.msgCells[idx].underline = false;
			sc.msgCells[idx].reverse = false;
		}
	});
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestStageStatic(i);
}

function clearAllTestStyles(i) {
	const sc = testScenarios[i];
	if (!sc) return;
	sc.msgCells.forEach((c) => {
		c.fg = "default";
		c.bg = "none";
		c.bold = false;
		c.dim = false;
		c.underline = false;
		c.reverse = false;
	});
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestStageStatic(i);
}

function applyTestFg(i, name) {
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) {
		toast("Select message characters first");
		return;
	}
	sel.forEach((idx) => {
		if (sc.msgCells[idx]) sc.msgCells[idx].fg = name;
	});
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestStageStatic(i);
}

function applyTestBg(i, name) {
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) {
		toast("Select message characters first");
		return;
	}
	sel.forEach((idx) => {
		if (sc.msgCells[idx]) sc.msgCells[idx].bg = name;
	});
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestStageStatic(i);
}

function applyTestAttr(i, name) {
	const sc = testScenarios[i];
	if (!sc) return;
	const sel = _scenarioSel(sc);
	if (!sel.size) {
		toast("Select message characters first");
		return;
	}
	const first = sc.msgCells[[...sel][0]];
	const newVal = !first[name];
	sel.forEach((idx) => {
		if (sc.msgCells[idx]) sc.msgCells[idx][name] = newVal;
	});
	renderTestMsgRow(i);
	reflectTestPalette(i);
	renderTestStageStatic(i);
}

function _framesForState(stateName) {
	if (stateName === currentState && Array.isArray(frames) && frames.length) {
		return frames;
	}
	return stateSet[stateName] || [];
}

function _stateFrameAtElapsed(stateName, elapsedMs) {
	const frs = _framesForState(stateName);
	if (!frs.length) return mkFrame("._.", DEFAULT_FRAME_MS, "");

	const parsed = frs.map((f) => ({ frame: f, ms: parseFrameMs(f.ms, { snap: false }) }));
	const stopIdx = parsed.findIndex((it) => it.ms === 0);

	if (stopIdx !== -1) {
		let t = Math.max(0, elapsedMs);
		for (let i = 0; i < stopIdx; i++) {
			const ms = parsed[i].ms;
			if (t < ms) return parsed[i].frame;
			t -= ms;
		}
		return parsed[stopIdx].frame;
	}

	const total = parsed.reduce((sum, it) => sum + it.ms, 0);
	if (total <= 0) return parsed[parsed.length - 1].frame;
	let t = Math.max(0, elapsedMs) % total;
	for (const it of parsed) {
		if (t < it.ms) return it.frame;
		t -= it.ms;
	}
	return parsed[parsed.length - 1].frame;
}

function _loadingBar(pct, opts = {}) {
	const width = Math.max(1, parseInt(opts.width) || 12);
	const filledChar = (opts.filled_char || "=")[0] || "=";
	const emptyChar = (opts.empty_char || "-")[0] || "-";
	const tipChar = (opts.tip_char || ">")[0] || ">";
	const fgFilled = opts.fg_filled || "br_grn";
	const fgEmpty = opts.fg_empty || "gray";
	const fgPct = opts.fg_pct || "white";
	const showPct = opts.show_pct !== false;
	const bold = !!opts.bold;

	const clamped = Math.max(0, Math.min(100, pct));
	const filledN = Math.round((clamped / 100) * width);
	const emptyN = width - filledN;

	const cells = [];
	const addCell = (ch, fg, isBold = false, dim = false) => {
		const c = mkCell(ch);
		c.fg = fg;
		c.bold = isBold;
		c.dim = dim;
		return c;
	};

	cells.push(addCell("[", fgEmpty, false, true));
	if (filledN > 0) {
		for (let j = 0; j < filledN - 1; j++) cells.push(addCell(filledChar, fgFilled, bold));
		cells.push(addCell(clamped < 100 ? tipChar : filledChar, fgFilled, bold));
	}
	for (let j = 0; j < emptyN; j++) cells.push(addCell(emptyChar, fgEmpty, false, true));
	cells.push(addCell("]", fgEmpty, false, true));
	if (showPct) {
		const pctStr = ` ${String(Math.round(clamped)).padStart(3)}%`;
		for (const ch of pctStr) cells.push(addCell(ch, fgPct, bold));
	}
	return cells;
}

function _scenarioMessage(sc, elapsedMs) {
	const duration = Math.max(200, parseInt(sc.duration) || 1800);
	const text = sc.message || "";
	_syncScenarioMsgCells(sc);
	if (sc.mode === "typewriter") {
		if (!text.length) return [];
		const n = Math.min(text.length, Math.floor(Math.max(0, elapsedMs) / TYPEWRITER_CHAR_MS));
		return sc.msgCells.slice(0, n).map(cloneCell);
	}
	if (sc.mode === "loading") {
		const pct = Math.max(0, Math.min(100, Math.floor((elapsedMs / duration) * 100)));
		return _loadingBar(pct, sc.loaderOpts || {});
	}
	return sc.msgCells.map(cloneCell);
}

// ─── MARKUP SERIALIZER ────────────────────────────────────────────────────────
// Convert an array of styled cells to the T.E.R.M. markup string understood
// by `markup <text>` and `RichText.markup()`.
// Adjacent cells with identical style are merged into one run.
// Color names are denormalized from editor abbreviations (br_cyn → br_cyan).
function cellsToMarkup(cells) {
	if (!cells || !cells.length) return "";

	// group consecutive cells sharing the same style
	const runs = [];
	let cur = null;
	for (const cell of cells) {
		const key = `${cell.fg}|${cell.bg}|${+!!cell.bold}${+!!cell.dim}${+!!cell.underline}${+!!cell.reverse}`;
		if (cur && cur.key === key) {
			cur.text += cell.char;
		} else {
			cur = { key, text: cell.char, cell };
			runs.push(cur);
		}
	}

	return runs.map(({ text, cell }) => {
		const flags = [];
		const pyFg = denormFg(cell.fg);   // "default" → ""
		const pyBg = denormBg(cell.bg);   // "none" → ""
		if (pyFg) flags.push(pyFg);
		if (pyBg) flags.push("bg:" + pyBg);
		if (cell.bold) flags.push("bold");
		if (cell.dim) flags.push("dim");
		if (cell.underline) flags.push("underline");
		if (cell.reverse) flags.push("reverse");
		if (!flags.length) return text;
		return `[${flags.join(" ")}]${text}[/]`;
	}).join("");
}

function renderTestStage(faceCells, msgCells, metaText = "") {
	const faceEl = document.getElementById("test-stage-face");
	const msgEl = document.getElementById("test-stage-msg");
	const metaEl = document.getElementById("test-stage-meta");
	if (!faceEl || !msgEl || !metaEl) return;
	faceEl.innerHTML = (faceCells || []).map(renderStageChar).join("");
	msgEl.innerHTML = (msgCells || []).map(renderStageChar).join("");
	metaEl.textContent = metaText;
}

function renderTestStageStatic(scenarioIdx = 0) {
	if (!testScenarios.length) return;
	const idx = Math.max(0, Math.min(testScenarios.length - 1, parseInt(scenarioIdx, 10) || 0));
	const sc = testScenarios[idx];
	const frame = _stateFrameAtElapsed(sc.state, 0);
	const msg = _scenarioMessage(sc, 0);
	renderTestStage(frame.face, msg, `scenario ${idx + 1}/${testScenarios.length} · ${sc.state}`);
}

function stopTestChain(reset = true) {
	testRunToken += 1;
	testIsRunning = false;
	const runBtn = document.getElementById("test-run-btn");
	if (runBtn) runBtn.textContent = "▶ run chain";
	if (reset) renderTestStageStatic();
}

function _runSingleScenario(sc, idx, total, token) {
	return new Promise((resolve) => {
		const startedAt = performance.now();
		const duration = Math.max(200, parseInt(sc.duration) || 1800);
		const tick = () => {
			if (token !== testRunToken) {
				resolve();
				return;
			}
			const elapsed = performance.now() - startedAt;
			const frame = _stateFrameAtElapsed(sc.state, elapsed);
			const msg = _scenarioMessage(sc, Math.min(elapsed, duration));
			renderTestStage(
				frame.face,
				msg,
				`scenario ${idx + 1}/${total} · ${sc.state} · ${Math.round(duration)}ms`,
			);
			if (elapsed >= duration) {
				resolve();
				return;
			}
			requestAnimationFrame(tick);
		};
		tick();
	});
}

async function runTestChain() {
	if (testIsRunning) {
		stopTestChain(false);
		return;
	}
	if (!testScenarios.length) {
		toast("Add at least one scenario");
		return;
	}
	testIsRunning = true;
	const runBtn = document.getElementById("test-run-btn");
	if (runBtn) runBtn.textContent = "⏹ stop";
	const token = ++testRunToken;
	for (let i = 0; i < testScenarios.length; i++) {
		if (token !== testRunToken) return;
		await _runSingleScenario(testScenarios[i], i, testScenarios.length, token);
	}
	if (token !== testRunToken) return;
	testIsRunning = false;
	if (runBtn) runBtn.textContent = "▶ run chain";
}

function exportStatesToJSON() {
	saveCurrentStateToSet();
	const out = {};
	for (const [name, frs] of Object.entries(stateSet)) {
		out[name] = {
			[K_FRAMES]: frs.map((f) => ({
				ms: f.ms,
				[K_FACE]: f.face.map((c) => ({ [K_CHAR]: c.char, fg: denormFg(c.fg), bg: denormBg(c.bg), [K_BOLD]: c.bold, [K_DIM]: c.dim, [K_UNDERLINE]: c.underline, [K_REVERSE]: c.reverse })),
			})),
		};
	}
	return out;
}

function importStatesFile() {
	document.getElementById("import-json-input").click();
}

function onImportFileChange(input) {
	const file = input.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			importStatesFromJSON(JSON.parse(e.target.result));
		} catch (err) {
			toast("Invalid JSON: " + err.message);
		}
	};
	reader.readAsText(file);
	input.value = ""; // reset so the same file can be re-imported
}

// ─── SCENARIO → PYTHON EXPORT ───────────────────────────────────────────────
// Generates a self-contained .py snippet that reproduces the scenario using
// the TERM Python API.  No daemon/stdin needed — caller just runs the file.
function scenarioToPython(sc, idx) {
	const lines = [];
	const state = sc.state || "idle";
	const duration = Math.max(200, parseInt(sc.duration) || 1800);
	const durationS = (duration / 1000).toFixed(2);
	const mode = sc.mode || "plain";

	lines.push(`# T.E.R.M. scenario ${idx + 1} — exported from Studio`);
	lines.push(`from term import TERM`);
	lines.push(`from term import message`);
	lines.push(`import time`);
	lines.push(``);
	lines.push(`bot = TERM()`);
	lines.push(`bot.start("${state}")`);
	lines.push(``);

	if (mode === "plain") {
		const markup = cellsToMarkup(sc.msgCells || []);
		const hasStyle = (markup.includes("["));
		if (!markup) {
			lines.push(`# no message`);
		} else if (hasStyle) {
			lines.push(`bot.markup(${_pyStr(markup)})`);
		} else {
			lines.push(`bot.set_msg(${_pyStr(markup)})`);
		}
		lines.push(`time.sleep(${durationS})`);

	} else if (mode === "typewriter") {
		const markup = cellsToMarkup(sc.msgCells || []);
		const hasStyle = markup.includes("[");
		// typewriter with per-char style must use markup + say won't help;
		// fall back to markup + sleep when styled, say() when plain.
		if (hasStyle) {
			lines.push(`# styled typewriter — uses markup (instant, no char-by-char delay)`);
			lines.push(`bot.markup(${_pyStr(markup)})`);
		} else {
			lines.push(`bot.say(${_pyStr(sc.message || "")}, total_duration_ms=${duration})`);
		}
		lines.push(`time.sleep(${durationS})`);

	} else if (mode === "loading") {
		const lo = sc.loaderOpts || {};
		const kwParts = [];
		if ((lo.width ?? 12) !== 12) kwParts.push(`width=${lo.width}`);
		if ((lo.filled_char ?? "=") !== "=") kwParts.push(`filled_char=${_pyStr(lo.filled_char)}`);
		if ((lo.empty_char ?? "-") !== "-") kwParts.push(`empty_char=${_pyStr(lo.empty_char)}`);
		if ((lo.tip_char ?? ">") !== ">") kwParts.push(`tip_char=${_pyStr(lo.tip_char)}`);
		if ((lo.fg_filled ?? "br_grn") !== "br_grn") kwParts.push(`fg_filled=${_pyStr(denormFg(lo.fg_filled))}`);
		if ((lo.fg_empty ?? "gray") !== "gray") kwParts.push(`fg_empty=${_pyStr(denormFg(lo.fg_empty))}`);
		if ((lo.fg_pct ?? "white") !== "white") kwParts.push(`fg_pct=${_pyStr(denormFg(lo.fg_pct))}`);
		if (lo.show_pct === false) kwParts.push(`show_pct=False`);
		if (lo.bold) kwParts.push(`bold=True`);
		const kwStr = kwParts.length ? ", " + kwParts.join(", ") : "";
		const steps = 20;
		const sleepS = (duration / 1000 / steps).toFixed(3);
		lines.push(`steps = ${steps}`);
		lines.push(`for i in range(steps + 1):`);
		lines.push(`    bot.progress(i * 100 / steps${kwStr})`);
		lines.push(`    time.sleep(${sleepS})`);
	}

	lines.push(``);
	lines.push(`bot.stop()`);
	return lines.join("\n");
}

function _pyStr(s) {
	// Produce a Python string literal, preferring single quotes.
	const escaped = String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
	return `'${escaped}'`;
}

function downloadScenarioPy(i) {
	const sc = testScenarios[i];
	if (!sc) return;
	_syncScenarioMsgCells(sc);
	const code = scenarioToPython(sc, i);
	const blob = new Blob([code], { type: "text/x-python" });
	const url = URL.createObjectURL(blob);
	const fname = `term_scenario_${i + 1}.py`;
	const a = Object.assign(document.createElement("a"), { href: url, download: fname });
	a.click();
	URL.revokeObjectURL(url);
	toast(`Downloaded ${fname}`);
}

function exportScenariosToJSON() {
	return {
		scenarios: testScenarios.map((sc) => {
			_syncScenarioMsgCells(sc);
			return {
				state: sc.state,
				message: sc.message,
				mode: sc.mode,
				duration: sc.duration,
				msg: (sc.msgCells || []).map((c) => ({
					[K_CHAR]: c.char,
					fg: denormFg(c.fg),
					bg: denormBg(c.bg),
					[K_BOLD]: c.bold,
					[K_DIM]: c.dim,
					[K_UNDERLINE]: c.underline,
					[K_REVERSE]: c.reverse,
				})),
				loaderOpts: { ...(sc.loaderOpts || {}) },
			};
		}),
	};
}

function downloadScenariosJson() {
	if (!testScenarios.length) {
		toast("No scenarios to export");
		return;
	}
	const json = JSON.stringify(exportScenariosToJSON(), null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), { href: url, download: "term-scenarios.json" });
	a.click();
	URL.revokeObjectURL(url);
	toast("Downloaded term-scenarios.json");
}

function downloadAllScenariosPy() {
	if (!testScenarios.length) return;
	const sections = testScenarios.map((sc, i) => {
		_syncScenarioMsgCells(sc);
		return scenarioToPython(sc, i);
	});
	// Strip the boilerplate from all but the first scenario, then join with separators.
	// Each scenarioToPython emits its own imports + bot = TERM() + bot.stop().
	// For a combined file we keep one header and one footer.
	const header = [
		"# T.E.R.M. scenarios \u2014 exported from Studio",
		"from term import TERM",
		"from term import message",
		"import time",
		"",
		"bot = TERM()",
		"bot.start(\"boot\")",
		"",
	].join("\n");
	const stripBoilerplate = (code) =>
		code
			.replace(/^# T\.E\.R\.M\..*\n/, "")
			.replace(/^from term import TERM\n/m, "")
			.replace(/^from term import message\n/m, "")
			.replace(/^import time\n/m, "")
			.replace(/^\n*bot = TERM\(\)\n/m, "")
			.replace(/^bot\.start\(.*\)\n/m, "")
			.replace(/^bot\.stop\(\)\n?/m, "")
			.replace(/^\n+/, "");
	const body = sections
		.map((code, i) => `# ─ scenario ${i + 1} ────\n` + stripBoilerplate(code))
		.join("\n");
	const footer = "\nbot.stop()\n";
	const blob = new Blob([header + body + footer], { type: "text/x-python" });
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), { href: url, download: "term_scenarios.py" });
	a.click();
	URL.revokeObjectURL(url);
	toast("Downloaded term_scenarios.py");
}

function exportStatesFile() {
	const json = JSON.stringify(exportStatesToJSON(), null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = Object.assign(document.createElement("a"), { href: url, download: "term-states.json" });
	a.click();
	URL.revokeObjectURL(url);
	toast("Exported term-states.json");
}

// ═══════════════════════════════════════════════════════════
//  LIBRARY
// ═══════════════════════════════════════════════════════════
function saveToLib() {
	const name =
		document.getElementById("lib-name").value.trim() ||
		"anim_" + (Object.keys(library).length + 1);
	library[name] = frames.map(cloneFrame);
	document.getElementById("lib-name").value = "";
	renderLib();
	toast("Saved: " + name);
}
function renderLib() {
	const el = document.getElementById("lib-list");
	el.innerHTML = "";
	if (!Object.keys(library).length) {
		el.innerHTML =
			'<div style="font-size:11px;color:var(--text3);">No animations saved yet.</div>';
		return;
	}
	Object.entries(library).forEach(([name, frs]) => {
		const row = document.createElement("div");
		row.className = "lib-entry";
		let prev = "";
		frs[0].face.forEach((c) => {
			prev += renderStageChar(c);
		});
		row.innerHTML = `
      <span style="font-size:12px;color:var(--text);min-width:110px;">${esc(name)}</span>
      <span style="font-size:14px;letter-spacing:.06em;">${prev}</span>
      <span style="font-size:10px;color:var(--text3);margin-left:auto;">${frs.length}f</span>
      <button class="btn" onclick="loadFromLib('${esc(name)}')">load</button>
      <button class="btn danger" onclick="delFromLib('${esc(name)}')">✕</button>`;
		el.appendChild(row);
	});
}
function loadFromLib(name) {
	if (playing) togglePlay();
	frames = library[name].map(cloneFrame);
	curFrame = 0;
	selFace.clear();
	selMsg.clear();
	selectFrame(0);
	switchTab("face", document.getElementById("tab-face"));
	toast("Loaded: " + name);
}
function delFromLib(name) {
	delete library[name];
	renderLib();
}

// ═══════════════════════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════════════════════
function buildPython() {
	let out = "import sys, time\n\n";
	out += "FRAMES = [\n";
	frames.forEach((f, fi) => {
		const faceA = f.face.map(cellANSI).join("");
		const msgA = f.msg.map(cellANSI).join("");
		out += `    # — frame ${fi + 1} —\n`;
		out += `    {"face": f"${faceA}",\n`;
		out += `     "msg":  f"${msgA}",\n`;
		out += `     "ms":   ${f.ms}},\n`;
	});
	out += "]\n\n";
	out += "def render(frame, width=80):\n";
	out += '    line = frame["face"] + "  < " + frame["msg"]\n';
	out += '    sys.stdout.write(line.ljust(width) + "\\r")\n';
	out += "    sys.stdout.flush()\n\n";
	out += "# Example loop:\n";
	out += "# for i, frame in enumerate(FRAMES):\n";
	out += "#     render(frame)\n";
	out += '#     time.sleep(frame["ms"] / 1000)\n';
	return out;
}
function renderExport() {
	document.getElementById("exp-py").textContent = buildPython();
	document.getElementById("exp-json").textContent = JSON.stringify(
		exportStatesToJSON(),
		null,
		2,
	);
}
function copyExp(id) {
	navigator.clipboard
		.writeText(document.getElementById(id).textContent)
		.catch(() => { });
	toast("Copied to clipboard");
}

// ═══════════════════════════════════════════════════════════
//  UTIL
// ═══════════════════════════════════════════════════════════
function esc(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
function toast(msg) {
	const t = document.getElementById("toast");
	t.textContent = msg;
	t.style.opacity = "1";
	clearTimeout(window._tt);
	window._tt = setTimeout(() => (t.style.opacity = "0"), 1600);
}

// ═══════════════════════════════════════════════════════════
//  BUILD PALETTES & QUICK FACES
// ═══════════════════════════════════════════════════════════
function buildUI() {
	// FG palette
	const fgEl = document.getElementById("fg-pal");
	FG.forEach((c) => {
		const d = document.createElement("div");
		d.className = "sw";
		d.id = "fg-" + c.n;
		// black needs a light background to be visible in the dark editor
		const swBg =
			c.n === "black" ? "#aaaaaa" : c.n === "default" ? "#2a2a2a" : c.css;
		d.style.background = swBg;
		d.innerHTML = `<span style="font-weight:700;color:${c.css};">A</span><span class="sw-tip">${c.lbl}</span>`;
		// warn badge for black
		if (c.n === "black")
			d.innerHTML +=
				'<span style="position:absolute;top:-4px;right:-4px;font-size:8px;background:#554400;color:#ffee44;border-radius:2px;padding:0 2px;">!</span>';
		d.onclick = () => applyFg(c.n);
		fgEl.appendChild(d);
	});
	// BG palette
	const bgEl = document.getElementById("bg-pal");
	BG.forEach((c) => {
		const d = document.createElement("div");
		d.className = "sw";
		d.id = "bg-" + c.n;
		d.style.background = c.css === "transparent" ? "#1a1a1a" : c.css;
		d.style.color = c.css === "transparent" ? "#555" : "#ccc";
		d.innerHTML = `<span style="font-size:9px;">${c.n === "none" ? "∅" : "■"}</span><span class="sw-tip">${c.lbl}</span>`;
		d.onclick = () => applyBg(c.n);
		bgEl.appendChild(d);
	});
	// Attrs
	const atEl = document.getElementById("attr-row");
	ATTRS.forEach((a) => {
		const b = document.createElement("button");
		b.className = "attr-btn";
		b.id = "at-" + a.n;
		b.textContent = a.lbl;
		b.style.cssText += ";" + a.css;
		b.onclick = () => applyAttr(a.n);
		atEl.appendChild(b);
	});
	// Quick faces
	const fgrid = document.getElementById("face-grid");
	FACES.forEach((f) => {
		const b = document.createElement("button");
		b.className = "fpill";
		b.textContent = f;
		b.onclick = () => setFace(f);
		fgrid.appendChild(b);
	});

}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
buildUI();
setTarget("face");

async function initStudio() {
	await initDefaultStates();
	const first = stateSet.idle ? "idle" : Object.keys(stateSet)[0];
	if (!first) {
		stateSet = { idle: [mkFrame("._.", 500, "")] };
		switchState("idle");
	} else {
		switchState(first);
	}
	initTestScenarios();
}

initStudio();
