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
      'ytd-in-feed-ad-layout-renderer',
      'ytd-ad-slot-renderer',
      'ytd-promoted-video-renderer',
      '.ytd-watch-next-secondary-results-renderer.sparkles-light-cta',
      '.ytd-merch-shelf-renderer',
      'ytd-compact-promoted-video-renderer',
      '.ytd-primetime-promo-renderer'
    ];

    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Handle dynamic ad insertions
    const handleAdInsertions = () => {
      const adElement = document.querySelector('.ad-showing');
      if (adElement) {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = video.duration;
        }
      }

      const skipButton = document.querySelector('.ytp-ad-skip-button');
      if (skipButton) {
        skipButton.click();
      }
    };

    // Run handleAdInsertions every 500ms
    setInterval(handleAdInsertions, 500);
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
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "stateChanged") {
      enabled = request.enabled;
      if (enabled) {
        removeAds();
        observePageChanges();
      }
    }
  });
})();