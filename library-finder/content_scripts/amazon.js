(function () {
  const isbn13 = findISBNInText(document.body.innerText);
  if (!isbn13) return; // no ISBN on this page — not a book, do nothing

  chrome.runtime.sendMessage({ type: "ISBN_DETECTED", isbn13 }, (response) => {
    if (!response || !response.ok || !response.book) return; // no match, fail silently
    injectBanner(response.book);
  });

  function injectBanner(book) {
    const banner = document.createElement("div");
    banner.id = "library-finder-banner";

    const isDigitallyAvailable = book.availability !== "unavailable";
    const worldcatUrl = `https://search.worldcat.org/search?q=bn:${book.isbn13}`;

    banner.innerHTML = isDigitallyAvailable
      ? `📚 <strong>${book.title}</strong> is available to borrow free online via Open Library.
         <a href="https://openlibrary.org/isbn/${book.isbn13}" target="_blank" rel="noopener">Borrow Now</a>`
      : `📚 Before you buy <strong>${book.title}</strong> — check if your local library has it.
         <a href="${worldcatUrl}" target="_blank" rel="noopener">Find a copy</a>`;

    const dismiss = document.createElement("button");
    dismiss.id = "library-finder-dismiss";
    dismiss.setAttribute("aria-label", "Dismiss");
    dismiss.textContent = "×";
    dismiss.addEventListener("click", () => banner.remove());
    banner.appendChild(dismiss);

    document.body.prepend(banner);
  }
})();
