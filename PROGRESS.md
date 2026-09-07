# Library Finder — Progress Log

**Paused here as of 2026-08-18.** Pick back up at "Next Steps" below.

## Where things stand

The extension works end-to-end on four of five target retailers: Amazon, Walmart, Barnes & Noble, and Books-A-Million. All verified live against real book pages. Target is on hold (see Decisions below). Banner copy, styling, icons, and privacy policy are done. Everything needed to submit to the Chrome Web Store is ready except actually submitting.

## Next Steps

1. **Create/confirm the Google account for the developer dashboard.** Decided to use `ariba.jahan@gmail.com` (personal Gmail) rather than the `aribajahan.com` Google Workspace account — keeps this hobby project independent of business infrastructure, costs nothing since Ariba isn't retiring either email. Ariba still needs to actually go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and pay the one-time $5 registration fee herself (real payment, Claude can't do this step).
2. **Upload `dist/library-finder.zip`** — already built, current as of the banner copy update (all four sites, latest copy).
3. **Paste in the listing** from `docs/store-listing.md` — name, short/long description, category, privacy policy URL all written.
4. **Upload `docs/store-screenshot-1.png`** — already sized to the Store's 1280x800 requirement.
5. **Submit for review.**

Optional, not blocking submission: popup settings UI (library name/catalog URL) is still just a placeholder — Phase 4 item, low priority.

## Decisions Made
- Manifest V3, service worker background (`type: "module"` so `background.js` can `import` from `utils/library-api.js`).
- All Open Library API calls live in `background.js` — content scripts only detect ISBNs and render the banner.
- Banner injection lives in shared `utils/banner.js` (global, loaded before each site script) so per-site content scripts only handle ISBN extraction, not duplicate injection logic.
- ISBN extraction differs by site, discovered by testing each live rather than assuming one approach works everywhere:
  - **Amazon, Books-A-Million**: ISBN is in visible page text — generic regex + checksum scan (`findISBNInText`).
  - **Walmart**: ISBN only in raw HTML behind a collapsed spec section, labeled `ISBN: ...` — label-matching extractor (`findISBNAfterLabel`).
  - **Barnes & Noble**: ISBN in the URL's `ean` query param when present, falls back to the current product's own schema.org JSON-LD `offers.url` field (`findISBNInURL`, `findISBNInProductJSONLD`) — deliberately scoped to the current product's data, since B&N pages also link to unrelated books with their own ISBNs.
  - **Target: on hold.** Tested live — no ISBN anywhere in the rendered page or HTML. Only reachable via an internal, undocumented `deferred_enrichment` API call Target makes after page load. Same risk profile as WorldCat's now-dead free API: could change or break without notice. Decided with Ariba to skip rather than build on it. Revisit if Target ever exposes this more durably.
- WorldCat link uses ISBN (`q=bn:{isbn13}`) for exact-edition search, not title text — WorldCat's own site auto-sorts by proximity via IP geolocation, so no separate zip/location code was needed.
- Banner is green (not the original yellow, which read as spammy), with verified accessible contrast (11.7:1 body text, 5.3:1 links/dismiss against background). Copy doesn't name WorldCat directly ("Find a copy" — unfamiliar service name felt spammy) and avoids em dashes. Physical-library state explains *why* checking matters ("it's free, and you're supporting your library too"); the Open Library digital-borrow state doesn't reuse that line since Open Library is a separate Internet Archive program, not the reader's actual local library.
- The `User-Agent` header in `utils/library-api.js` is set on every fetch as the original brief requested, but browsers treat `User-Agent` as a forbidden header and silently drop it — open question below.
- Git workflow: feature branches + PRs for each change (not committing straight to `main`), merged after Ariba confirms a live test works.

## Open Questions
- **User-Agent header**: browsers strip this from `fetch()` regardless of what's set. Solve via a `declarativeNetRequest` rule (adds complexity), or accept Open Library won't see it?
- **ISBN detection scope on Amazon/BAM**: scans the whole visible page text, which could occasionally false-positive on a barcode-like number elsewhere on the page. Worth tightening if it ever misfires in practice.
- **Real local-branch availability**: not solvable for free/no-key today — WorldCat's public site shows *which libraries worldwide* hold a book, not a specific branch. True "your library has this" needs per-system APIs (e.g. NYPL has a free public one) plus a settings UI where the user picks their system — v2 territory, only covers libraries that publish an API.
- **Target**: revisit if a durable (public/stable) way to get its ISBN turns up.

## Completed
- [x] Full Manifest V3 scaffold, `manifest.json`, `background.js`, `utils/library-api.js` (Open Library Books API + Read API)
- [x] ISBN detection + banner injection for Amazon, Walmart, Barnes & Noble, Books-A-Million — all verified live
- [x] Banner styling (accessible green palette) and copy (warm, no em dash, accurate per-state reasoning)
- [x] Real icons (16/48/128px, generated programmatically, green rounded square with white open-book glyph)
- [x] `PRIVACY.md` — states the extension reads page text for ISBNs, sends only the ISBN to Open Library, stores/tracks nothing
- [x] Chrome Web Store prep: sized screenshot (`docs/store-screenshot-1.png`), listing copy (`docs/store-listing.md`), packaged zip (`dist/library-finder.zip`)
- [ ] Popup settings UI (library name/catalog URL) — not started, not blocking submission
- [ ] Target support — on hold, see Decisions above
- [ ] Actual Chrome Web Store submission — waiting on Ariba to register the developer account and pay the $5 fee
