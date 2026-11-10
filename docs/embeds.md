# Interactive embeds

Two ways to make an article interactive. Both are written in the post's
markdown, so publishing needs no backend changes.

## Runnable Python

Add `run` to a python fence:

````md
```python run
import numpy as np
print(np.pi)
```
````

- Runs in the browser on [Pyodide](https://pyodide.org) inside a Web Worker
  (`public/python-worker.js`). Pyodide, numpy and matplotlib are fetched from
  the jsDelivr CDN on the first Run only.
- All runnable blocks on a page share one interpreter, like notebook cells.
  Later blocks can use variables from earlier ones, so write them in order.
- Matplotlib figures appear under the cell (`plt.show()` is optional) and are
  themed from the site's design tokens (see `readPlotTheme` in
  `src/components/ui/python-playground/runtime.ts`).
- Plain ` ```python ` blocks stay static. Anywhere that ignores the extra word
  (Obsidian, GitHub) the block is just a normal code block.
- Pyodide is pinned in `public/python-worker.js` (`PYODIDE_VERSION`).

Pieces: `remark-playground.ts` flags the block, `code-block.tsx` swaps it for
`python-playground/`, which talks to the worker through `runtime.ts`.

## Embedded pages (three.js, custom visualizations, any JS)

```md
<embed-frame src="/embeds/example-cube/" title="Icosahedron" height="420" />
```

- `src` must start with `/embeds/`. `height` (px, 160-1000, default 420) and
  `title` are optional. The title shows in the card header.
- An embed is a plain static page at `public/embeds/<name>/index.html`. It is
  copied into the static export, so it deploys to GitHub Pages with the rest
  of the site and is served at `https://arkana.blog/embeds/<name>/`.
- It is shown in an iframe with `sandbox="allow-scripts"` and **no**
  `allow-same-origin`. It can run any JavaScript but has an opaque origin: no
  access to the site's DOM, cookies, localStorage or auth state.

### Writing an embed

- Link `/embeds/arkana.css` for the dark palette, fonts and `.arkana-button` /
  `.arkana-label` helpers. The sandbox can't see the site's CSS, so the tokens
  are duplicated there (mirrors `.dark` in `src/app/globals.css`).
- Load libraries from a CDN with a pinned version (see `example-cube`, which
  uses three.js through an import map), or put the files next to your
  `index.html`.
- Because the origin is opaque, `fetch()` and `<script type="module">` of
  same-site files are cross-origin requests and need CORS headers. Plain
  `<script src>` and `<link>` do not. Inline or CDN-loaded code avoids the
  question entirely.
- To resize from inside the embed:
  `parent.postMessage({ type: "arkana-embed:resize", height: 520 }, "*")`.
- Respect `prefers-reduced-motion`, and give canvases `touch-action: none` if
  they handle drags so scrolling the article isn't hijacked.

### Caveats

- `public/` lives in the public frontend repo, so an embed for an unpublished
  article is visible there. Keep unfinished ones out of the repo until the
  article ships.
- The sandbox protects readers from bugs and third-party scripts. Anyone who
  can commit to `public/embeds/` can still ship anything, same as any other
  frontend code.
