// Shortcut bindings from v1.3 (c94ad79) are stored by Chrome under the command
// name "hide". Do not rename that command or existing Ctrl+M / custom keys die.
const YT_HOST_RE = /(^|\.)youtube(-nocookie)?\.com$/i;

function isYouTubeVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  // Same gate as v1.3. Homepage -> /watch SPA navigations still match,
  // because the tab URL updates even when no content script was injected.
  if (url.includes("youtube.com/watch?")) return true;
  try {
    const u = new URL(url);
    if (!YT_HOST_RE.test(u.hostname)) return false;
    if (u.pathname === "/watch" || u.pathname.startsWith("/watch/")) return true;
    return /^\/(live|shorts|embed|clip)\//.test(u.pathname);
  } catch {
    return false;
  }
}

async function ensureActiveVideoTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isYouTubeVideoUrl(tab.url)) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "hyde:ping" }, { frameId: 0 });
    return;
  } catch {
    // This tab has no content script yet (opened before update, or a
    // homepage -> /watch SPA navigation). Inject, then it reads storage.
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [0] },
      files: ["src/content.js"],
    });
  } catch {
    // Page can't run scripts.
  }
}

async function toggleGlobal() {
  const { hidden = false } = await chrome.storage.local.get({ hidden: false });
  await chrome.storage.local.set({ hidden: !hidden });
  await ensureActiveVideoTab();
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "hide") toggleGlobal();
});
