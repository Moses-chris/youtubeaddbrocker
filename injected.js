(function() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (typeof args[0] === 'string' && args[0].includes('youtubei/v1/player')) {
        return originalFetch.apply(this, args).then(response => 
          response.json().then(data => {
            if (data.adPlacements) {
              data.adPlacements = [];
            }
            if (data.playerAds) {
              data.playerAds = [];
            }
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          })
        );
      }
      return originalFetch.apply(this, args);
    };
  })();