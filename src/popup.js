document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleControls');
    const status = document.getElementById('status');
  
    // Initialize the toggle based on current state
    chrome.storage.local.get(['controlsHidden'], (result) => {
      if (result.controlsHidden) {
        toggle.checked = true;
        status.textContent = 'Controls are hidden';
      } else {
        toggle.checked = false;
        status.textContent = 'Controls are visible';
      }
    });
  
    toggle.addEventListener('change', () => {
      chrome.runtime.sendMessage({ action: 'toggleControls' }, (response) => {
        if (response.controlsHidden) {
          status.textContent = 'Controls are hidden';
        } else {
          status.textContent = 'Controls are visible';
        }
      });
    });
  });
  