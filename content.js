(function() {
    let enabled = true;
  
    function removeAds() {
      if (!enabled) return;
  
      const adElements = document.querySelectorAll('.ad-showing, .ytp-ad-module, .video-ads');
      adElements.forEach(ad => ad.style.display = 'none');
  
      const skipButton = document.querySelector('.ytp-ad-skip-button');
      if (skipButton) skipButton.click();
  
      const playerAds = document.querySelector('#player-ads');
      if (playerAds) playerAds.style.display = 'none';
    }
  
    function injectScript(file) {
      const script = document.createElement('script');
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', chrome.runtime.getURL(file));
      document.head.appendChild(script);
    }
  
    chrome.runtime.sendMessage({ action: "getState" }, (response) => {
      enabled = response.enabled;
      if (enabled) {
        injectScript('injected.js');
        const observer = new MutationObserver(removeAds);
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "stateChanged") {
        enabled = request.enabled;
      }
    });
  })();