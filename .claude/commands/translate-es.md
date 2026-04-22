Translate the file `$ARGUMENTS` to Spanish.

## Translation rules

- Add slugs to headings in format `{#heading-slug}` beside the heading. Slug must always be in English (slugified English heading), NOT translated. Example: translating "## Consensus" → "## Consenso" uses `{#consensus}`, NOT `{#consenso}`.
- Remove the medium link in the translated version.
- Do not translate tags in the heading — keep them as-is (they are internationalized).
- Internal links: keep same, only change `/en` prefix to `/es`.
- External links: do NOT translate; keep as-is.
- The initial quote for articles in a series must be consistent with other articles in the same series. Check `src/lib/reading-lists/es.ts` to find if this article belongs to a series, and if so, use the same quote as the other articles.
- Do not use extremely formal language; maintain the friendly, approachable tone of the English version.
- Place the file in the same path as the original, except change the `/en` prefix to `/es`.
- When translating the word `twist` in the context of elliptic curves, preserve it as a loanword.
- Translate figure citations and alt text, but preserve `[zoom]` as-is.

## Spanish-specific rules

- Translate `maps` (as in function) to `mapas`, not `mapeos`.
- Translate `isomorphic to` as `es isomórfico a` (ensure grammatical correctness).
- Translate `encryption` → `encriptación`, `decryption` → `desencriptación`.
- Translate `Smart Contracts` → `Contratos Inteligentes`.
- Translate titles starting with `WTF is` as `WTF es` (preserve the anglicism).
- Translate `a lot to gain` (or similar) to `mucho para ganar`, not `mucho que ganar`.
- Translate `threshold signatures` as `firmas de umbral`.
- Assume Blockchain is female: `una Blockchain`, not `un Blockchain`. Apply to other gender-specific prepositions too.
- Translate `sum-check protocol` → `protocolo de verificación de la suma`.
- Translate `correctness of a computation` → `correctitud de un cómputo`.
- Translate `computation models` → `modelos de cómputo`.
- In interactive protocols, translate `prover` → `probador` and `verifier` → `verificador`.

## After translation

Check `src/lib/reading-lists/en.ts`. If the article appears in a reading list, add the translated file to the same reading list in `src/lib/reading-lists/es.ts`.
