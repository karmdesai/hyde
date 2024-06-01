let controlsHidden = false;

// Initialize controlsHidden from storage
chrome.storage.local.get(['controlsHidden'], (result) => {
  if (result.controlsHidden !== undefined) {
    controlsHidden = result.controlsHidden;
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'hide') {
    toggleControls();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleControls') {
    toggleControls(() => {
      sendResponse({ controlsHidden });
    });
    return true; // Keeps the message channel open for sendResponse
  }
});

function toggleControls(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabUrl = tabs[0].url;
    const onYT = tabUrl.includes('youtube.com/watch?');

    if (onYT) {
      if (!controlsHidden) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['src/hide.js']
        });
        controlsHidden = true;
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['src/show.js']
        });
        controlsHidden = false;
      }
      chrome.storage.local.set({ controlsHidden }, () => {
        if (callback) callback();
      });
    }
  });
}
