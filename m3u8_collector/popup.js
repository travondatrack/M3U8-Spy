// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const listElement = document.getElementById('url-list');
    const clearBtn = document.getElementById('clear-btn');
    const toast = document.getElementById('toast');
  
    // Load URLs
    loadUrls();
  
    // Listen for storage changes to update UI in real-time
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.m3u8_urls) {
        renderList(changes.m3u8_urls.newValue);
      }
    });
  
    // Clear history
    clearBtn.addEventListener('click', () => {
      chrome.storage.local.set({ m3u8_urls: [] });
      renderList([]);
    });
  
    function loadUrls() {
      chrome.storage.local.get(['m3u8_urls'], (result) => {
        renderList(result.m3u8_urls || []);
      });
    }
  
    function renderList(urls) {
      listElement.innerHTML = '';
      
      if (!urls || urls.length === 0) {
        listElement.innerHTML = '<div class="empty-state">No .m3u8 URLs detected yet.<br>Play a video to capture.</div>';
        return;
      }
  
      urls.forEach(url => {
        const li = document.createElement('li');
        li.className = 'url-item';
        li.textContent = url;
        li.title = "Click to copy";
        
        li.addEventListener('click', () => {
          navigator.clipboard.writeText(url).then(() => {
            showToast();
          });
        });
        
        listElement.appendChild(li);
      });
    }
  
    function showToast() {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    }
  });
