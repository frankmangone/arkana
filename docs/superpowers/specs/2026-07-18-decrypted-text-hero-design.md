# Decrypted Text Effect — Home Hero

## Purpose

The home hero's `<h1>` should visually "decrypt" on page load: it starts as a
line of Arkana glyphs and resolves into the real heading text, left to right,
giving the entrance an "excellent flare" tied to the site's Arkana glyph
visual language (`ArkanaStrip`, `DecoderSigil`, `GlyphRain`).

This is the first application of the effect. It's built as a standalone
reusable component so it can later be applied to blockquote elements in post
content (triggered on scroll-into-view instead of on mount) — but that reuse
is out of scope for this spec; only the hero integration is implemented here.

## Component: `src/components/decrypted-text.tsx`

Exports `DecryptedText({ text, className? }: { text: string; className?: string })`.

Renders inline (a `<span>`, not a block element) so it can be dropped inside
any existing heading/text element without affecting that element's
typography, responsive font-clamp, or line-height — those are inherited from
the parent.

### Per-character structure

The input `text` is split into individual characters (preserving spaces).
Each non-space character renders as:

```
<span className="relative inline-block">
  <span style={{ color: revealed ? undefined : "transparent" }}>{char}</span>
  {!revealed && (
    <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <canvas /* ArkanaPattern-style glyph, random bits */ />
    </span>
  )}
</span>
```

- The real character is **always** present in the DOM (just transparent
  until revealed), so it reserves its own natural glyph width and the
  ascent/descent needed for correct line-height. Swapping `revealed` never
  changes box size — no layout shift.
- Spaces render as plain, unwrapped spaces — no overlay, always "revealed".
- The glyph overlay is an `ArkanaPattern`-style canvas (reusing the existing
  16-bit line-segment drawing logic from `arkana-pattern.tsx` /
  `decoder-sigil.tsx`), sized to roughly the character's font-size and
  centered in the box (`overflow-hidden` on the wrapper handles narrow
  characters like "i" or ".").
- Glyph line color: `#a777ff` (brand purple), matching `ArkanaStrip` and
  `DecoderSigil` elsewhere in the app. Canvas background is transparent.
- The color swap from `transparent` → inherited uses a short CSS transition
  (~150ms) for a subtle crossfade rather than an abrupt cut when a character
  locks in.

### Accessibility

The animated, per-character markup is wrapped in a container with
`aria-hidden="true"`. A sibling visually-hidden (`sr-only`) span holds the
plain, unmodified `text` for screen readers. This fully decouples the
animation's DOM churn from the accessibility tree — screen readers always
read the real heading text, regardless of animation state.

### Animation behavior

- **Initial render** (SSR and first client paint): fully revealed, plain
  text — identical to today's static heading. This avoids any CLS and keeps
  the heading text present in the initial HTML for no-JS clients and
  crawlers that don't execute JS.
- **On mount** (client-only, `useEffect`): if the user has NOT set
  `prefers-reduced-motion: reduce`, immediately flip all non-space
  characters to unrevealed (scrambled) state, then animate:
  - A shared tick (~50ms) re-randomizes the glyph bits of every
    still-unrevealed character (same "flicker" look as `GlyphRain` /
    `DecoderSigil`).
  - Characters lock in **left to right**, staggered roughly 30ms apart per
    character, so the whole line resolves as a left-to-right decrypt wave.
  - Total animation duration scales with text length — roughly 1–1.5s for a
    typical hero-length line.
  - Runs once on mount; does not replay (no re-trigger on re-render, no
    IntersectionObserver, no scroll listener needed since the hero is above
    the fold).
- If `prefers-reduced-motion: reduce` is set, skip straight to the fully
  revealed state — no scrambling ever shown. This matches the existing
  convention in `GlyphRain` and `DecoderSigil`.

### Non-goals for this spec

- No scroll-triggered variant (post-content blockquotes) — future work.
- No configurable trigger prop (`triggerOn="mount" | "visible"`) — not
  needed until the scroll-triggered use case is actually built; adding it
  now would be speculative configurability with no current caller.
- No configurable color/timing props — constants live in the component,
  matching the existing `TICK_MS` / `LOCK_EVERY_TICKS` constant pattern in
  `decoder-sigil.tsx`.

## Integration: `intro-section.tsx`

Single change: replace the h1's text child with the new component.

```diff
- <h1 className="display-title mb-8 !text-[clamp(2.75rem,6.75vw,5.25rem)] text-ink-on-brand-title">
-   {dictionary.home.intro.descriptionBig}
- </h1>
+ <h1 className="display-title mb-8 !text-[clamp(2.75rem,6.75vw,5.25rem)] text-ink-on-brand-title">
+   <DecryptedText text={dictionary.home.intro.descriptionBig} />
+ </h1>
```

`intro-section.tsx` itself stays a server component; only the new
`decrypted-text.tsx` needs `"use client"` (it uses `useEffect`, `useState`,
canvas, and `matchMedia`).

No new dependencies are introduced. The glyph-drawing logic is adapted from
the existing 16-bit line-segment approach already used by `arkana-pattern.tsx`.

## Testing / verification

- Visual check in the browser: hero loads, glyphs decrypt left-to-right into
  the real heading text, no layout shift, animation does not replay on
  client-side re-renders.
- `prefers-reduced-motion: reduce` (via browser/OS setting or devtools
  emulation): heading renders immediately as plain text, no scrambling.
- Screen reader / accessibility tree check: heading text is read normally
  (via the `sr-only` span) regardless of animation state.
- Existing lint/build/test gates (`pnpm run lint`, `pnpm run build`) must
  pass.
