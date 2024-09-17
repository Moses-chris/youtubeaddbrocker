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