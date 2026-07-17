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
- Sixth feedback round: home reading-lists band bigger (larger heading, taller padding, bigger fanned covers), hover lift instead of fading, reading-lists page cards now full-width single-column with four-article previews, article hero titles span the full content width (no early wrapping)
- Replaced the survey banner's static 3D image with a 'decoder sigil': a 4x4 Arkana glyph grid that scrambles and decodes into the SHA-256 fingerprint of the banner's own title when scrolled into view, idles with occasional glyph flickers, and re-decodes on hover (3D three.js experiment dropped and cleaned up)
- Survey banner polish: decode animation now fires exactly once (hover replay removed), and the section lost its panel border/background so the sigil sits directly on the page
- Added tag-based browsing: the Blog page now has a client-side tag filter (chips with counts, +N more expander, ?tag= deep links), and tags on article heroes and post cards are clickable again — no backend involved, all data ships at build time
- Backend tag search groundwork: the indexing script now marks tags as filterable in Meilisearch, and the Go search endpoint accepts tags=a,b with match=all|any plus facets=tags returning live tag counts (verified end-to-end against a throwaway Meilisearch container; no new database tables needed)
- Added pnpm run index:all (bulk reindex of all content per language, batched, applying tag-filter and count-sorted facet settings) and a backend GET /api/search/tags endpoint: tag type-ahead over Meilisearch facet search, most-used tags first (verified live against a test Meilisearch)
- Remote tag enablement: publish-content.js now applies tag-filter/facet settings before each index write, plus an ephemeral scripts/apply-tag-settings-remote.js (untracked, delete after use) that enables tag search on the remote indexes over SSH — no bulk re-publish needed since remote docs already carry tags
- Blog multi-tag filtering: collapsible Filters section with a tag type-ahead (backend facet search, most-used tags on focus), removable tag pills, shareable tags=a,b URLs, AND semantics; static first paint preserved when no tags are active, silent client-side fallback if the API is down; tag clicks anywhere now navigate to the filtered blog
- Navbar polish: language and sign-in controls restyled as borderless uppercase links matching the nav items, sign-in/account actions moved into the mobile hamburger, and the login page glyph field now tiles the entire viewport

Date: 2026-07-17
Developer: co-work

- Completed the full SEO improvement plan (14 items) on branch feature/seo-improvements, executed and reviewed task-by-task:
- Search engines can now find a full site map of every page (sitemap.xml) and know which pages they're allowed to crawl (robots.txt)
- Untranslated articles no longer create dead "Post Not Found" pages that search engines could index by mistake, and language links (e.g. "read this in Spanish") only appear when a translation actually exists
- The homepage at the bare site address now shows the actual English homepage immediately — no blank page, no flash, no redirect step of any kind — while every page still correctly declares its language to browsers and search engines (an earlier version of this fix caused a brief blank-page flash after deploying; caught after deployment and replaced same day with a direct-render approach that has none)
- Rich search-result data (article previews, organization info) now renders directly in the page instead of loading in after the fact, so it reliably shows up in Google
- Fixed a broken icon reference and a broken logo link that were both quietly 404ing
- The blog listing, writer profile pages, and reading-list articles now each have one clear, correct address search engines should index, instead of duplicate/near-duplicate versions competing with each other
- Clicking a topic tag now lands on a dedicated, search-indexable page for that topic (e.g. "Zero-Knowledge Proofs") instead of only filtering the current view
- Added an RSS feed per language so readers and feed tools can subscribe to new articles
- Strengthened the default page description search engines show, and removed an outdated field they no longer use
- Article pages now announce their breadcrumb trail to search engines, writer profile pages describe the author as a structured "Person" (name, photo, bio, socials), and the FAQ page marks up its three questions so they can show up as rich snippets in search results
- Verified with full site builds, an automated content check, and lint after every step; one cross-page inconsistency (reading-list article pages linking to translations that don't exist) was caught in final review and fixed before merge
