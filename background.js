// establish whether the controls are hidden or not
var controlsHidden = false;

chrome.commands.onCommand.addListener(function(command) {
  // if the user invokes the "hide" command...
  if (command === "hide") {
    // get information about the current tab...
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tabUrl = tabs[0].url;
      // and establish whether or not they are on YouTube.
      var onYT = tabUrl.includes("youtube.com/watch?v");

      // if the user is watching a YouTube video...
      if (onYT === true) {
        // and if the controls are not already hidden...
        if (controlsHidden === false) {
          // run the 'app.js' script.
          chrome.tabs.executeScript({
            file: 'app.js'
          });

          // change controls to hidden
          controlsHidden = true;
        }

        else {
          // show the controls again
          /* either re-work and use jQuery for .hide() and .show()
          but if it doesn't work just add the code everyime */
        }
      }
    });
  }
});