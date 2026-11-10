/* Pyodide worker for the in-article Python playground.
 *
 * Plain classic worker (no bundler involved) so it can be served as a static
 * file. Pyodide itself is fetched from the jsDelivr CDN the first time a
 * reader runs a cell, and cached by the browser afterwards.
 *
 * Protocol (main thread <-> worker):
 *   in : { type: "run", id, code, theme }
 *   out: { type: "status", text }
 *        { type: "out", id, stream: "stdout" | "stderr", text }
 *        { type: "result", id, images: string[], value: string | null,
 *          error: string | null, duration: number }
 */
const PYODIDE_VERSION = "0.27.7";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

importScripts(`${PYODIDE_URL}pyodide.js`);

let pyodide = null;
let currentId = null;
let plotReady = false;

const SETUP_PLOTS = `
import io, base64
import matplotlib
matplotlib.use("agg")
import matplotlib.pyplot as plt
from cycler import cycler

_t = dict(_arkana_theme)

plt.rcParams.update({
    "figure.facecolor": _t["bg"],
    "figure.figsize": (7.2, 4.2),
    "figure.dpi": 100,
    "savefig.facecolor": _t["bg"],
    "savefig.dpi": 160,
    "savefig.bbox": "tight",
    "axes.facecolor": _t["bg"],
    "axes.edgecolor": _t["rule"],
    "axes.labelcolor": _t["muted"],
    "axes.titlecolor": _t["fg"],
    "axes.titleweight": "bold",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "axes.axisbelow": True,
    "axes.prop_cycle": cycler(color=_t["series"]),
    "grid.color": _t["rule"],
    # Sizes are in points. The PNG is saved at 160 dpi but shown at roughly
    # 100 dpi, so 1pt is about 1.4 CSS px: keep these small or plots look heavy.
    "axes.linewidth": 0.8,
    "grid.linewidth": 0.5,
    "xtick.major.width": 0.8,
    "ytick.major.width": 0.8,
    "text.color": _t["fg"],
    "xtick.color": _t["muted"],
    "ytick.color": _t["muted"],
    "legend.facecolor": _t["bg"],
    "legend.edgecolor": _t["rule"],
    "legend.labelcolor": _t["fg"],
    "legend.fontsize": 9,
    "font.size": 10,
    "lines.linewidth": 1.5,
    "lines.markersize": 5,
    "patch.edgecolor": _t["bg"],
})

# Article code can say color="teal" / color="magenta" and get the site's quiz
# colors (the standard CSS names stay valid; they just resolve to the theme).
import matplotlib.colors as mcolors
_names = mcolors.get_named_colors_mapping()
_names["teal"] = _t["teal"]
_names["magenta"] = _t["magenta"]

# Figures are collected after every run, so plt.show() has nothing to do.
plt.show = lambda *args, **kwargs: None

def _arkana_collect():
    out = []
    for num in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(num).savefig(buf, format="png")
        out.append(base64.b64encode(buf.getvalue()).decode("ascii"))
    plt.close("all")
    return out
`;

function post(message) {
  self.postMessage(message);
}

// Package installation chatter is not the reader's output, and matplotlib's
// one-off font cache notice would only look like an error on the first plot.
let loadingPackages = false;
const NOISE = /Matplotlib is building the font cache/;

function emit(stream, text) {
  if (loadingPackages || NOISE.test(text)) return;
  post({ type: "out", id: currentId, stream, text: text + "\n" });
}

async function init() {
  post({ type: "status", text: "Loading Python (first run only)…" });
  pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  pyodide.setStdout({
    batched: (text) => emit("stdout", text),
  });
  pyodide.setStderr({
    batched: (text) => emit("stderr", text),
  });
  pyodide.setStdin({
    stdin: () => {
      throw new Error("input() is not available in the playground.");
    },
  });
}

// Drops Pyodide's own bootstrap frames so readers only see their code.
function cleanTraceback(message) {
  const lines = message.split("\n");
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    if (/^\s+File "[^"]*\/_pyodide\//.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping && /^ {4,}/.test(line) && !/^\s+File /.test(line)) continue;
    skipping = false;
    kept.push(line);
  }
  return kept.join("\n").trim();
}

async function run({ id, code, theme }) {
  const started = performance.now();
  currentId = id;
  let value = null;
  let error = null;
  let images = [];

  try {
    if (!pyodide) await init();

    const needsPlots = /\bmatplotlib\b/.test(code);
    post({ type: "status", text: "Loading packages (cached after the first run)…" });
    loadingPackages = true;
    try {
      await pyodide.loadPackagesFromImports(code, {
        messageCallback: () => {},
        errorCallback: (msg) =>
          post({ type: "out", id, stream: "stderr", text: msg + "\n" }),
      });
    } finally {
      loadingPackages = false;
    }

    if (needsPlots && !plotReady) {
      pyodide.globals.set("_arkana_theme", pyodide.toPy(theme));
      await pyodide.runPythonAsync(SETUP_PLOTS);
      plotReady = true;
    }

    post({ type: "status", text: "Running…" });
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null) {
      const repr = pyodide.globals.get("repr");
      value = String(repr(result));
      repr.destroy();
      if (typeof result === "object" && typeof result.destroy === "function") {
        result.destroy();
      }
    }

    if (plotReady) {
      const proxy = pyodide.runPython("_arkana_collect()");
      images = proxy.toJs();
      proxy.destroy();
    }
  } catch (e) {
    error = cleanTraceback(String((e && e.message) || e));
  }

  currentId = null;
  post({
    type: "result",
    id,
    images,
    value,
    error,
    duration: performance.now() - started,
  });
}

let queue = Promise.resolve();
self.onmessage = (event) => {
  const message = event.data;
  if (message && message.type === "run") {
    queue = queue.then(() => run(message));
  }
};
