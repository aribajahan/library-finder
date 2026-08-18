// Shared with content scripts as a plain global (loaded before them in manifest.json's
// content_scripts "js" array, so these functions live in the same isolated-world scope).

function isbnStripDashes(raw) {
  return raw.replace(/[\s-]/g, "");
}

function isValidISBN10(raw) {
  const isbn = isbnStripDashes(raw);
  if (!/^\d{9}[\dXx]$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(isbn[i]);
  const last = isbn[9].toUpperCase() === "X" ? 10 : Number(isbn[9]);
  sum += last;
  return sum % 11 === 0;
}

function isValidISBN13(raw) {
  const isbn = isbnStripDashes(raw);
  if (!/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += (i % 2 === 0 ? 1 : 3) * Number(isbn[i]);
  return sum % 10 === 0;
}

function isbn10to13(raw) {
  const isbn10 = isbnStripDashes(raw);
  if (!isValidISBN10(isbn10)) return null;
  const core = "978" + isbn10.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += (i % 2 === 0 ? 1 : 3) * Number(core[i]);
  const check = (10 - (sum % 10)) % 10;
  return core + check;
}

// Normalizes any valid ISBN-10 or ISBN-13 string to ISBN-13. Returns null if invalid.
function normalizeISBN(raw) {
  const isbn = isbnStripDashes(raw);
  if (isValidISBN13(isbn)) return isbn;
  if (isValidISBN10(isbn)) return isbn10to13(isbn);
  return null;
}

// Scans free text (e.g. a product detail table) for ISBN-10/13 candidates and
// returns the first one that normalizes successfully, or null.
function findISBNInText(text) {
  const candidates = text.match(/\b(?:97[89][\s-]?)?(?:\d[\s-]?){9,12}[\dXx]\b/g);
  if (!candidates) return null;
  for (const candidate of candidates) {
    const normalized = normalizeISBN(candidate);
    if (normalized) return normalized;
  }
  return null;
}

// For sites (e.g. Walmart) that only put the ISBN in the raw page HTML — inside a
// collapsed spec list, not the visible text — labeled explicitly as "ISBN: ...".
// Matching on that label avoids false positives from the many other numeric IDs
// (prices, tracking pixels, product IDs) present in a page's full HTML source.
function findISBNAfterLabel(html) {
  const match = html.match(/ISBN[:\s]+(\d{9,13}[Xx]?)/i);
  return match ? normalizeISBN(match[1]) : null;
}

// Barnes & Noble puts the ISBN in the page URL as an "ean" query param.
function findISBNInURL() {
  const ean = new URL(location.href).searchParams.get("ean");
  return ean ? normalizeISBN(ean) : null;
}

// Fallback for when the "ean" param isn't in the URL (e.g. a link that only has the
// product's numeric ID): read it from the page's own schema.org JSON-LD product data,
// specifically the current product's "offers.url" field. Deliberately scoped to that
// field rather than a blind text search of the page, since the page also contains
// "customers also bought"-style links to *other* books with their own ISBNs — a blind
// search risks grabbing the wrong one.
function findISBNInProductJSONLD() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch (e) {
      continue;
    }
    const graph = data["@graph"] || [data];
    for (const node of graph) {
      const offerUrl = node.offers && node.offers.url;
      if (!offerUrl) continue;
      const match = offerUrl.match(/[?&]ean=(\d{9,13})/i);
      if (!match) continue;
      const normalized = normalizeISBN(match[1]);
      if (normalized) return normalized;
    }
  }
  return null;
}
