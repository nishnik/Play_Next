(function(document) {
    "use strict";
    var s = document.createElement("script");
    s.src = chrome.extension.getURL("src/inject/main.js");
    s.onload = function() {
        this.parentNode.removeChild(this);
        s = undefined
    };
    document.documentElement.appendChild(s)
})(window.document);

var queue = [];
var tabId;
var save_address = 'songs_queue';
chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
    tabId = res.tabId;
    console.log(tabId);
    save_address = save_address.concat(tabId.toString());
    if (localStorage.getItem(save_address) != null) {
        queue = JSON.parse(localStorage[save_address]);
    }
    // TODO: Add code to delete previous unused data
    // for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    //   console.log(localStorage.key(i).substring(0,11));
    // }
    console.log(save_address, "from sendMessage", queue);
    // At the very start add the buttons
    insertButton();
});


function insertButton() {
    var buttons = document.querySelectorAll('p[class="button play-next"]');
    if (buttons.length == 0) {
        var download_links = document.querySelectorAll('a[class=" content-link spf-link  yt-uix-sessionlink      spf-link "]');
        if(download_links.length){
            for (var i = 0; i < download_links.length; i++) {
                var link = download_links[i];
                var p = document.createElement('p');
                p.innerHTML = '<a href="#"><i>Play Next</i></a>';
                p.className = "button play-next";
                link.parentElement.insertAdjacentElement('afterbegin',p);
                p.dataset.name = link.href;
                p.querySelector('a').addEventListener('click',clickHandler,true);
            }
        }
    }
    sendLink();
}

function insertPlayInfo() {
    if (window.queue.length > 0) {
        tmp = 'p[data-name="';
        tmp = tmp.concat(window.queue[0]);
        tmp = tmp.concat('"');
        var next_song = document.querySelectorAll(tmp);
        if (next_song.length > 0) {
            console.log(next_song);
            next_song[0].innerHTML = '<a href="#" style="color: blue"><i>Playing Next</i></a>';
        }
        for (var i = 1; i < window.queue.length; ++i) {
            tmp = 'p[data-name="';
            tmp = tmp.concat(window.queue[i]);
            tmp = tmp.concat('"');
            var que_song = document.querySelectorAll(tmp);
            if (que_song.length > 0) {
                var tmp = '<a href="" style="color: blue"><i>In Queue at #';
                tmp = tmp.concat(i.toString(), '</i></a>');
                que_song[0].innerHTML = tmp;
            }      
        }
    }
}


function clickHandler(e){
    window.queue.push(this.parentNode.dataset.name);
    sendLink();
}

function sendLink() {
    if (queue.length > 0) {
        var codeToPush = `var link = "${ window.queue[0] }";`;
        console.log("sendLink", codeToPush);
        var script = document.createElement('script');
        script.textContent = codeToPush;
        document.documentElement.appendChild(script);
        script.remove();
    }
    insertPlayInfo();
}



// YouTube is lesser prone to disturbances than sadness
window.addEventListener("message", function(event) {
  // Only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    insertButton();
    console.log(window.queue);
    if (event.data.text == "pop") {
        window.queue.shift();
        console.log("Removed");
        if (queue.length > 0) {
            console.log(save_address);
            localStorage[save_address] = JSON.stringify(window.queue);
            console.log("Written");
        }    
    }
  }
}, false);

// Delete the queue if tab is closed
// But this code creates alert
// window.onbeforeunload = function() 
// {
//     chrome.storage.local.clear();
//     console.log("deleted");
//     return '';
// };