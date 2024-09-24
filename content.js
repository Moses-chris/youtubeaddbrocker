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
        if (video && isFinite(video.duration)) {
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

(function() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (typeof args[0] === 'string') {
      if (args[0].includes('youtubei/v1/player') || args[0].includes('youtubei/v1/next')) {
        return originalFetch.apply(this, args).then(response => 
          response.clone().json().then(data => {
            // Remove all ad-related data
            const removeAdsRecursively = (obj) => {
              if (Array.isArray(obj)) {
                return obj.map(removeAdsRecursively).filter(item => item !== null);
              } else if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                  if (key.toLowerCase().includes('ad') || key.toLowerCase().includes('sponsor')) {
                    delete obj[key];
                  } else {
                    obj[key] = removeAdsRecursively(obj[key]);
                  }
                });
              }
              return obj;
            };

            data = removeAdsRecursively(data);

            // Ensure video plays without ads
            if (data.videoDetails) {
              data.videoDetails.isLiveContent = false;
            }

            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          })
        );
      }
    }
    return originalFetch.apply(this, args);
  };

  // Override XMLHttpRequest
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;
  
  XHR.open = function(method, url) {
    this.url = url;
    return open.apply(this, arguments);
  };
  
  XHR.send = function(body) {
    if (this.url.includes('/ad_') || this.url.includes('doubleclick.net') || this.url.includes('googlesyndication.com')) {
      console.log('Blocked ad request:', this.url);
      this.abort();
    } else {
      send.apply(this, arguments);
    }
  };
})();