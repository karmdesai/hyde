function checkForValidUrl(tabId, changeInfo, tab) {
    var tabUrl = tab.url;
    var onYT = tabUrl.includes("youtube.com");

    // if the user is on YouTube
    if (onYT === true) {
        // show the page action
        chrome.pageAction.show(tabId);
    }
};

// listen for any changes to the URL of any tab
chrome.tabs.onUpdated.addListener(checkForValidUrl);