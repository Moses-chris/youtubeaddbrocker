chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });

  // Set up declarativeNetRequest rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],  // Remove any existing rule with ID 1
    addRules: [{
      id: 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "*googlevideo.com/videoplayback*&adformat=*",
        resourceTypes: ["xmlhttprequest"]
      }
    }]
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