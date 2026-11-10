"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import { Play, RotateCcw, Square, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import { EmbedCard } from "@/components/ui/embed/embed-card";
import * as runtime from "./runtime";
import type { RunResult } from "./runtime";

interface PythonPlaygroundProps {
  initialCode: string;
}

interface OutputChunk {
  stream: "stdout" | "stderr";
  text: string;
}

const TEXT_STYLE =
  "font-mono text-[13px] leading-6 whitespace-pre [tab-size:4]";

/**
 * Editable, runnable Python cell. All cells on a page share one interpreter,
 * so they behave like the cells of a notebook: later cells can use variables
 * defined by earlier ones.
 */
export function PythonPlayground({ initialCode }: PythonPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  // `running`: this cell's own code is executing. `waiting`: earlier cells are
  // being run first, so this one hasn't started yet.
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [chunks, setChunks] = useState<OutputChunk[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  // Escape releases Tab so keyboard users are never trapped in the editor.
  const tabTrapped = useRef(true);
  const rootRef = useRef<HTMLDivElement>(null);
  // Always the latest code, so `execute` can stay stable while the runtime
  // holds on to it.
  const codeRef = useRef(code);
  const handle = useRef<runtime.CellHandle>({
    element: null,
    ranEpoch: -1,
    execute: async () => false,
  });
  const busy = running || waiting;

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    runtime.acquire();
    return () => runtime.release();
  }, []);

  const highlighted = useMemo(
    // Trailing newline keeps the last (possibly empty) line the same height
    // in the highlighted layer and the textarea above it.
    () => Prism.highlight(code, Prism.languages.python, "python") + "\n",
    [code]
  );

  /** Runs this cell's code alone. Resolves to whether it finished without error. */
  const execute = useCallback(async (): Promise<boolean> => {
    setRunning(true);
    setStatus("Starting…");
    setChunks([]);
    setResult(null);
    let succeeded = false;
    try {
      const outcome = await runtime.run(codeRef.current, {
        onStatus: setStatus,
        onOutput: (stream, text) =>
          setChunks((previous) => [...previous, { stream, text }]),
      });
      setResult(outcome);
      succeeded = outcome.error === null;
    } catch (e) {
      const interrupted = e instanceof Error && e.message === "Interrupted";
      setResult({
        images: [],
        value: null,
        duration: 0,
        error: interrupted
          ? "Interrupted. The Python session was reset; earlier cells will run again next time."
          : e instanceof Error
            ? e.message
            : String(e),
      });
    } finally {
      setRunning(false);
      setStatus(null);
    }
    return succeeded;
  }, []);

  // Let the runtime run this cell as a prerequisite of later ones.
  useEffect(() => {
    const cell = handle.current;
    cell.element = rootRef.current;
    cell.execute = async () => {
      const succeeded = await execute();
      if (succeeded) cell.ranEpoch = runtime.getEpoch();
      return succeeded;
    };
    return runtime.registerCell(cell);
  }, [execute]);

  /** Run button: runs any earlier cells that haven't run yet, then this one. */
  const onRun = async () => {
    if (busy) return;
    setWaiting(true);
    try {
      await runtime.runWithPrerequisites(handle.current);
    } finally {
      setWaiting(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey || event.shiftKey)) {
      event.preventDefault();
      void onRun();
    } else if (event.key === "Escape") {
      tabTrapped.current = false;
    } else if (event.key === "Tab" && tabTrapped.current && !event.shiftKey) {
      event.preventDefault();
      // execCommand keeps the browser's native undo stack intact.
      document.execCommand("insertText", false, "    ");
    }
  };

  const hasOutput =
    chunks.length > 0 ||
    (result !== null &&
      (result.value !== null || result.error !== null || result.images.length > 0));
  const missingVariable = result?.error?.includes("NameError");

  const actions = (
    <>
      {code !== initialCode && !busy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCode(initialCode)}
          aria-label="Reset code to the original"
          title="Reset code"
        >
          <RotateCcw />
        </Button>
      )}
      {busy ? (
        <Button variant="outline" size="sm" onClick={() => runtime.reset()}>
          <Square />
          Stop
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => void onRun()}
          title="Run (Shift+Enter)"
          className="bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
        >
          <Play />
          Run
        </Button>
      )}
    </>
  );

  const footer = (busy || hasOutput) && (
    <div className="bg-surface-page/60">
      {(chunks.length > 0 ||
        result?.value ||
        result?.error ||
        result?.images.length) && (
        <div className="space-y-3 px-4 py-3">
          {chunks.length > 0 && (
            <pre className={`${TEXT_STYLE} m-0 overflow-x-auto`}>
              {chunks.map((chunk, index) => (
                <span
                  key={index}
                  className={
                    chunk.stream === "stderr" ? "text-red-400" : "text-ink-body"
                  }
                >
                  {chunk.text}
                </span>
              ))}
            </pre>
          )}
          {result?.value && (
            <pre className={`${TEXT_STYLE} m-0 overflow-x-auto text-ink-heading`}>
              {result.value}
            </pre>
          )}
          {result?.error && (
            <div>
              <pre className={`${TEXT_STYLE} m-0 overflow-x-auto text-red-400`}>
                {result.error}
              </pre>
              {missingVariable && (
                <p className="mt-2 text-sm text-ink-faint">
                  Looks like a variable is missing. Cells share one session, so
                  run the cells above this one first.
                </p>
              )}
            </div>
          )}
          {result?.images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={`data:image/png;base64,${image}`}
              alt="Plot produced by the code above"
              className="mx-auto block h-auto max-w-full rounded"
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-4 pb-2 pt-1 text-xs text-ink-faint">
        {busy ? (
          <>
            <ArkanaSpinner size={16} />
            <span>{running ? status : "Running the cells above first…"}</span>
          </>
        ) : (
          result &&
          result.duration > 0 && (
            <span>Ran in {(result.duration / 1000).toFixed(2)}s</span>
          )
        )}
      </div>
    </div>
  );

  return (
    <EmbedCard
      ref={rootRef}
      label="Python"
      icon={<Terminal />}
      actions={actions}
      footer={footer || undefined}
    >
      <div className="overflow-x-auto bg-surface-page/60">
        <div className="grid w-max min-w-full">
          <pre
            aria-hidden="true"
            className={`${TEXT_STYLE} pointer-events-none col-start-1 row-start-1 m-0 p-4 text-ink-body`}
          >
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => (tabTrapped.current = true)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-label="Python code editor. Press Shift+Enter to run."
            className={`${TEXT_STYLE} col-start-1 row-start-1 m-0 resize-none overflow-hidden border-0 bg-transparent p-4 text-transparent caret-ink-heading outline-none`}
          />
        </div>
      </div>
    </EmbedCard>
  );
}
