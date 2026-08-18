// Shared with content scripts as a plain global, same as isbn.js.

function injectLibraryFinderBanner(book) {
  const banner = document.createElement("div");
  banner.id = "library-finder-banner";

  const isDigitallyAvailable = book.availability !== "unavailable";
  const worldcatUrl = `https://search.worldcat.org/search?q=bn:${book.isbn13}`;

  banner.innerHTML = isDigitallyAvailable
    ? `📚 Good news, <strong>${book.title}</strong> is free to borrow online right now.
       <a href="https://openlibrary.org/isbn/${book.isbn13}" target="_blank" rel="noopener">Borrow now</a>`
    : `📚 Before you buy <strong>${book.title}</strong>, check if your library has a copy. It's free, and you're supporting your library too.
       <a href="${worldcatUrl}" target="_blank" rel="noopener">Find a copy</a>`;

  const dismiss = document.createElement("button");
  dismiss.id = "library-finder-dismiss";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.textContent = "×";
  dismiss.addEventListener("click", () => banner.remove());
  banner.appendChild(dismiss);

  document.body.prepend(banner);
}

// Pass an isbn13 directly for sites where the default (visible-text) detection
// doesn't work — see findISBNAfterLabel in isbn.js.
function detectAndShowBanner(isbn13) {
  isbn13 = isbn13 || findISBNInText(document.body.innerText);
  if (!isbn13) return; // no ISBN on this page — not a book, do nothing

  chrome.runtime.sendMessage({ type: "ISBN_DETECTED", isbn13 }, (response) => {
    if (!response || !response.ok || !response.book) return; // no match, fail silently
    injectLibraryFinderBanner(response.book);
  });
}
