# Library Finder — Progress Log

## Decisions Made
- Manifest V3, service worker background (`type: "module"` so `background.js` can `import` from `utils/library-api.js`).
- All Open Library API calls live in `background.js` — content scripts only detect ISBNs and render the banner, per the build guide's CSP note.
- ISBN detection scans `document.body.innerText` with a regex + checksum validator (`utils/isbn.js`) rather than targeting Amazon's specific DOM table. More resilient to Amazon layout changes; will revisit if it proves too loose on other sites in Phase 2.
- `isbn.js` is loaded as a plain global (not an ES module) so `content_scripts/amazon.js` can call its functions directly — Chrome content scripts share one execution context across the files listed in `manifest.json`.
- The `User-Agent` header in `utils/library-api.js` is set on every fetch as the brief requested, but browsers treat `User-Agent` as a forbidden header and silently drop it — it won't actually reach Open Library. Flagged as an open question below.

## Completed (Phase 1)
- [x] Full Manifest V3 folder structure scaffolded under `library-finder/`
- [x] `manifest.json`
- [x] `background.js` — message listener, calls Open Library APIs, responds to content script
- [x] `content_scripts/amazon.js` — ISBN detection + banner injection
- [x] `utils/isbn.js` — ISBN-10/13 validation, checksum, normalize-to-13
- [x] `utils/library-api.js` — `fetchBookData`, `checkReadAvailability`, `lookupBook`
- [x] `ui/banner.css` — basic banner styling
- [x] `ui/popup.html` — placeholder popup (real settings UI is Phase 4)

## Next Steps
- Load unpacked in Chrome and test against a real Amazon book page (see instructions Claude gave in chat).
- Phase 2: add `content_scripts/barnesandnoble.js`, `target.js`, `walmart.js`, `booksamillion.js`, plus their `matches` entries and `js` arrays in `manifest.json`.
- Phase 3: polish the banner (loading state while waiting on the API response, error fallback if Open Library is slow/down, WorldCat link pre-populated more precisely).
- Phase 4: real icons (16/48/128px), popup settings (library name/catalog URL), Chrome Web Store packaging.

## Open Questions
- **User-Agent header**: browsers strip this header from `fetch()` calls regardless of what we set. Do we care enough to solve it via a `declarativeNetRequest` rule (adds complexity), or accept that Open Library won't see our identifying header for now?
- **ISBN detection scope**: currently scans the whole page's visible text, which could occasionally false-positive on a barcode-like number elsewhere on the page (e.g., in a review or an ad). Worth tightening to Amazon's product-details section once we see it fail in practice?
- Icons for `assets/icons/` aren't created yet — placeholder or real design, and when?
- **Real local-branch availability**: confirmed with Ariba this isn't solvable for free/no-key today — WorldCat's public site can only show *which libraries worldwide* hold a book, not confirm a specific branch. True "your library has this" requires per-system APIs (e.g. NYPL has a free public one) and a settings UI where the user picks their system — deferred to Phase 4/v2, only covers libraries that publish an API.

## Fixes Applied
- WorldCat link now searches by ISBN (`q=bn:{isbn13}`) instead of title text — exact-edition match instead of fuzzy title search. (Reported: banner search wasn't finding the right book / weak results.)
