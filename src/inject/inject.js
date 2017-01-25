(function(document) {
    "use strict";
    var s = document.createElement("script");
    s.src = chrome.extension.getURL("src/inject/main.js");
    s.onload = function() {
        this.parentNode.removeChild(this);
        s = undefined
    };
    console.log("Added script");
    document.documentElement.appendChild(s)
})(window.document);

var queue = [];

function insertButton() {
    console.log("insertButton act");
    var buttons = document.querySelectorAll('p[class="button play-next"]');
    console.log(buttons.length);
    if (buttons.length == 0) {
        var download_links = document.querySelectorAll('a[class=" content-link spf-link  yt-uix-sessionlink      spf-link "]');
        console.log(download_links.length);
        if(download_links.length){
        	for (var i = 0; i < download_links.length; i++) {
        		var link = download_links[i];
        		var p = document.createElement('p');
        			p.innerHTML = '<a href="#">Play Next</a>';
        			p.className = "button play-next";
        			link.parentElement.insertAdjacentElement('afterbegin',p);
        			p.dataset.name = link.href;
        			p.querySelector('a').addEventListener('click',clickHandler,true);
        	}
        }
    }
}

function clickHandler(e){
    window.queue.push(this.parentNode.dataset.name);
    var codeToPush = `var queue = "${ window.queue }";`;
    console.log(codeToPush);
    var script = document.createElement('script');
    script.textContent = actualCode;
    document.documentElement.appendChild(script);
    script.remove();
}
// At the very start add the buttons
insertButton();

var port = chrome.runtime.connect();

// YouTube is lesser prone to disturbances than sadness
window.addEventListener("message", function(event) {
  // Only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    insertButton();
    console.log(window.queue);
    console.log("Content script received: " + event.data.text);
    if (event.data.text == "0") {
        window.open(link,"_self");
    }
  }
}, false);