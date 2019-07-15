const imageUrls = Array.from(document.querySelectorAll('img'))
  .map(img => img.src);

chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.from === 'content') return;
  if (message.subject === 'getImageURLs') response(imageUrls);
});
