(function() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (typeof args[0] === 'string') {
      if (args[0].includes('youtubei/v1/player') || args[0].includes('youtubei/v1/next')) {
        return originalFetch.apply(this, args).then(response => 
          response.clone().json().then(data => {
            if (data.adPlacements) data.adPlacements = [];
            if (data.playerAds) data.playerAds = [];
            if (data.adSlots) data.adSlots = [];
            if (data.adBreakHeartbeatParams) data.adBreakHeartbeatParams = undefined;
            if (data.adBreakParams) data.adBreakParams = undefined;
            
            if (data.streamingData && data.streamingData.adBreakTimings) {
              data.streamingData.adBreakTimings = [];
            }

            if (data.videoDetails) {
              data.videoDetails.allowedToBeEmbed = true;
              data.videoDetails.isPrivate = false;
              data.videoDetails.isUnpluggedCorpus = false;
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