// B&N puts the ISBN in the URL's "ean" param when present; falls back to the
// current product's own JSON-LD data when it isn't (see isbn.js for why that's
// scoped instead of a blind page-text search).
detectAndShowBanner(findISBNInURL() || findISBNInProductJSONLD());
