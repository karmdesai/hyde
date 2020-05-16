// when the extension is installed or upgraded...
chrome.runtime.onInstalled.addListener(function() {
    // replace all rules...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      // with a new rule...
      chrome.declarativeContent.onPageChanged.addRules([
        {
          // that fires when a page's URL contains 'youtube.com/watch?v'...
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { urlContains: 'youtube.com/watch?v' },
            })
          ],
          // and shows the extension's page action.
          actions: [ new chrome.declarativeContent.ShowPageAction() ]
        }
      ]);
    });
});