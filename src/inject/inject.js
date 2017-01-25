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
if (document.location.href == "https://www.youtube.com/") {
    to_match = to_match.concat(" yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
}
else if (document.location.href.substring(0, 29) == "https://www.youtube.com/watch") {
    to_match = to_match.concat(" content-link spf-link  yt-uix-sessionlink      spf-link ", '"]');
}
else if (document.location.href.substring(0, 31) == "https://www.youtube.com/results") {
    to_match = to_match.concat("yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
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
        // TODO: check if we iterate in reverse manner, can we exit the loop soon (only one check)
        for (var i = 0; i < download_links.length; ++i) {
            var link = download_links[i];
            var to_insert = true;
            for (var j = 0; j < buttons.length; ++i) {
                var button = buttons[j];
                if (button.dataset.name == link.href) {
                    to_insert = false;
                    break;
                }
            }
            if (to_insert == false)
                continue;
            var p = document.createElement('p');
            p.innerHTML = '<a href="#"><i>Play Next</i></a>';
            p.className = "button play-next";
            link.parentElement.insertAdjacentElement('afterbegin',p);
            p.dataset.name = link.href;
            p.querySelector('a').addEventListener('click',clickHandler,true);
        }
    }
    sendLink();
}

function insertPlayInfo() { // only called by sendLink
    if (window.queue.length > 0) {
        tmp = 'p[data-name="';
        tmp = tmp.concat(window.queue[0]);
        tmp = tmp.concat('"');
        var next_song = document.querySelectorAll(tmp);
        if (next_song.length > 0) {
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
    // update queue
    if (localStorage.getItem(save_address) != null) {
        queue = JSON.parse(localStorage[save_address]);
    }
    window.queue.push(this.parentNode.dataset.name);
    localStorage[save_address] = JSON.stringify(window.queue);
    sendLink();
}

function sendLink() {
    if (queue.length > 0) {
        var codeToPush = `var link = "${ window.queue[0] }";`;
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
    if (event.data.text == "pop") {
        window.queue.shift();
        localStorage[save_address] = JSON.stringify(window.queue);
    }
  }
}, false);
