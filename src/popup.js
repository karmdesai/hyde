const YT_HOST_RE = /(^|\.)youtube(-nocookie)?\.com$/i;

const $toggle = document.getElementById("toggle");
const $statusText = document.getElementById("statusText");
const $toggleCard = document.getElementById("toggleCard");
const $notYtCard = document.getElementById("notYtCard");
const $shortcutText = document.getElementById("shortcutText");
const $changeShortcut = document.getElementById("changeShortcut");
const $version = document.getElementById("version");

function isYouTubeUrl(url) {
  if (!url) return false;
  try {
    return YT_HOST_RE.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function detectShortcutsUrl() {
  const ua = navigator.userAgent;
  // navigator.brave exists on Brave; check async but fall back to UA sniff
  if (/Edg\//.test(ua)) return "edge://extensions/shortcuts";
  if (/OPR\//.test(ua) || /Opera/.test(ua)) return "opera://extensions/shortcuts";
  if (/Vivaldi/.test(ua)) return "vivaldi://extensions/shortcuts";
  return "chrome://extensions/shortcuts";
}

async function resolveShortcutsUrl() {
  try {
    if (navigator.brave && (await navigator.brave.isBrave())) {
      return "brave://extensions/shortcuts";
    }
  } catch {}
  return detectShortcutsUrl();
}

async function loadShortcut() {
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find((c) => c.name === "hide");
    const s = (cmd && cmd.shortcut) || "";
    if (s) {
      $shortcutText.textContent = s;
      $shortcutText.classList.remove("unset");
    } else {
      $shortcutText.textContent = "not set";
      $shortcutText.classList.add("unset");
    }
  } catch {
    $shortcutText.textContent = "Ctrl+M";
  }
}

async function init() {
  $version.textContent = "v" + (chrome.runtime.getManifest().version || "");

  loadShortcut();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !isYouTubeUrl(tab.url)) {
    $toggleCard.hidden = true;
    $notYtCard.hidden = false;
    return;
  }

  let state = { hidden: false };
  try {
    state = (await chrome.tabs.sendMessage(tab.id, { type: "hyde:get" })) || state;
  } catch {
    // Content script not present — page loaded before install. Ask user to refresh.
    $toggleCard.hidden = true;
    $notYtCard.hidden = false;
    $notYtCard.querySelector(".row-title").textContent = "Refresh this tab";
    $notYtCard.querySelector(".row-sub").textContent =
      "hyde was installed after this page loaded. Reload the tab and try again.";
    return;
  }

  applyState(state.hidden);

  $toggle.addEventListener("change", async () => {
    try {
      const res = await chrome.tabs.sendMessage(tab.id, {
        type: "hyde:set",
        hidden: $toggle.checked,
      });
      applyState(res.hidden);
    } catch {
      applyState(!$toggle.checked);
    }
  });
}

function applyState(hidden) {
  $toggle.checked = !!hidden;
  $statusText.textContent = hidden ? "on" : "off";
}

$changeShortcut.addEventListener("click", async () => {
  const url = await resolveShortcutsUrl();
  try {
    await chrome.tabs.create({ url });
  } catch {
    // Some browsers block programmatic navigation to internal pages.
    // Copy to clipboard as a fallback.
    try {
      await navigator.clipboard.writeText(url);
      $changeShortcut.textContent = "Copied " + url;
      setTimeout(() => ($changeShortcut.textContent = "Change shortcut"), 1800);
    } catch {}
  }
});

init();
