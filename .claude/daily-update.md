Date: 2026-07-14
Developer: Frank

- Designed and approved the "Dark Editorial" full visual redesign (Consensys-inspired layout language on the existing dark purple palette; logo, fonts, and all functionality preserved)
- Implemented the redesign across the whole site: new design-token foundation, slim sticky navbar, editorial footer with glyph band, typographic home hero, flat post cards, editorial article page with sticky table of contents, restyled quiz/comments/coffee widget, blog/reading-lists/writers/FAQ index pages, and auth pages
- Retired the 3D render images and full-page pattern background; the content-hash glyph strip is now the signature brand element
- Fixed a long-standing double anchor-scroll offset (headings now land right below the navbar) and removed the leftover search console.log
- Verified with static builds, lint, and screenshots of every route (desktop + mobile + Spanish locale), including interactive quiz and anchor-jump tests
