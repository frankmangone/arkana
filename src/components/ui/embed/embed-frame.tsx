"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import { EmbedCard } from "./embed-card";

const DEFAULT_HEIGHT = 420;
const MIN_HEIGHT = 160;
const MAX_HEIGHT = 1000;
const RESIZE_MESSAGE = "arkana-embed:resize";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Embeds must live under /embeds/ on this site: no external pages, no traversal. */
export function isValidEmbedSrc(src: string | undefined): src is string {
  return (
    !!src &&
    /^\/embeds\/[\w\-./]+$/.test(src) &&
    !src.split("/").includes("..")
  );
}

function clampHeight(value: number): number {
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(value)));
}

interface EmbedFrameProps {
  src?: string;
  title?: string;
  height?: string;
}

/**
 * Interactive embed (three.js scene, custom visualization, anything with JS)
 * loaded from /embeds/<name>/ in a sandboxed iframe.
 *
 * `sandbox="allow-scripts"` without `allow-same-origin` gives the page an
 * opaque origin: it can run its own scripts but cannot touch the site's DOM,
 * cookies, localStorage or auth state. An embed can ask to be resized with
 *   parent.postMessage({ type: "arkana-embed:resize", height: 520 }, "*")
 */
export function EmbedFrame({ src, title, height }: EmbedFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [frameHeight, setFrameHeight] = useState(() => {
    const parsed = Number(height);
    return Number.isFinite(parsed) && parsed > 0
      ? clampHeight(parsed)
      : DEFAULT_HEIGHT;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // The sandboxed frame's origin is "null", so identify it by window.
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (
        data?.type === RESIZE_MESSAGE &&
        typeof data.height === "number" &&
        Number.isFinite(data.height)
      ) {
        setFrameHeight(clampHeight(data.height));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!isValidEmbedSrc(src)) {
    return (
      <div className="not-prose my-8 rounded-md border border-rule-strong bg-surface-raised p-4 text-sm text-ink-muted">
        Invalid embed source. Embeds must live under <code>/embeds/</code>.
      </div>
    );
  }

  return (
    <EmbedCard
      label={title || "Interactive"}
      icon={<Box />}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void iframeRef.current?.requestFullscreen?.()}
          aria-label="View embed fullscreen"
          title="Fullscreen"
        >
          <Maximize2 />
        </Button>
      }
    >
      <div className="relative bg-surface-page" style={{ height: frameHeight }}>
        {!loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <ArkanaSpinner size={32} />
          </div>
        )}
        <iframe
          ref={iframeRef}
          // `next dev` doesn't resolve a directory to its index.html the way
          // static hosting does, so name the file explicitly.
          src={`${BASE_PATH}${src.endsWith("/") ? `${src}index.html` : src}`}
          title={title || "Interactive embed"}
          sandbox="allow-scripts"
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="block h-full w-full border-0"
        />
      </div>
    </EmbedCard>
  );
}
