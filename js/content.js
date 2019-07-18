chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.from === 'content') return;

  const imageUrls = Array.from(document.querySelectorAll('img'))
    .map(img => img.src)
    .filter(src => /^data:image\/(gif|jpe?g|png);base64/i.test(src) || /^https?/i.test(src));
  const url = window.location.href;
  const regexPrefix = /^https:\/\/www.google.com\/search\?.*q=(.*?)&/i;
  const matches = url.match(regexPrefix);
  const prefix = matches.length === 2 ? matches[1].replace('+', '-') : '';
  if (message.subject === 'getImageURLs') {
    response({ urls: imageUrls, prefix });
  }
});
