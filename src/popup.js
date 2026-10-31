const YT_HOST_RE = /(^|\.)youtube(-nocookie)?\.com$/i;

function isYouTubeVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
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

const $toggle = document.getElementById("toggle");
const $statusText = document.getElementById("statusText");
const $toggleCard = document.getElementById("toggleCard");
const $notYtCard = document.getElementById("notYtCard");
const $shortcutText = document.getElementById("shortcutText");
const $changeShortcut = document.getElementById("changeShortcut");
const $version = document.getElementById("version");

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
      $changeShortcut.textContent = "Change shortcut";
    } else {
      $shortcutText.textContent = "none";
      $shortcutText.classList.add("unset");
      $changeShortcut.textContent = "Set shortcut";
    }
  } catch {
    $shortcutText.textContent = "none";
  }
}

async function sendToTab(tabId, msg) {
  try {
    return await chrome.tabs.sendMessage(tabId, msg, { frameId: 0 });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      files: ["src/content.js"],
    });
    return await chrome.tabs.sendMessage(tabId, msg, { frameId: 0 });
  }
}

function showReloadNote() {
  $notYtCard.hidden = false;
  $notYtCard.querySelector(".row-title").textContent = "Reload this tab";
  $notYtCard.querySelector(".row-sub").textContent =
    "This video was open before hyde updated. Reload it to apply.";
}

async function init() {
  $version.textContent = "v" + (chrome.runtime.getManifest().version || "");

  loadShortcut();

  const { hidden = false } = await chrome.storage.local.get({ hidden: false });
  applyState(hidden);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes.hidden) return;
    applyState(!!changes.hidden.newValue);
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const onVideo = !!(tab && isYouTubeVideoUrl(tab.url));

  if (onVideo) {
    try {
      await sendToTab(tab.id, { type: "hyde:ping" });
    } catch {
      showReloadNote();
    }
  }

  $toggle.addEventListener("change", async () => {
    const next = $toggle.checked;
    try {
      await chrome.storage.local.set({ hidden: next });
    } catch {
      applyState(!next);
      return;
    }
    if (!onVideo) return;
    try {
      await sendToTab(tab.id, { type: "hyde:ping" });
    } catch {
      showReloadNote();
    }
  });
}

function applyState(hidden) {
  $toggle.checked = !!hidden;
  $statusText.textContent = hidden ? "on · all tabs" : "off · all tabs";
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
      const label = $shortcutText.classList.contains("unset")
        ? "Set shortcut"
        : "Change shortcut";
      $changeShortcut.textContent = "Copied " + url;
      setTimeout(() => ($changeShortcut.textContent = label), 1800);
    } catch {}
  }
});

init();
