let button = document.querySelector('#getUsage')

// Now that the library has run we will change the DOM to be compatible with CSP.
button.onclick = function() { 
    //create the download tab
    chrome.tabs.create({url: './downloader/index.html'})
};