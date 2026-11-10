/**
 * Shared Python runtime for the in-article playgrounds.
 *
 * Every playground on a page talks to ONE Pyodide worker, so variables
 * defined in one cell are visible to the next, like a notebook. The worker is
 * created lazily on the first run and torn down once the last playground
 * unmounts, so state never leaks from one article to another.
 */

export interface RunResult {
  images: string[];
  value: string | null;
  error: string | null;
  duration: number;
}

export interface RunOptions {
  onStatus?: (text: string) => void;
  onOutput?: (stream: "stdout" | "stderr", text: string) => void;
}

interface PlotTheme {
  bg: string;
  fg: string;
  muted: string;
  rule: string;
  /** Quiz "correct" and "incorrect" colors, also registered as the matplotlib names "teal" and "magenta". */
  teal: string;
  magenta: string;
  series: string[];
}

interface Pending {
  options: RunOptions;
  resolve: (result: RunResult) => void;
  reject: (error: Error) => void;
}

const WORKER_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/python-worker.js`;

let worker: Worker | null = null;
let consumers = 0;
let nextId = 0;
let epoch = 0;
const pending = new Map<number, Pending>();
let queue: Promise<unknown> = Promise.resolve();

/** Resolves any CSS color (hsl, oklch, color-mix...) to #rrggbb, composited over `over`. */
function resolveColor(css: string, over = "#000000"): string {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return over;
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.fillStyle = over;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

/** Matplotlib colors taken from the site's own design tokens. */
function readPlotTheme(): PlotTheme {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  const bg = resolveColor(token("--surface-raised", "#1c1630"));
  const color = (name: string, fallback: string) =>
    resolveColor(token(name, fallback), bg);

  // Same lanes as the section quizzes (see question-card.tsx): "correct" teal
  // and "incorrect" magenta, next to primary.
  const teal = color("--teal-600", "#3bc8f7");
  const magenta = color("--magenta-600", "#f73bd1");

  return {
    bg,
    fg: color("--ink-heading", "#f8f5ff"),
    muted: color("--ink-muted", "#aca6bd"),
    rule: color("--rule", "#3a3350"),
    teal,
    magenta,
    series: [
      color("--primary-700", "#986cef"),
      teal,
      magenta,
      color("--secondary-700", "#d46bff"),
      color("--emerald-500", "#34d399"),
    ],
  };
}

function handleMessage(event: MessageEvent) {
  const message = event.data;
  if (message.type === "status") {
    // Status updates belong to whichever run is currently in flight.
    pending.forEach((p) => p.options.onStatus?.(message.text));
  } else if (message.type === "out") {
    pending.get(message.id)?.options.onOutput?.(message.stream, message.text);
  } else if (message.type === "result") {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    entry?.resolve({
      images: message.images,
      value: message.value,
      error: message.error,
      duration: message.duration,
    });
  }
}

function ensureWorker(): Worker {
  if (!worker) {
    // The worker is a plain static file in public/. Constructing it via
    // Reflect keeps the bundler from treating this as `new Worker(...)` and
    // trying (and failing) to bundle a non-literal URL.
    worker = Reflect.construct(Worker, [WORKER_URL]) as Worker;
    worker.onmessage = handleMessage;
    worker.onerror = (event) => {
      const error = new Error(event.message || "The Python runtime crashed.");
      pending.forEach((p) => p.reject(error));
      pending.clear();
      // A crashed interpreter has lost its state just like a Stop does.
      epoch += 1;
      terminate();
    };
  }
  return worker;
}

function terminate() {
  worker?.terminate();
  worker = null;
}

/**
 * A playground cell, as the runtime sees it. Cells register themselves so a
 * later cell can first run the earlier ones that haven't run in this session
 * (notebook-style "run all above"), instead of failing with a NameError.
 */
export interface CellHandle {
  element: HTMLElement | null;
  /** Epoch of the interpreter this cell last ran successfully in. */
  ranEpoch: number;
  /** Runs the cell's current code and reports whether it finished without error. */
  execute: () => Promise<boolean>;
}

const cells = new Set<CellHandle>();

export function registerCell(handle: CellHandle): () => void {
  cells.add(handle);
  return () => {
    cells.delete(handle);
  };
}

/** Identifies the current interpreter; changes whenever its state is lost. */
export function getEpoch(): number {
  return epoch;
}

function inDocumentOrder(a: CellHandle, b: CellHandle): number {
  if (!a.element || !b.element) return 0;
  return a.element.compareDocumentPosition(b.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/**
 * Runs `target`, first running every earlier cell on the page that hasn't run
 * successfully in the current session. Stops at the first cell that fails (it
 * shows its own error) and does not run `target` in that case.
 */
export async function runWithPrerequisites(target: CellHandle): Promise<boolean> {
  const ordered = [...cells].sort(inDocumentOrder);
  for (const cell of ordered.slice(0, ordered.indexOf(target))) {
    if (cell.ranEpoch === epoch) continue;
    if (!(await cell.execute())) return false;
  }
  return target.execute();
}

/** Register a playground. Pair every call with `release()`. */
export function acquire() {
  consumers += 1;
}

export function release() {
  consumers = Math.max(0, consumers - 1);
  if (consumers === 0) {
    reset();
  }
}

/** Runs code in the shared session. Runs are serialized across cells. */
export function run(code: string, options: RunOptions = {}): Promise<RunResult> {
  const enqueuedIn = epoch;
  const task = () =>
    new Promise<RunResult>((resolve, reject) => {
      // A reset since this run was queued means the user hit Stop.
      if (epoch !== enqueuedIn) {
        reject(new Error("Interrupted"));
        return;
      }
      const id = nextId++;
      pending.set(id, { options, resolve, reject });
      try {
        ensureWorker().postMessage({
          type: "run",
          id,
          code,
          theme: readPlotTheme(),
        });
      } catch (e) {
        pending.delete(id);
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });

  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

/**
 * Kills the worker, which is the only way to interrupt running Python. All
 * session state is lost; the next run starts a fresh interpreter.
 */
export function reset() {
  epoch += 1;
  const error = new Error("Interrupted");
  pending.forEach((p) => p.reject(error));
  pending.clear();
  terminate();
}
