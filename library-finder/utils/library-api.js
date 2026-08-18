// Runs in the background service worker only — all network calls live here per
// Manifest V3 CSP rules (content scripts cannot make cross-origin fetches).

const USER_AGENT = "LibraryFinder/1.0 (ariba@aribajahan.com)";

// 'User-Agent' is a forbidden header name in fetch(), so Chrome silently drops it
// even here. Left in place in case a future declarativeNetRequest rule sets it instead.
const REQUEST_HEADERS = { "User-Agent": USER_AGENT };

// Confirms the ISBN belongs to a real book and returns { title, author, coverUrl } or null.
export async function fetchBookData(isbn13) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&format=json&jscmd=data`;
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) return null;

  const data = await response.json();
  const record = data[`ISBN:${isbn13}`];
  if (!record) return null;

  return {
    title: record.title || null,
    author: (record.authors && record.authors[0] && record.authors[0].name) || null,
    coverUrl: (record.cover && record.cover.medium) || null,
  };
}

// Checks Open Library's Read API for digital lending status.
// Returns "borrowable", "open" (read free, no waitlist), or "unavailable".
export async function checkReadAvailability(isbn13) {
  const url = `https://openlibrary.org/api/volumes/brief/isbn/${isbn13}.json`;
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) return "unavailable";

  const data = await response.json();
  const record = data.records && Object.values(data.records)[0];
  const status = record && record.availability && record.availability.status;

  if (status === "open") return "open";
  if (status === "borrow") return "borrowable";
  return "unavailable";
}

// Combines both calls into the single payload the content script needs to render a banner.
export async function lookupBook(isbn13) {
  const bookData = await fetchBookData(isbn13);
  if (!bookData) return null;

  const availability = await checkReadAvailability(isbn13);
  return { ...bookData, isbn13, availability };
}
