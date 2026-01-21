// background.js

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["m3u8_urls"], (result) => {
    if (!result.m3u8_urls) {
      chrome.storage.local.set({ m3u8_urls: [] });
    }
  });
});

// Listener filter
const filter = {
  urls: ["*://*/*.m3u8*", "*://*/*.m3u8"]
};

// Listen for network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    
    // basic check to ensure it actually has .m3u8 in it (filter does mostly this, but double check)
    if (url.includes(".m3u8")) {
      addUrl(url);
    }
  },
  filter
);

function addUrl(url) {
  chrome.storage.local.get(["m3u8_urls"], (result) => {
    const urls = result.m3u8_urls || [];
    
    // Avoid duplicates
    if (!urls.includes(url)) {
      // Add to beginning of list
      urls.unshift(url);
      
      // limit storage to last 100 to prevent explosion? 
      // User didn't ask for limit, but good practice. strict req said "Collect all", so I'll keep it unbounded or large.
      // Let's just keep it simple.
      
      chrome.storage.local.set({ m3u8_urls: urls });
    }
  });
}
