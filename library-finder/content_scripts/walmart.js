// Walmart doesn't render the ISBN in visible page text — it's inside a collapsed
// "Specifications" section, present only in the raw HTML labeled "ISBN: ...".
detectAndShowBanner(findISBNAfterLabel(document.documentElement.innerHTML));
