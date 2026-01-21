chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["captured_resources"], (result) => {
    if (!result.captured_resources) {
      chrome.storage.local.set({ captured_resources: [] });
    }
  });
});

const filter = {
  urls: ["*://*/*.m3u8*", "*://*/*.vtt*", "*://*/*.mpd*", "*://*/*.key*"]
};

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.tabId === -1) return; // Non-tab requests

    const url = details.url;
    let type = null;
    
    if (url.includes(".m3u8")) type = "m3u8";
    else if (url.includes(".vtt")) type = "vtt";
    else if (url.includes(".mpd")) type = "mpd"; // DASH
    else if (url.includes(".key")) type = "key"; // DRM

    if (type) {
      const headers = {};
      if (details.requestHeaders) {
        details.requestHeaders.forEach(h => {
          if (['Referer', 'User-Agent', 'Cookie', 'Authorization'].includes(h.name)) {
            headers[h.name] = h.value;
          }
        });
      }

      addResource(url, type, headers, details.tabId);
    }
  },
  filter,
  ["requestHeaders", "extraHeaders"]
);

function addResource(url, type, headers = {}, tabId) {
  chrome.storage.local.get(["captured_resources"], (result) => {
    const resources = result.captured_resources || [];
    
    // Avoid duplicates by URL (simple check)
    const existingIndex = resources.findIndex(r => r.url === url);
    
    const resourceItem = {
      url: url,
      type: type,
      headers: headers,
      tabId: tabId,
      timestamp: Date.now()
    };

    if (existingIndex > -1) {
      // Move to top and update
      resources.splice(existingIndex, 1);
      resources.unshift(resourceItem);
    } else {
      resources.unshift(resourceItem);
    }

    // Limit size
    if (resources.length > 500) {
      resources.splice(500);
    }

    chrome.storage.local.set({ captured_resources: resources });
  });
}
