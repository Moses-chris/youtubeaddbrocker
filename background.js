chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
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
      });
      return true;
    }
  });