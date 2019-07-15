console.log('background.js running');

// chrome.runtime.onMessage.addListener((message, sender) => {
//   // First, validate the message's structure.
//   if ((message.from === 'content') && (message.subject === 'showPageAction')) {
//     // Enable the page-action for the requesting tab.
//     chrome.pageAction.show(sender.tab.id);
//   }
// });