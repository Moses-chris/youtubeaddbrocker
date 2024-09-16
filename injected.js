(function() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[0].includes('player')) {
        const modifiedUrl = args[0].replace(/&adformat=.*&/, '&');
        args[0] = modifiedUrl;
      }
      return originalFetch.apply(this, args);
    };
  
    function setupObserver() {
      const observer = new MutationObserver(() => {
        const adOverlay = document.querySelector('.ytp-ad-overlay-container');
        if (adOverlay) adOverlay.style.display = 'none';
  
        const skipButton = document.querySelector('.ytp-ad-skip-button');
        if (skipButton) skipButton.click();
      });
  
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        console.warn('Document body not found. Retrying in 100ms.');
        setTimeout(setupObserver, 100);
      }
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
      setupObserver();
    }
  })();