When you translate to other languages, make sure that:

- Slugs are added to headings, so that they match the english title. They should be added in the format `{#heading-slug}` right beside the slug.
- Remove the medium link in the translated version. This is because the link is to the english version.
- Do not translate tags in the heading. These should be kept the same because they are internationalized.
- Internal links should be kept the same, only changing the `/en` prefix to the corresponding language's
- External links must NOT be translated; they should be kept as they are, and it's the developer's responsibility to change them if they want to
- The initial quote for articles in a series must be consistent with the one from other articles in the same series. Do not modify it if you can find it in a previous article belonging to the same list - which you can consult in the file `src/lib/reading-lists/[lang].ts`.
- Do not use extremely formal language; try to maintain the friendly, approachable tone used in the english version.
- Place the file in the same path you originally found it, except you change the `/en` prefix for `/[lang]`.
- When translating the word `twist` in the context of elliptic curves, preserve it. Use it as a loanword.

After you do the translation, check the file `src/lib/reading-lists/en.ts`. If you find the article in a reading list, make sure to modify the corresponding `src/lib/reading-lists/[lang].ts` file to add the translated file to the same reading list, but in the target language.

---

Language-specific rules:

- In SPANISH, translate `maps` (as in function) to `mapas`, not `mapeos`.
- In SPANISH, translate `isomorphic to` as `es isomórfico a`. Make sure that the resulting sentence makes sense gramatically.
- In SPANISH, translate `encryption` or similar words to `encriptación` or their corresponding word. Same for `decryption` and `desencriptación`.

- In PORTUGUESE, keep in mind that we're translating to Brazilian portuguese, not portuguese from Portugal.
- In PORTUGUESE, translate `encryption` or similar words to `encriptação` or their corresponding word. Same for `decryption` and `decriptação`.
- In PORTUGUESE, you may use expressions around `jeito` for various things, sparingly. For example, `ajeitar` means `to organize or put in order`. `Desajeitar` means `to disorganize`, `dar um jeito em` means `to so something so that things are better`, `daquele jeito` means `that way!` referring to the current context. I assume you know these expressions - this is slang for brazilian portuguese. Remember not to force these expressions - only use them if they ever make sense, and the tone is adequate.
- In PORTUGUESE, when the tone is appropriate, you can condense `não é?` to `né?`. Don't abuse the resource, though!
- In PORTUGUESE, you may use `procurando` as a more informal synonym to `buscando`, if the context is right.
- In PORTUGUESE, translate `Alice` to `André` and `Bob` to `Bruna`.
