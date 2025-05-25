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
