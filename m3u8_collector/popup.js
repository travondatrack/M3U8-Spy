document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('list-container');
  const requestList = document.getElementById('request-list');
  const emptyState = document.getElementById('empty-state');
  const settingsView = document.getElementById('settings-view');
  const tabs = document.querySelectorAll('.tab');
  const toast = document.getElementById('toast');
  
  let activeTab = 'm3u8';
  let capturedResources = [];

  init();

  function init() {
    loadResources();
    setupTabs();
    setupSettings();
    
    // Listen for background updates
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.captured_resources) {
        capturedResources = changes.captured_resources.newValue || [];
        if (activeTab !== 'settings') {
          renderList();
        }
      }
    });
  }

  function loadResources() {
    chrome.storage.local.get(['captured_resources'], (result) => {
      capturedResources = result.captured_resources || [];
      renderList();
    });
  }

  function setupTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        activeTab = tab.dataset.tab;
        
        if (activeTab === 'settings') {
          listContainer.style.display = 'none';
          settingsView.classList.add('active');
        } else {
          listContainer.style.display = 'block';
          settingsView.classList.remove('active');
          renderList();
        }
      });
    });
  }

  function setupSettings() {
    document.getElementById('clear-history').addEventListener('click', () => {
      if (confirm('Clear all captured history?')) {
        chrome.storage.local.set({ captured_resources: [] });
        showToast('HISTORY CLEARED');
      }
    });

    document.getElementById('export-json').addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(capturedResources, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "network_sniff_" + Date.now() + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }

  function getByType(type) {
    if (type === 'headers') {
      return capturedResources.filter(r => r.type === 'mpd' || r.type === 'key');
    }
    return capturedResources.filter(r => r.type === type);
  }

  function renderList() {
    if (activeTab === 'settings') return;

    const items = getByType(activeTab);
    
    requestList.innerHTML = '';
    
    if (items.length === 0) {
      emptyState.style.display = 'flex';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'request-item';
      
      const fileName = getFileName(item.url);
      const domain = new URL(item.url).hostname;
      const time = new Date(item.timestamp).toLocaleTimeString();

      li.innerHTML = `
        <div class="item-header">
          <div class="url-line" title="${item.url}">${fileName}</div>
        </div>
        <div class="meta-line">
          <span class="domain-badge">${domain}</span>
          <span class="timestamp">${time}</span>
        </div>
        <div class="item-actions">
          <button class="action-btn copy-btn">COPY</button>
          <button class="action-btn export-btn">EXPORT</button>
          <button class="action-btn preview-btn">PREVIEW</button>
        </div>
      `;

      li.querySelector('.copy-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(item.url).then(() => showToast('URL COPIED'));
      });

      li.querySelector('.export-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(JSON.stringify(item, null, 2));
        showToast('JSON COPIED');
      });

      li.querySelector('.preview-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.tabs.create({ url: item.url });
      });

      requestList.appendChild(li);
    });
  }

  function getFileName(url) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      let name = parts.pop() || u.hostname;
      if (name.length > 50) name = name.substring(0, 47) + '...';
      return name;
    } catch (e) {
      return url.substring(0, 30);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2000);
  }
});
