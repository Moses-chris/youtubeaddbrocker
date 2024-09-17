(function() {
  let enabled = true;

  function removeAds() {
    if (!enabled) return;

    const adSelectors = [
      '.ad-showing',
      '.ytp-ad-module',
      '.video-ads',
      '.ytp-ad-overlay-container',
      'div[id^="ad_creative_"]',
      '#player-ads',
      '.ytd-video-masthead-ad-v3-renderer',
      '.ytd-banner-promo-renderer',
      'ytd-display-ad-renderer',
      'ytd-statement-banner-renderer',
      'ytd-in-feed-ad-layout-renderer'
    ];

    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    const skipButton = document.querySelector('.ytp-ad-skip-button');
    if (skipButton) skipButton.click();

    const video = document.querySelector('video');
    if (video && document.querySelector('.ad-showing')) {
      video.currentTime = video.duration;
    }
  }

  function injectScript(file) {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL(file));
    document.head.appendChild(script);
  }

  function observePageChanges() {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          removeAds();
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    enabled = response.enabled;
    if (enabled) {
      injectScript('injected.js');
      removeAds();
      observePageChanges();
      setInterval(removeAds, 1000);
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "stateChanged") {
      enabled = request.enabled;
    }
  });
})();