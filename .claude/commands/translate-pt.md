Translate the file `$ARGUMENTS` to Brazilian Portuguese.

## Translation rules

- Add slugs to headings in format `{#heading-slug}` beside the heading. Slug must always be in English (slugified English heading), NOT translated. Example: translating "## Consensus" → "## Consenso" uses `{#consensus}`, NOT `{#consenso}`.
- Remove the medium link in the translated version.
- Do not translate tags in the heading — keep them as-is (they are internationalized).
- Internal links: keep same, only change `/en` prefix to `/pt`.
- External links: do NOT translate; keep as-is.
- The initial quote for articles in a series must be consistent with other articles in the same series. Check `src/lib/reading-lists/pt.ts` to find if this article belongs to a series, and if so, use the same quote as the other articles.
- Do not use extremely formal language; maintain the friendly, approachable tone of the English version.
- Place the file in the same path as the original, except change the `/en` prefix to `/pt`.
- When translating the word `twist` in the context of elliptic curves, preserve it as a loanword.
- Translate figure citations and alt text, but preserve `[zoom]` as-is.

## Portuguese-specific rules

- Target language is Brazilian Portuguese, not European Portuguese.
- Translate `encryption` → `encriptação`, `decryption` → `decriptação`.
- You may use expressions around `jeito` sparingly when they make sense: `ajeitar` (to organize), `desajeitar` (to disorganize), `dar um jeito em` (to make things better), `daquele jeito` (that way). Only use when tone is adequate — do not force them.
- When tone is appropriate, condense `não é?` to `né?`. Do not abuse.
- You may use `procurando` as informal synonym for `buscando` when context fits.
- Translate `Alice` → `André`, `Bob` → `Bruna`.
- Translate `threshold signatures` → `Assinaturas de Limite`. In general, translate `threshold` in cryptographic scheme context as `de limite`.
- Assume Blockchain is female: `uma Blockchain`, not `um Blockchain`. Apply to other gender-specific prepositions too.
- Do not translate `exploit` — keep it in English (including plural).
- Translate `as in` → `ou seja`.

## After translation

Check `src/lib/reading-lists/en.ts`. If the article appears in a reading list, add the translated file to the same reading list in `src/lib/reading-lists/pt.ts`.
