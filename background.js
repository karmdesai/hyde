chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var tabUrl = changeInfo.url;

    try {
        var onYT = tabUrl.includes("youtube.com/watch?v");
    }

    catch(err) {
        console.log(err);
    }

    if (onYT === true) {
        alert(tabUrl);

        // start logic
        var s = document.getElementById('stylehidecontrols'); 

        if (s) {
            s.remove();
        } 
        
        else { 
            s = document.createElement('style'); 
            s.id = 'stylehidecontrols'; 
            var r = '#movie_player .ytp-gradient-top, #movie_player .ytp-chrome-top, #movie_player .ytp-progress-bar-container, #movie_player .ytp-chrome-controls{display:none !important}, #movie_player .ytp-gradient-bottom'; 
            s.appendChild(document.createTextNode(r)); 
            document.body.appendChild(s);
        }

        removeElementsByClass('ytp-gradient-bottom');
        
        void 0;
        // end logic
    }
})

function removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);

    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}