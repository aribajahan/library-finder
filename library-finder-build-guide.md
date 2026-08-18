# 📚 Library Finder Chrome Extension
## Complete Setup & Build Guide

---

## Before You Open Claude Code

Read this whole document first. It covers everything you need to set up, which APIs to use (and why), and exactly how to hand this off to Claude Code so you're not figuring things out mid-session.

---

## The API Situation (Important — Read This First)

You were originally going to use WorldCat. Here's the honest update:

**WorldCat's API changed.** The old free version shut down at the end of 2024. The new version (v2) requires an institutional OCLC subscription — meaning your library has to pay for it. That's not accessible to an indie developer building a Chrome extension.

**The good news: you don't need WorldCat.** Here's what you'll actually use:

---

## APIs You'll Use (Both Free, No Key Required)

### 1. Open Library API
**What it does:** Confirms a product is a book (via ISBN lookup), returns title, author, cover image, and metadata.
**Cost:** Free. No account. No key.
**URL:** `https://openlibrary.org/developers/api`
**Example call:**
```
https://openlibrary.org/api/books?bibkeys=ISBN:9780525559474&format=json&jscmd=data
```
This is your first check: ISBN goes in, book data comes out. If nothing comes back, it's not a book — do nothing.

**One courtesy rule:** Include a descriptive User-Agent header that identifies your app and your email. Open Library is a nonprofit and asks developers to do this so they can reach you if your app is making too many requests. Example:
```
User-Agent: LibraryFinder/1.0 (yourname@email.com)
```

---

### 2. Open Library Read API
**What it does:** Takes the same ISBN and returns availability — whether the book can be borrowed digitally through Open Library's lending program (which is connected to the Internet Archive).
**Cost:** Free. No account. No key.
**Example call:**
```
https://openlibrary.org/api/volumes/brief/isbn/9780525559474.json
```
This tells you if the book is: freely available, lendable (borrow for 14 days), or not available digitally.

**Important:** This covers digital borrowing only — not physical copies at your local branch. See "What the Extension Can and Can't Do" below.

---

## What the Extension Can and Can't Do (Be Honest With Yourself About This)

**What it CAN do in v1:**
- Detect that a product is a book (via ISBN)
- Confirm the book exists in Open Library's catalog
- Tell the user if the book is available to borrow digitally for free via Open Library / Internet Archive
- Show a banner on Amazon, B&N, Target, Walmart, and BAM pages

**What it CANNOT do in v1:**
- Check physical availability at a specific local library branch (e.g., "your New Rochelle Public Library has 2 copies available")
- Connect to a library's real-time catalog system

**Why:** Real-time physical availability requires either the library's own API (most libraries don't have a public one) or WorldCat, which is no longer accessible to indie developers.

**What you can say in the banner instead:**
> "This book may be available at your local library — search your library's catalog →"

That's still useful. That's still the moment of interruption that redirects someone from buying to checking. And the link can go directly to `https://search.worldcat.org` (the public-facing website, which is free) pre-searched with the book's title.

**For v2:** If you want real physical availability data, the path is to reach out to specific library systems (like NYPL, which has a public API) or look into the **BiblioCommons API**, which powers many public library catalog websites.

---

## Your Local Folder Setup

Create this folder structure on your Mac before opening Claude Code:

```
~/Projects/library-finder/
├── manifest.json
├── background.js
├── content_scripts/
│   ├── amazon.js
│   ├── barnesandnoble.js
│   ├── target.js
│   ├── walmart.js
│   └── booksamillion.js
├── ui/
│   ├── banner.html
│   ├── banner.css
│   └── popup.html
├── utils/
│   ├── isbn.js
│   └── library-api.js
└── assets/
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

To create it fast, open Terminal and paste:
```bash
mkdir -p ~/Projects/library-finder/{content_scripts,ui,utils,assets/icons}
```

---

## Loading the Extension in Chrome (For Testing)

You don't need to publish to the Chrome Web Store while building. Chrome lets you load unpacked extensions directly from your local folder.

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle **Developer mode** ON (top right corner)
4. Click **Load unpacked**
5. Select your `library-finder` folder
6. Your extension appears in the list — click the puzzle piece icon in the toolbar to pin it

Every time you make a file change in Claude Code, go back to `chrome://extensions/` and click the **refresh icon** on your extension card to reload it.

---

## Build Phases

### Phase 1 — Core Detection (Start Here)
Goal: Detect a book page on Amazon and show a test banner.

- [ ] `manifest.json` — Manifest V3 config, declares permissions and content scripts
- [ ] `content_scripts/amazon.js` — Scrapes ISBN from Amazon product page
- [ ] `utils/isbn.js` — ISBN validation helper (ISBNs can be 10 or 13 digits)
- [ ] `utils/library-api.js` — Calls Open Library API with the ISBN
- [ ] `ui/banner.css` — Basic banner styles
- [ ] Basic banner injection into the page

**Test:** Go to any Amazon book page. See the banner appear.

---

### Phase 2 — Real Availability Data
Goal: Replace the test banner with actual Open Library data.

- [ ] Call Open Library Books API → confirm it's a book, get title + author
- [ ] Call Open Library Read API → check digital availability
- [ ] Show one of three states in the banner:
  - "Borrow this free online via Open Library →"
  - "Not available digitally, but check your local library →" (link to WorldCat public search)
  - Nothing (if ISBN not found — rare)

---

### Phase 3 — Multi-Site Support
Goal: Add the other four retailers.

- [ ] `content_scripts/barnesandnoble.js`
- [ ] `content_scripts/target.js`
- [ ] `content_scripts/walmart.js`
- [ ] `content_scripts/booksamillion.js`

Each site puts the ISBN in a slightly different place in the HTML — Claude Code will handle the extraction logic per site.

---

### Phase 4 — Polish
Goal: Make it feel real.

- [ ] Extension settings popup (popup.html) — user can enter their library name and preferred catalog URL
- [ ] Banner design — non-intrusive, dismissable, consistent across sites
- [ ] Extension icons (16px, 48px, 128px) — you can generate simple ones or use a placeholder
- [ ] Error handling — graceful fallback if API is slow or book not found
- [ ] Prep for Chrome Web Store submission (screenshots, description, privacy policy)

---

## What to Say When You Open Claude Code

Paste this at the start of your session:

> "I'm building a Chrome extension called Library Finder. When a user is on an Amazon, Barnes & Noble, Target, Walmart, or Books-A-Million book product page, it detects the ISBN, calls the Open Library API to confirm it's a book, calls the Open Library Read API to check digital availability, and injects a small banner on the page. We're using Manifest V3. Let's start with Phase 1: scaffold the full folder structure, write the manifest.json, write the Amazon ISBN content script, write the isbn.js utility, and write the library-api.js utility that calls Open Library. Then show me how to load it in Chrome to test it."

That one prompt gets you most of Phase 1 done in one shot.

---

## Key Technical Notes for Claude Code Sessions

- **Manifest V3** — this is the current Chrome extension standard. Do not let Claude Code use Manifest V2 — it's being deprecated.
- **Service worker, not background page** — Manifest V3 uses `background.service_worker` not `background.scripts`. Important distinction.
- **Content Security Policy** — Chrome extensions have strict CSP rules. All API calls should happen in `background.js` (the service worker), not in the content scripts themselves. Content scripts send messages to the background, background makes the API call, sends result back.
- **ISBN formats** — Amazon pages often have both ISBN-10 and ISBN-13. Your isbn.js should handle both and normalize to ISBN-13.
- **User-Agent** — Set a descriptive User-Agent on all Open Library calls or you may get rate limited.

---

## Future API Options (When You're Ready for Physical Availability)

These are for later — don't let them slow you down now.

| Option | What It Gives You | How to Get It |
|--------|------------------|---------------|
| **NYPL API** | Real-time catalog for New York Public Library | developer.nypl.org — free, apply for key |
| **BiblioCommons** | Powers many public library websites | Contact them — aimed at libraries, but possible for apps |
| **LibraryThing API** | Book data, some library connections | librarything.com/services/keys — free tier |
| **Kanopy / Hoopla** | Streaming availability via libraries | Institutional partnerships only |

For a v2 that shows physical availability, your best path is to support specific major library systems (NYPL, Chicago Public Library, LA Public Library) via their individual APIs, and let users select their system in settings.

---

## Summary

| What | Where |
|------|-------|
| Build tool | Claude Code on desktop app |
| Local folder | `~/Projects/library-finder/` |
| API 1 | Open Library Books API — free, no key |
| API 2 | Open Library Read API — free, no key |
| API keys to get | None for v1 |
| Test method | Chrome → chrome://extensions → Load unpacked |
| First session prompt | See "What to Say When You Open Claude Code" above |
