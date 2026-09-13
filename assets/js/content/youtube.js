(() => {
  const CONTAINER_SELECTORS = [
    "#above-the-fold #top-level-buttons-computed",
    "ytd-watch-metadata #top-level-buttons-computed",
    "#top-level-buttons-computed"
  ];

  function findVisibleContainer() {
    for (const selector of CONTAINER_SELECTORS) {
      const candidates = document.querySelectorAll(selector);
      for (const el of candidates) {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) return el;
      }
    }
    return null;
  }

  function waitForContainer(signal) {
    const existing = findVisibleContainer();
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const found = findVisibleContainer();
        if (!found) return;
        observer.disconnect();
        resolve(found);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      signal.addEventListener("abort", () => {
        observer.disconnect();
        resolve(null);
      }, { once: true });
    });
  }

  let currentAbort = null;
  let currentVideoId = null;

  async function injectForCurrentVideo() {
    const videoId = new URLSearchParams(location.search).get("v");
    if (videoId === currentVideoId) return; // то же видео — не переинжектим
    currentVideoId = videoId;
    if (!videoId) return;

    currentAbort?.abort();
    currentAbort = new AbortController();
    const signal = currentAbort.signal;

    document.getElementById("ytdl-shadow-host")?.remove();

    const container = await waitForContainer(signal);
    if (!container || signal.aborted) return;

    window.YTDL.mountDownloadButton(container, { prepend: true });
  }

  document.addEventListener("yt-navigate-finish", injectForCurrentVideo);
  new MutationObserver(injectForCurrentVideo).observe(document.body, { childList: true, subtree: true });
  injectForCurrentVideo();
})();