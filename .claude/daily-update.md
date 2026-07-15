Date: 2026-07-14
Developer: Frank

- Designed and approved the "Dark Editorial" full visual redesign (Consensys-inspired layout language on the existing dark purple palette; logo, fonts, and all functionality preserved)
- Implemented the redesign across the whole site: new design-token foundation, slim sticky navbar, editorial footer with glyph band, typographic home hero, flat post cards, editorial article page with sticky table of contents, restyled quiz/comments/coffee widget, blog/reading-lists/writers/FAQ index pages, and auth pages
- Retired the 3D render images and full-page pattern background; the content-hash glyph strip is now the signature brand element
- Fixed a long-standing double anchor-scroll offset (headings now land right below the navbar) and removed the leftover search console.log
- Verified with static builds, lint, and screenshots of every route (desktop + mobile + Spanish locale), including interactive quiz and anchor-jump tests
- Iterated on the redesign after feedback: purple-tinted backgrounds everywhere (no more near-black), gradient hero and page-header color blocks, vivid gradient buttons, bigger hero typography, gradient quiz border restored
- Second design iteration: full-bleed vivid purple hero fields with dark ink text on articles, landing, and all index pages (Consensys-style color blocks); added breadcrumbs to every content page
- Third feedback round: breadcrumbs moved onto the purple hero fields (no more black gap), hero titles in rich dark primary, like/comment as real icons in the hero rail with colored active state, coffee widget widened with background and padding, landing eyebrow removed, matrix-style glyph rain on the landing hero, flush bigger search thumbnails
- Fourth feedback round: darker hero titles, solid slightly-desaturated hero field with subtle right drift, black rain heads, fixed search dropdown clipping, custom styled clear button + whiter focus state on the search bar, bigger bolder tags, salmon coffee widget (wider, padded image)
- Fifth feedback round: 3D glyph render returned as the survey banner mascot, home reading-lists band shows a fanned stack of real list covers, fixed clipped tag rows on cards, reading-list cards preview their first three articles, login page sits on the vivid field with ink glyphs, navbar controls unified as outline buttons, arkana wordmark now primary
