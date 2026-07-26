const YT_HOST_RE = /(^|\.)youtube(-nocookie)?\.com$/i;

function isYouTubeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return YT_HOST_RE.test(u.hostname);
  } catch {
    return false;
  }
}

async function toggleActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !isYouTubeUrl(tab.url)) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "hyde:toggle" });
  } catch {
    // Content script not injected yet (extension installed after page load).
    // User just needs to refresh — silently ignore.
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "hide") toggleActiveTab();
});
