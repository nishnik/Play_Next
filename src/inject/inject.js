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

var to_match = 'a[class="';
var LOC_HREF = 0;
if (document.location.href == "https://www.youtube.com/") {
    to_match = to_match.concat(" yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
    LOC_HREF = 1;
}
else if (document.location.href.substring(0, 29) == "https://www.youtube.com/watch") {
    to_match = to_match.concat(" content-link spf-link  yt-uix-sessionlink      spf-link ", '"]');
    LOC_HREF = 2;
}
else if (document.location.href.substring(0, 31) == "https://www.youtube.com/results") {
    to_match = to_match.concat("yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
    LOC_HREF = 3;
}

var queue = [];
var save_address = 'songs_queue';
if (localStorage.getItem(save_address) != null) {
    queue = JSON.parse(localStorage[save_address]);
}

// At the very start add the buttons
insertButton();


function insertButton() {
    var buttons = document.querySelectorAll('p[class="button play-next"]');
    var download_links = document.querySelectorAll(to_match);
    if(download_links.length != buttons.length){
        for (var i = download_links.length-1; i >=buttons.length ; --i) {
            var link = download_links[i];
            var p = document.createElement('p');
            p.innerHTML = '<a><i>Play Next</i></a>';
            p.className = "button play-next";
            link.parentElement.insertAdjacentElement('afterbegin',p);
            p.dataset.name = link.href;
            if (LOC_HREF == 2)
                p.dataset.song_name = link.querySelectorAll('span[class="title"]')[0].innerText;
            if (LOC_HREF == 1)
                p.dataset.song_name = link.innerText;
            p.querySelector('a').addEventListener('click',clickHandler,true);
        }
    }
    sendLink();
}

function insertPlayInfo() { // only called by sendLink
    if (window.queue.length > 0) {
        tmp = 'p[data-name="';
        tmp = tmp.concat(window.queue[0][0]);
        tmp = tmp.concat('"');
        var next_song = document.querySelectorAll(tmp);
        if (next_song.length > 0) {
            next_song[0].innerHTML = '<a style="color: blue"><i>Playing Next</i></a>';
        }
        for (var i = 1; i < window.queue.length; ++i) {
            tmp = 'p[data-name="';
            tmp = tmp.concat(window.queue[i][0]);
            tmp = tmp.concat('"');
            var que_song = document.querySelectorAll(tmp);
            if (que_song.length > 0) {
                var tmp = '<a style="color: blue"><i>In Queue at #';
                tmp = tmp.concat((i+1).toString(), '</i></a>');
                que_song[0].innerHTML = tmp;
            }      
        }
    }
}


function clickHandler(e){
    // update queue
    if (localStorage.getItem(save_address) != null) {
        queue = JSON.parse(localStorage[save_address]);
    }
    window.queue.push([this.parentNode.dataset.name, this.parentNode.dataset.song_name]);
    localStorage[save_address] = JSON.stringify(window.queue);
    sendLink();
}

function sendLink() {
    if (queue.length > 0) {
        var codeToPush = `var link = "${ window.queue[0][0] }";`;
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
    if (localStorage.getItem(save_address) != null) {
        queue = JSON.parse(localStorage[save_address]);
    }
    insertButton();
    console.log(window.queue);
    console.log(event.data.text);
    if (event.data.text == "pop") {
        window.queue.shift();
        localStorage[save_address] = JSON.stringify(window.queue);
    }
  }
}, false);


// tmp();
// function tmp() {
//     console.log("in tmp())");
// var tabId;
// chrome.extension.sendMessage({ type: 'getTabId' }, function(res) {
//     tabId = res.tabId;
//     console.log(tabId);
// });
// }

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }

    // Collect the necessary data 
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`)
    var domInfo = JSON.stringify(window.queue);

    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
});
