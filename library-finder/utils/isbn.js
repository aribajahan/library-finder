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
