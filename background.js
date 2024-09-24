chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });

  // Set up declarativeNetRequest rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4, 5, 6, 7, 8],  // Remove any existing rules
    addRules: [
      {
        id: 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "*googlevideo.com/videoplayback*&adformat=*",
          resourceTypes: ["xmlhttprequest"]
        }
      },
      {
        id: 2,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||youtube.com/get_video_info",
          resourceTypes: ["xmlhttprequest"]
        }
      },
      {
        id: 3,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||youtube.com/api/stats/ads",
          resourceTypes: ["xmlhttprequest"]
        }
      },
      {
        id: 4,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||doubleclick.net/*",
          resourceTypes: ["script", "image", "xmlhttprequest", "sub_frame"]
        }
      },
      {
        id: 5,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||googlesyndication.com/*",
          resourceTypes: ["script", "image", "xmlhttprequest", "sub_frame"]
        }
      },
      {
        id: 6,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||youtube.com/pagead/*",
          resourceTypes: ["script", "xmlhttprequest"]
        }
      },
      {
        id: 7,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||youtube.com/ptracking",
          resourceTypes: ["xmlhttprequest"]
        }
      },
      {
        id: 8,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "||youtube.com/api/stats/qoe",
          resourceTypes: ["xmlhttprequest"]
        }
      }
    ]
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    chrome.storage.local.get("enabled", (data) => {
      sendResponse({ enabled: data.enabled });
    });
    return true;
  } else if (request.action === "toggleState") {
    chrome.storage.local.get("enabled", (data) => {
      const newState = !data.enabled;
      chrome.storage.local.set({ enabled: newState });
      sendResponse({ enabled: newState });

      // Enable or disable the declarativeNetRequest rule based on the new state
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: newState ? ["ruleset_1"] : [],
        disableRulesetIds: newState ? [] : ["ruleset_1"]
      });
    });
    return true;
  }
});