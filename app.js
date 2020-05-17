// taken from: https://stackoverflow.com/questions/4777077/removing-elements-by-class-name
function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

// remove the elements that are on the YouTube video player
removeElementsByClass("ytp-chrome-top");
removeElementsByClass("ytp-gradient-top");
removeElementsByClass("ytp-gradient-bottom");
removeElementsByClass("ytp-chrome-controls");
removeElementsByClass("ytp-progress-bar-container");