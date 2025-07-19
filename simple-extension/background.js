// Simple background script - just opens tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openTabs' && message.urls) {
    openTabs(message.urls, sender.tab);
  }
});

async function openTabs(urls, senderTab) {
  if (!urls || urls.length === 0) return;
  
  try {
    // Open each URL in a new tab
    for (let i = 0; i < urls.length; i++) {
      await chrome.tabs.create({
        url: urls[i],
        active: false,
        openerTabId: senderTab.id,
        index: senderTab.index + 1 + i
      });
    }
  } catch (error) {
    console.error('Error opening tabs:', error);
  }
}