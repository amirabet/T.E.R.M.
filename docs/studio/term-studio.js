// ═══════════════════════════════════════════════════════════
//  COLOR / ATTR DEFINITIONS
// ═══════════════════════════════════════════════════════════
const FG = [
	{
		n: "default",
		css: "#bbbbbb",
		code: "",
		lbl: "default — hereda color del terminal",
	},
	{
		n: "black",
		css: "#000000",
		code: "30",
		lbl: "black ⚠ invisible en fondo oscuro",
	},
	{ n: "gray", css: "#666666", code: "90", lbl: "gray (bright black)" },
	{ n: "red", css: "#cc3333", code: "31", lbl: "red" },
	{ n: "green", css: "#22aa33", code: "32", lbl: "green" },
	{ n: "yellow", css: "#bbaa00", code: "33", lbl: "yellow" },
	{ n: "blue", css: "#3366cc", code: "34", lbl: "blue" },
	{ n: "magenta", css: "#aa33bb", code: "35", lbl: "magenta" },
	{ n: "cyan", css: "#1199aa", code: "36", lbl: "cyan" },
	{ n: "white", css: "#eeeeee", code: "37", lbl: "white" },
	{ n: "br_red", css: "#ff5555", code: "91", lbl: "br.red" },
	{ n: "br_grn", css: "#55ff77", code: "92", lbl: "br.grn" },
	{ n: "br_yel", css: "#ffee44", code: "93", lbl: "br.yel" },
	{ n: "br_blu", css: "#5599ff", code: "94", lbl: "br.blue" },
	{ n: "br_mag", css: "#ff55ff", code: "95", lbl: "br.mag" },
	{ n: "br_cyn", css: "#44ffff", code: "96", lbl: "br.cyan" },
	{ n: "br_wht", css: "#ffffff", code: "97", lbl: "br.wht" },
];

const BG = [
	{ n: "none", css: "transparent", code: "", lbl: "none" },
	{ n: "black", css: "#111111", code: "40", lbl: "black" },
	{ n: "red", css: "#550000", code: "41", lbl: "red" },
	{ n: "green", css: "#003300", code: "42", lbl: "green" },
	{ n: "yellow", css: "#443300", code: "43", lbl: "yellow" },
	{ n: "blue", css: "#001144", code: "44", lbl: "blue" },
	{ n: "magenta", css: "#330033", code: "45", lbl: "magenta" },
	{ n: "cyan", css: "#002233", code: "46", lbl: "cyan" },
	{ n: "white", css: "#bbbbbb", code: "47", lbl: "white" },
	{ n: "br_red", css: "#880000", code: "101", lbl: "br.red" },
	{ n: "br_grn", css: "#005500", code: "102", lbl: "br.grn" },
	{ n: "br_yel", css: "#776600", code: "103", lbl: "br.yel" },
	{ n: "br_blu", css: "#002288", code: "104", lbl: "br.blue" },
	{ n: "br_mag", css: "#550066", code: "105", lbl: "br.mag" },
	{ n: "br_cyn", css: "#004466", code: "106", lbl: "br.cyan" },
	{ n: "br_wht", css: "#cccccc", code: "107", lbl: "br.wht" },
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
	ms: ms || 300,
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
	const ch = cell.char === " " ? "&nbsp;" : esc(cell.char);
	const inner = `<span style="${cellFgStyle(cell)}">${ch}</span>`;
	if (!bg) return inner;
	// space needs min-width so BG is visible; others get a small padding
	const spaceStyle =
		cell.char === " "
			? `display:inline-block;min-width:0.55ch;background:${bg};`
			: `background:${bg};padding:0 2px;border-radius:2px;`;
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
	let fh = "";
	f.face.forEach((c) => {
		fh += renderStageChar(c);
	});
	document.getElementById("stage-face").innerHTML = fh;
	let mh = "";
	if (f.msg.length) {
		mh = '<span style="color:#333">&lt;&nbsp;</span>';
		f.msg.forEach((c) => {
			mh += renderStageChar(c);
		});
	}
	document.getElementById("stage-msg").innerHTML = mh;
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
	rowEl.innerHTML = "";
	cells.forEach((cell, i) => {
		const d = document.createElement("div");
		d.className = "ccel" + (sel.has(i) ? " sel" : "");
		// BG goes on the cell itself — accurate to how terminals render character cells
		const bg = bgCss(cell.bg);
		if (bg) d.style.background = bg;
		// FG + attrs go on the inner span only
		const ch = cell.char === " " ? "&nbsp;" : esc(cell.char);
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
		el.textContent = "— click a character to select · shift+click = multi —";
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
		setTarget(tgt, document.getElementById("tgt-" + tgt));
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
	if (tgt !== target) setTarget(tgt, document.getElementById("tgt-" + tgt));
	renderAllRows();
	reflectPalette();
	renderSelInfo();
}

// ═══════════════════════════════════════════════════════════
//  TARGET TOGGLE
// ═══════════════════════════════════════════════════════════
function setTarget(t, btn) {
	target = t;
	document.getElementById("tgt-face").classList.toggle("on", t === "face");
	document.getElementById("tgt-msg").classList.toggle("on", t === "msg");
	document.getElementById("wrap-face").style.display =
		t === "face" ? "block" : "none";
	document.getElementById("wrap-msg").style.display =
		t === "msg" ? "block" : "none";
	renderAllRows();
	reflectPalette();
	renderSelInfo();
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
	frames[curFrame].ms = parseInt(document.getElementById("ms-in").value) || 300;
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
	document.getElementById("ms-in").value = f.ms;
	document.getElementById("msg-in").value = f.msg.map((c) => c.char).join("");
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
	const ms = Math.max(30, Math.round(frames[curFrame].ms * speedMul));
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
const PRESETS = {
	idle: [
		{
			face: "._.",
			ms: 600,
			fFg: "gray",
			mFg: "gray",
			dim: true,
			msg: "Esperando...",
		},
		{
			face: ". .",
			ms: 900,
			fFg: "gray",
			mFg: "gray",
			dim: true,
			msg: "Esperando...",
		},
		{
			face: "._.",
			ms: 600,
			fFg: "gray",
			mFg: "gray",
			dim: true,
			msg: "Esperando...",
		},
	],
	think: [
		{ face: "o..", ms: 120, fFg: "br_cyn", mFg: "gray", msg: "Analizando..." },
		{ face: ".o.", ms: 120, fFg: "cyan", mFg: "gray", msg: "Analizando..." },
		{ face: "..o", ms: 120, fFg: "br_cyn", mFg: "gray", msg: "Analizando..." },
		{ face: ".o.", ms: 120, fFg: "cyan", mFg: "gray", msg: "Analizando..." },
	],
	work: [
		{ face: "-_-", ms: 80, fFg: "yellow", mFg: "gray", msg: "Working on..." },
		{ face: ">_-", ms: 80, fFg: "br_yel", mFg: "gray", msg: "Working on..." },
		{
			face: ">_<",
			ms: 160,
			fFg: "br_yel",
			mFg: "gray",
			bold: true,
			msg: "Working on...",
		},
		{ face: "-_<", ms: 80, fFg: "yellow", mFg: "gray", msg: "Working on..." },
		{ face: "-_-", ms: 200, fFg: "yellow", mFg: "gray", msg: "Working on..." },
	],
	ok: [
		{ face: "o_o", ms: 100, fFg: "green", mFg: "gray", msg: "Done!" },
		{ face: "^_o", ms: 100, fFg: "br_grn", mFg: "gray", msg: "Done!" },
		{
			face: "^_^",
			ms: 200,
			fFg: "br_grn",
			mFg: "br_grn",
			bold: true,
			bg: "green",
			msg: "Done!",
		},
		{
			face: "^v^",
			ms: 300,
			fFg: "br_grn",
			mFg: "br_grn",
			bold: true,
			msg: "Done!",
		},
		{ face: "^_^", ms: 500, fFg: "green", mFg: "gray", msg: "Done!" },
	],
	error: [
		{ face: "o_o", ms: 60, fFg: "default", mFg: "gray", msg: "Error: timeout" },
		{ face: "o_O", ms: 60, fFg: "yellow", mFg: "gray", msg: "Error: timeout" },
		{
			face: "O_O",
			ms: 80,
			fFg: "br_yel",
			mFg: "gray",
			bold: true,
			msg: "Error: timeout",
		},
		{
			face: "@_@",
			ms: 80,
			fFg: "br_red",
			mFg: "gray",
			bold: true,
			msg: "Error: timeout",
		},
		{
			face: "x_x",
			ms: 200,
			fFg: "white",
			mFg: "br_red",
			bold: true,
			bg: "red",
			msg: "Error: timeout",
		},
		{
			face: "x_x",
			ms: 200,
			fFg: "br_red",
			mFg: "br_red",
			msg: "Error: timeout",
		},
		{
			face: "x_x",
			ms: 600,
			fFg: "red",
			mFg: "gray",
			dim: true,
			msg: "Error: timeout",
		},
	],
	speak: [
		{ face: "^-^", ms: 120, fFg: "blue", mFg: "gray", msg: "Respondiendo..." },
		{
			face: "^o^",
			ms: 200,
			fFg: "br_blu",
			mFg: "gray",
			msg: "Respondiendo...",
		},
		{ face: "^-^", ms: 120, fFg: "blue", mFg: "gray", msg: "Respondiendo..." },
		{
			face: "^u^",
			ms: 200,
			fFg: "br_blu",
			mFg: "gray",
			bold: true,
			msg: "Respondiendo...",
		},
	],
};

// ═══════════════════════════════════════════════════════════
//  STATE SET MANAGEMENT
// ═══════════════════════════════════════════════════════════

function initDefaultStates() {
	// Bootstrap stateSet from built-in PRESETS so the editor starts with
	// useful defaults. Users can import their own JSON to replace these.
	stateSet = {};
	Object.entries(PRESETS).forEach(([name, arr]) => {
		stateSet[name] = arr.map((pr) => {
			const f = mkFrame(pr.face, pr.ms, pr.msg || "");
			f.face.forEach((c) => {
				c.fg = pr.fFg || "default";
				if (pr.bold) c.bold = true;
				if (pr.dim) c.dim = true;
				if (pr.bg) c.bg = pr.bg;
			});
			f.msg.forEach((c) => {
				c.fg = pr.mFg || "default";
				if (pr.bold) c.bold = true;
			});
			return f;
		});
	});
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
}

function addNewState() {
	const inp = document.getElementById("new-state-in");
	const raw = inp.value.trim();
	if (!raw) { toast("Enter a state name"); return; }
	const name = raw.replace(/\s+/g, "_").toLowerCase();
	if (stateSet[name]) { toast("State already exists: " + name); return; }
	saveCurrentStateToSet();
	stateSet[name] = [mkFrame("._.", 300, "")];
	inp.value = "";
	currentState = ""; // prevent overwriting old state on switch
	switchState(name);
	toast("Created state: " + name);
}

function deleteCurrentState() {
	const keys = Object.keys(stateSet);
	if (keys.length <= 1) { toast("Cannot delete the last state"); return; }
	if (!window.confirm(`Delete state "${currentState}"?`)) return;
	delete stateSet[currentState];
	const next = Object.keys(stateSet)[0];
	currentState = "";
	switchState(next);
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
			renderStatesBar();
			toast("Renamed \u2192 " + clean);
		};
		bar.appendChild(b);
	});
}

// ─── JSON import / export ───────────────────────────────────

function _cellFromJSON(item) {
	if (typeof item === "string") return mkCell(item);
	const c = mkCell(item.char ?? " ");
	c.fg = normFg(item.fg ?? "");
	c.bg = normBg(item.bg ?? "");
	c.bold = !!item.bold;
	c.dim = !!item.dim;
	c.underline = !!item.underline;
	c.reverse = !!item.reverse;
	return c;
}

function _framesFromJSON(jsonFrames) {
	return jsonFrames.map((jf) => ({
		face: (Array.isArray(jf.face) ? jf.face : Array.from(String(jf.face ?? "._."))).map(_cellFromJSON),
		msg: (Array.isArray(jf.msg) ? jf.msg : Array.from(String(jf.msg ?? ""))).map(_cellFromJSON),
		ms: Math.max(40, parseInt(jf.ms) || 300),
	}));
}

function importStatesFromJSON(data) {
	if (data._meta) { data = Object.assign({}, data); delete data._meta; }
	const newSet = {};
	for (const [name, sd] of Object.entries(data)) {
		if (!sd || !Array.isArray(sd.frames) || !sd.frames.length) continue;
		newSet[name] = _framesFromJSON(sd.frames);
	}
	if (!Object.keys(newSet).length) { toast("No valid states found in JSON"); return; }
	stateSet = newSet;
	currentState = "";
	switchState(Object.keys(stateSet)[0]);
	toast(`Loaded ${Object.keys(stateSet).length} state(s)`);
}

function exportStatesToJSON() {
	saveCurrentStateToSet();
	const out = { _meta: { version: "2.0", project: "T.E.R.M.", created_with: "T.E.R.M. Studio" } };
	for (const [name, frs] of Object.entries(stateSet)) {
		out[name] = {
			frames: frs.map((f) => ({
				ms: f.ms,
				face: f.face.map((c) => ({ char: c.char, fg: denormFg(c.fg), bg: denormBg(c.bg), bold: c.bold, dim: c.dim, underline: c.underline, reverse: c.reverse })),
				msg: f.msg.map((c) => ({ char: c.char, fg: denormFg(c.fg), bg: denormBg(c.bg), bold: c.bold, dim: c.dim, underline: c.underline, reverse: c.reverse })),
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
	switchTab("editor", document.querySelector(".tab"));
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
setTarget("face", document.getElementById("tgt-face"));
initDefaultStates();
switchState("idle");
