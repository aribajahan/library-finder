import { lookupBook } from "./utils/library-api.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "ISBN_DETECTED") return;

  lookupBook(message.isbn13)
    .then((result) => sendResponse({ ok: true, book: result }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true; // keep the message channel open for the async response
});
