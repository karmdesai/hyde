// establish whether the controls are hidden or not
let controlsHidden = false;

chrome.commands.onCommand.addListener(function(command) {
  // if the user invokes the "hide" command...
  if (command === "hide") {
    // get information about the current tab...
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tabUrl = tabs[0].url;
      // and establish whether or not they are on YouTube.
      var onYT = tabUrl.includes("youtube.com/watch?");

      // if the user is watching a YouTube video...
      if (onYT === true) {
        // and if the controls are not already hidden...
        if (controlsHidden === false) {
          // run the 'hide.js' script.
          console.log('hyde - hiding the controls');
          chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['src/hide.js']
          });

          // change controls to hidden
          controlsHidden = true;
        }

        // if the controls are already hidden...
        else {
          // run the 'show.js' script.
          console.log('hyde - showing the controls');
          chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['src/show.js']
          });

          // change controls to not hidden
          controlsHidden = false;
        }
      }
    });
  }
});
