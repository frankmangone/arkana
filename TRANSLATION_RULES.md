When you translate to other languages, make sure that:

- Slugs are added to headings in the format `{#heading-slug}` right beside the heading. **IMPORTANT: The slug itself must always be in English (the slugified version of the English heading), NOT translated to the target language.** For example, when translating "## Consensus" to Spanish as "## Consenso", the slug should be `{#consensus}`, NOT `{#consenso}`.
- Remove the medium link in the translated version. This is because the link is to the english version.
- Do not translate tags in the heading. These should be kept the same because they are internationalized.
- Internal links should be kept the same, only changing the `/en` prefix to the corresponding language's
- External links must NOT be translated; they should be kept as they are, and it's the developer's responsibility to change them if they want to
- The initial quote for articles in a series must be consistent with the one from other articles in the same series. Do not modify it if you can find it in a previous article belonging to the same list - which you can consult in the file `src/lib/reading-lists/[lang].ts`.
- Do not use extremely formal language; try to maintain the friendly, approachable tone used in the english version.
- Place the file in the same path you originally found it, except you change the `/en` prefix for `/[lang]`.
- When translating the word `twist` in the context of elliptic curves, preserve it. Use it as a loanword.
- Translate figure citations and alt text, please, but preserve the `[zoom]` as-is when present, since it has special functionality.

After you do the translation, check the file `src/lib/reading-lists/en.ts`. If you find the article in a reading list, make sure to modify the corresponding `src/lib/reading-lists/[lang].ts` file to add the translated file to the same reading list, but in the target language.

---

Language-specific rules:

In SPANISH:
- translate `maps` (as in function) to `mapas`, not `mapeos`.
- translate `isomorphic to` as `es isomórfico a`. Make sure that the resulting sentence makes sense gramatically.
- translate `encryption` or similar words to `encriptación` or their corresponding word. Same for `decryption` and `desencriptación`.
- translate `Smart Contracts` to `Contratos Inteligentes`.
- translate the titles of articles starting with `WTF is` as `WTF es`. I want to prpeserve the anglicism!
- translate `a lot to gain` (or similar expressions) to `mucho para ganar`, not `mucho que ganar`.
- translate `threshold signatures` as `firmas de umbral`.
- assume Blockchain to be female. So it's not `un Blockchain`, but `una Blockchain`. Same with other gender-specific prepositions.
- translate `sum-check protocol` to `protocolo de verificación de la suma`.
- translate `correctness of a computation` as `correctitud de un cómputo`.
- translate `computation models` to `modelos de cómputo`.

In PORTUGUESE:
- keep in mind that we're translating to Brazilian portuguese, not portuguese from Portugal.
- translate `encryption` or similar words to `encriptação` or their corresponding word. Same for `decryption` and `decriptação`.
- you may use expressions around `jeito` for various things, sparingly. For example, `ajeitar` means `to organize or put in order`. `Desajeitar` means `to disorganize`, `dar um jeito em` means `to so something so that things are better`, `daquele jeito` means `that way!` referring to the current context. I assume you know these expressions - this is slang for brazilian portuguese. Remember not to force these expressions - only use them if they ever make sense, and the tone is adequate.
- when the tone is appropriate, you can condense `não é?` to `né?`. Don't abuse the resource, though!
- you may use `procurando` as a more informal synonym to `buscando`, if the context is right.
- translate `Alice` to `André` and `Bob` to `Bruna`.
- translate `threshold signatures` to `Assinaturas de Limite`. And in general, translate `threshold` when talking about cryptographic schemes as `de limite`.
- assume Blockchain to be female. So it's not `um Blockchain`, but `uma Blockchain`. Same with other gender-specific prepositions.
- do not translate "exploit". Simply keep "exploit" (or its plural) in english.
- translate `as in` as `ou seja`. It generally makes more sense in the context I use it.
