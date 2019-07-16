chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.from === 'content') return;

  const imageUrls = Array.from(document.querySelectorAll('img')).map(img => img.src);
  if (message.subject === 'getImageURLs') response(imageUrls);
});
