(() => {
  const STYLE_ID = "hyde-style-tag";

  // Selectors chosen based on years of YouTube UI churn + user reviews:
  // covers standard player, live streams, fullscreen quick actions, watermark,
  // endscreen cards, watch-later/share buttons, pause overlay, and the bezel
  // flash that appears when pressing space.
  // YouTube runs constant A/B experiments and renames classes per region/bucket
  // (e.g. "ytp-large-play-button" → "ytp-delhi-large-play-button"). Rather than
  // chase every rename, we target CLASS SUBSTRINGS scoped inside .html5-video-player.
  // This catches current + future variants as long as YT keeps their "ytp-<family>-*"
  // convention. All rules keep the video element and captions visible.
  const HIDE_CSS = `
    /* top / bottom chrome, gradients, progress + scrubber + heat map */
    .html5-video-player [class*="ytp-chrome"],
    .html5-video-player [class*="ytp-gradient"],
    .html5-video-player [class*="ytp-progress"],
    .html5-video-player [class*="ytp-scrubber"],
    .html5-video-player [class*="ytp-heat-map"],
    .html5-video-player [class*="ytp-fine-scrubbing"],
    .html5-video-player [class*="ytp-timed-markers"],
    .html5-video-player [class*="ytp-chapters"],
    .html5-video-player [class*="ytp-clip-start"],
    .html5-video-player [class*="ytp-clip-end"],

    /* center-of-screen overlays (big play, pause overlay, cued thumb,
       doubletap ripple, space-bar bezel flash, speed-hold "2x", seek jumps) */
    .html5-video-player [class*="ytp-large-play"],
    .html5-video-player [class*="ytp-pause-overlay"],
    .html5-video-player [class*="ytp-cued-thumbnail"],
    .html5-video-player [class*="ytp-doubletap"],
    .html5-video-player [class*="ytp-bezel"],
    .html5-video-player [class*="ytp-speedmaster"],
    .html5-video-player [class*="ytp-seek-overlay"],
    .html5-video-player [class*="ytp-storyboard-framepreview"],
    .html5-video-player [class*="ytp-spinner-message"],

    /* title, time, live badge */
    .html5-video-player [class*="ytp-title"],
    .html5-video-player [class*="ytp-time-display"],
    .html5-video-player [class*="ytp-live-badge"],

    /* top-right buttons (share, copy link, info/shopping cards, overflow) */
    .html5-video-player [class*="ytp-copylink"],
    .html5-video-player [class*="ytp-watch-later"],
    .html5-video-player [class*="ytp-share-button"],
    .html5-video-player [class*="ytp-cards-button"],
    .html5-video-player [class*="ytp-cards-teaser"],
    .html5-video-player [class*="ytp-overflow-button"],

    /* watermark / channel branding / annotations */
    .html5-video-player [class*="ytp-watermark"],
    .html5-video-player [class*="branding-img"],
    .html5-video-player .iv-branding,
    .html5-video-player .iv-drawer,
    .html5-video-player .annotation,
    .html5-video-player [class*="ytp-iv-video-content"],

    /* fullscreen extras: quick-action rail (like/dislike/comment/share/Ask),
       fullscreen metadata top-left, end-of-video video-wall grid */
    .html5-video-player [class*="ytp-fullscreen"],
    .html5-video-player yt-player-quick-action-buttons,
    .html5-video-player [class*="ytPlayerQuickActionButtons"],
    .html5-video-player [class*="videowall"],
    .html5-video-player [class*="ytp-suggestion-set"],

    /* end-of-video cards + autoplay up-next countdown */
    .html5-video-player [class*="ytp-ce-"],
    .html5-video-player [class*="ytp-endscreen"],
    .html5-video-player [class*="ytp-autonav-endscreen"],
    .html5-video-player .html5-endscreen,

    /* promoted / shopping / paid / gated / timely overlays */
    .html5-video-player [class*="ytp-suggested-action"],
    .html5-video-player [class*="ytp-featured-product"],
    .html5-video-player [class*="ytp-timely-actions"],
    .html5-video-player [class*="ytp-paid-content"],
    .html5-video-player [class*="ytp-gated-actions"],

    /* misc: tooltips, hover preview, cast/remote status, mdx dialogs */
    .html5-video-player [class*="ytp-tooltip"],
    .html5-video-player [class*="ytp-preview"],
    .html5-video-player [class*="ytp-multicam"],
    .html5-video-player [class*="ytp-info-panel"],
    .html5-video-player [class*="ytp-mdx-popup"],
    .html5-video-player [class*="ytp-remote"] {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Keep captions readable when hyde is on — users toggling for
       clean-screenshot use can turn captions off in the player. */
    .html5-video-player .caption-window,
    .html5-video-player [class*="caption-window"],
    .html5-video-player .ytp-caption-segment {
      opacity: 1 !important;
    }

    /* Restore default cursor so users can still click the video to pause/play. */
    .html5-video-player video {
      cursor: default !important;
    }
  `;

  let hidden = false;
  let lastToggleAt = 0;
  const TOGGLE_DEBOUNCE_MS = 300;

  function apply() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = HIDE_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function remove() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  function setHidden(v) {
    hidden = !!v;
    if (hidden) apply();
    else remove();
  }

  // Debounced toggle used by BOTH the keydown listener and the background
  // "hyde:toggle" message. Prevents a double-flip when a user has bound
  // Ctrl+M via chrome://extensions/shortcuts AND our keydown handler both fire.
  function toggle() {
    const now = Date.now();
    if (now - lastToggleAt < TOGGLE_DEBOUNCE_MS) return;
    lastToggleAt = now;
    setHidden(!hidden);
  }

  // Direct keydown fallback: works even when Chrome's suggested_key is unset
  // (Brave/Edge/Vivaldi tab-mute conflicts, dev reloads, prior user overrides).
  // Uses capture: true so we run before page listeners.
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat) return;
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.shiftKey || e.altKey) return;
      const k = (e.key || "").toLowerCase();
      if (k !== "m") return;
      toggle();
    },
    true
  );

  // Ensure the style survives SPA rebuilds: YouTube sometimes wipes head
  // during navigation. Re-attach if it goes missing while hidden === true.
  const mo = new MutationObserver(() => {
    if (hidden && !document.getElementById(STYLE_ID)) apply();
  });
  const startObserver = () => {
    if (document.documentElement) {
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || typeof msg.type !== "string") return;
    if (msg.type === "hyde:get") {
      sendResponse({ hidden });
      return;
    }
    if (msg.type === "hyde:toggle") {
      toggle();
      sendResponse({ hidden });
      return;
    }
    if (msg.type === "hyde:set") {
      setHidden(msg.hidden);
      sendResponse({ hidden });
      return;
    }
  });
})();
