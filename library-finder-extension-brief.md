# 📚 Library Finder — Chrome Extension
### Project Brief & Build Plan

---

## What It Is

A Chrome extension that intercepts book shopping on major retail sites and quietly surfaces a better option: **your local library has this, for free.**

When a user lands on a book product page, the extension checks availability and shows a small, non-intrusive notification — either "Borrow this free online via Open Library →" or "Check if your local library has this →"

---

## The Problem It Solves

Most people don't think to check their library before buying a book. Not because they don't want to — because the friction of switching tabs, searching a library catalog, and navigating an unfamiliar UI is just high enough that Amazon wins by default. This extension removes that friction entirely.

---

## Target Sites (v1)

| Site | Why |
|------|-----|
| amazon.com | Highest volume, clean book detection via ISBN |
| barnesandnoble.com | Pure book retailer, easy to parse |
| target.com | Large book section, ISBN present on book pages |
| walmart.com | Same as Target |
| booksamillion.com | Regional strength, dedicated book retailer |

**Detection logic:** If the product page contains an ISBN → it's a book → trigger the extension. No ISBN → do nothing. Works universally across all five sites.

---

## Scope (v1)

**In:**
- Books only (ISBN-based detection)
- Digital availability check via Open Library Read API
- Link to public WorldCat website for physical library lookup
- Simple, non-intrusive banner injected on the page

**Out (save for later):**
- Real-time physical availability at a specific local branch
- Magazines / periodicals
- Ebooks / audiobooks (Libby/OverDrive)
- Bookshop.org, ThriftBooks (indie/used retailers)
- Price comparison
- "Save for later" / reading list features

---

## How It Works (Technical Flow)

```
1. User lands on a book page
        ↓
2. Content script detects ISBN in page HTML
        ↓
3. ISBN sent to background service worker (via Chrome message passing)
        ↓
4. Background calls Open Library Books API → confirms it's a book, gets title + author
        ↓
5. Background calls Open Library Read API → checks digital borrow availability
        ↓
6. Banner injected into the page with one of two states:
   → "Borrow free online via Open Library" (if digitally available)
   → "Check your local library" with link to WorldCat public search (always)
```

---

## File Structure

```
library-finder/
├── manifest.json              ← Extension config (Manifest V3)
├── background.js              ← Service worker, all API calls live here
├── content_scripts/
│   ├── amazon.js              ← ISBN extraction for Amazon
│   ├── barnesandnoble.js      ← ISBN extraction for B&N
│   ├── target.js              ← ISBN extraction for Target
│   ├── walmart.js             ← ISBN extraction for Walmart
│   └── booksamillion.js       ← ISBN extraction for BAM
├── ui/
│   ├── banner.css             ← Banner styles
│   └── popup.html             ← Extension popup (settings, future use)
├── utils/
│   ├── isbn.js                ← ISBN detection/validation (handles ISBN-10 and ISBN-13)
│   └── library-api.js         ← Open Library API wrapper
└── assets/
    └── icons/                 ← Extension icons (16, 48, 128px)
```

---

## APIs

| API | Purpose | Cost |
|-----|---------|------|
| **Open Library Books API** | Confirms ISBN is a book, returns title/author/cover | Free, no key needed |
| **Open Library Read API** | Checks if book is digitally borrowable | Free, no key needed |
| **WorldCat public website** | Used as a link destination for physical library search | Free to use as a website |

**Note on WorldCat:** WorldCat's developer API (for querying library availability programmatically) shut down its free tier at the end of 2024 and now requires an institutional library subscription. We use the Open Library APIs instead for v1, and link users to search.worldcat.org (the public website) for physical availability.

**One courtesy rule for Open Library:** Set a descriptive User-Agent header on all API calls, e.g.:
```
User-Agent: LibraryFinder/1.0 (yourname@email.com)
```
Open Library is a nonprofit and asks developers to do this so they can reach you if needed.

---

## Banner UI Behavior

The banner shows one of two states:

**State 1 — Digitally available:**
> 📚 This book is available to borrow free online via Open Library → [Borrow Now]

**State 2 — Not digitally available (default for most books):**
> 📚 Before you buy — check if your local library has this → [Search WorldCat]

The WorldCat link is pre-populated with the book title so the user lands on a relevant search result.

- Appears at the top or bottom of the page (non-blocking)
- Dismissable with one click
- Does not appear if the ISBN returns no results from Open Library (rare)

---

## Build Phases

### Phase 1 — Core Detection (Amazon only)
- [ ] Scaffold Manifest V3 extension structure
- [ ] Write ISBN extractor for Amazon (`content_scripts/amazon.js`)
- [ ] Write `utils/isbn.js` — validation, normalize ISBN-10 to ISBN-13
- [ ] Write `utils/library-api.js` — Open Library Books API + Read API calls
- [ ] Inject basic banner on book pages
- [ ] Load unpacked in Chrome and test

### Phase 2 — Multi-Site Support
- [ ] Add ISBN extractors for B&N, Target, Walmart, BAM
- [ ] Handle edge cases (no ISBN, ISBN in different page locations)

### Phase 3 — Banner Polish
- [ ] Two-state banner design (digital available vs. check your library)
- [ ] Pre-populated WorldCat link with book title
- [ ] Dismiss behavior, loading state, error fallback

### Phase 4 — Settings & Submission
- [ ] Extension popup settings page (user can enter their library name)
- [ ] Extension icons (16px, 48px, 128px)
- [ ] Package for Chrome Web Store submission

---

## Local Folder to Create

Run this in Terminal before opening Claude Code:

```bash
mkdir -p ~/Projects/library-finder/{content_scripts,ui,utils,assets/icons}
```

---

## How to Load in Chrome for Testing

1. Go to `chrome://extensions/`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Select your `library-finder` folder
5. After any code change, hit the **refresh icon** on the extension card

---

## Opening Prompt for Claude Code

> "I'm building a Chrome extension called Library Finder. I have a project brief and a detailed build guide — read both and let's start with Phase 1. Scaffold the full Manifest V3 folder structure, write the manifest.json, write the Amazon ISBN content script, write isbn.js, and write library-api.js using the Open Library Books API and Read API. Then tell me how to load it in Chrome to test."

Drop both documents in and send that prompt.
