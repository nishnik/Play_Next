function insert_main() {
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
}

var queue = [];
var save_address = 'songs_queue';
if (localStorage.getItem(save_address) != null) {
    queue = JSON.parse(localStorage[save_address]);
}
insert_main();
// At the very start add the buttons
insertButton();

function insertButton(refresh = false) {
    var to_match = 'a[class="';
    var PAGE_TYPE = 0;
    if (document.location.href == "https://www.youtube.com/") {
        to_match = to_match.concat(" yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
        PAGE_TYPE = 1;
    }
    else if (document.location.href.substring(0, 29) == "https://www.youtube.com/watch") {
        to_match = to_match.concat(" content-link spf-link  yt-uix-sessionlink      spf-link ", '"]');
        PAGE_TYPE = 2;
    }
    else if (document.location.href.substring(0, 31) == "https://www.youtube.com/results") {
        to_match = to_match.concat("yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
        PAGE_TYPE = 1;
    }
    else if (document.location.href == "https://www.youtube.com/feed/trending") {
        to_match = to_match.concat("yt-uix-tile-link yt-ui-ellipsis yt-ui-ellipsis-2 yt-uix-sessionlink      spf-link ", '"]');
        PAGE_TYPE = 1;
    }
    else if (document.location.href.substring(0, 31) == "https://www.youtube.com/channel") {
        to_match = to_match.concat("yt-uix-sessionlink yt-uix-tile-link  spf-link  yt-ui-ellipsis yt-ui-ellipsis-2", '"]');
        PAGE_TYPE = 1;
    }
    var buttons = document.querySelectorAll('p[class="button play-next"]');
    var download_links = document.querySelectorAll(to_match);
    // we don't need to add buttons if already added or if we don't refresh
    if(download_links.length != buttons.length || refresh){
        var refresh_till = buttons.length;
        if (refresh)
            refresh_till = 0;
        for (var i = download_links.length-1; i >=refresh_till ; --i) {
            var link = download_links[i];
            var p = document.createElement('p');
            p.innerHTML = '<a><span class="play-next-button">Play Next</span></a>';
            p.className = "button play-next";
            p.querySelector('a').addEventListener('click',clickHandler,true);
            p.dataset.inQueue = "0";
            p.dataset.name = link.href;
            if (PAGE_TYPE == 2)
                p.dataset.song_name = link.querySelectorAll('span[class="title"]')[0].innerText;
            else if (PAGE_TYPE == 1)
                p.dataset.song_name = link.innerText;
            if (refresh)
                link.parentElement.querySelector("p").remove();
            link.parentElement.insertAdjacentElement('afterbegin',p);

        }
    }
    insertPlayInfo();
}

function insertPlayInfo() {
    if (window.queue.length > 0) {
        tmp = 'p[data-name="';
        tmp = tmp.concat(window.queue[0][0]);
        tmp = tmp.concat('"');
        var next_song = document.querySelectorAll(tmp);
        if (next_song.length > 0) {
            next_song[0].innerHTML = '<a><span class="playing-next-button">Playing Next</span></a>';
            next_song[0].dataset.inQueue = "1";
            next_song[0].querySelector('a').addEventListener('click',clickHandler,true);
        }
        for (var i = 1; i < window.queue.length; ++i) {
            tmp = 'p[data-name="';
            tmp = tmp.concat(window.queue[i][0]);
            tmp = tmp.concat('"');
            var que_song = document.querySelectorAll(tmp);
            if (que_song.length > 0) {
                var tmp = '<a><span class="playing-next-button">In Queue at #';
                tmp = tmp.concat((i+1).toString(), '</span></a>');
                que_song[0].innerHTML = tmp;
                que_song[0].dataset.inQueue = "1";
                que_song[0].querySelector('a').addEventListener('click',clickHandler,true);
            }
        }
        // TODO: change the next button icon
        // var next_button = document.querySelectorAll('a[class="ytp-next-button ytp-button"]');
        // if (next_button.length > 0) {
        //     console.log(next_button);
        //         console.log("hello")
        //         next_button[0].dataset.preview = "https://i.ytimg.com/vi/" + window.queue[0][0].substring(30) + "/hqdefault.jpg?custom=true&w=320&h=180&stc=true&jpg444=true&jpgq=90&sp=68&sigh=NZZP4Vcuwk4EsQsZgP-YAPOp0nM";
        //         next_button[0].href = window.queue[0][0];
        // }
    }
}


function clickHandler(e){
    // update queue
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    if (window.queue.length == 0) {
        console.log("case 0");
        window.queue.push([this.parentNode.dataset.name, this.parentNode.dataset.song_name]);
    }
    else if (this.parentNode.dataset.inQueue == "0") {
        console.log("case 1");
        window.queue.push([this.parentNode.dataset.name, this.parentNode.dataset.song_name]);
    }
    else {
        console.log("case 2");
        var i = 0;
        for (i = 0; i < window.queue.length; ++i) {
            if (window.queue[i][0] == this.parentNode.dataset.name)
                break;
        }
        console.log(window.queue, i);
        window.queue.splice(i, 1);
        console.log(window.queue);
        this.parentNode.dataset.inQueue = "0";
        // small hack. TODO: fix this
        this.parentNode.innerHTML = '<a class="add_event_hack"><span class="play-next-button">Play Next</span></a>';
        var tmp = document.getElementsByClassName("add_event_hack");
        for (var i = 0; i < tmp.length; ++i) {
            tmp[i].addEventListener('click', clickHandler, false);
        }
    }
    localStorage[save_address] = JSON.stringify(window.queue);
    insertPlayInfo();
}

function writeToDOM() {
    var domInfo = " ";
    for (var i = 0; i < window.queue.length; ++i) {
        domInfo = domInfo.concat("<a href = '", window.queue[i][0], "'>", (i+1).toString(), ". ", window.queue[i][1], "</a>", "<button id='", window.queue[i][0],"' class='del'> Delete</button>", "<button id='", window.queue[i][0],"' class='moveUp'> Move Up</button>", "<button id='", window.queue[i][0],"' class='moveDown'> Move Down</button>", "<br/><br/>");
    }
    domInfo = domInfo.concat("<br> <button id='generate' class='generate'> Generate Playlist</button>");
    return domInfo;
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    var domInfo = writeToDOM();

    insert_main();
    insertButton();
    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
  else if ((msg.from === 'popup') && (msg.subject === 'delete')) {
    console.log(msg.to_apply);
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    var i = 0;
    console.log(window.queue);
    for (i = 0; i < window.queue.length; ++i) {
        if (window.queue[i][0] == msg.to_apply)
            break;
    }
    window.queue.splice(i, 1);
    localStorage[save_address] = JSON.stringify(window.queue);
    // this.parentNode.dataset.inQueue = "0";
    // // small hack. TODO: fix this
    // this.parentNode.innerHTML = '<a class="add_event_hack"><i>Play Next</i></a>';
    // var tmp = document.getElementsByClassName("add_event_hack");
    // for (var i = 0; i < tmp.length; ++i) {
    //     tmp[i].addEventListener('click', clickHandler, false);
    // }
    var domInfo = writeToDOM();
    insert_main();
    insertButton(true);
    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
  else if ((msg.from === 'popup') && (msg.subject === 'moveUp')) {
    console.log(msg.to_apply);
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    var i = 0;
    console.log(window.queue);
    for (i = 0; i < window.queue.length; ++i) {
        if (window.queue[i][0] == msg.to_apply)
            break;
    }
    if (i != 0) {
        var temp = window.queue[i];
        window.queue[i] = window.queue[i-1];
        window.queue[i-1] = temp;
    }
    localStorage[save_address] = JSON.stringify(window.queue);

    var domInfo = writeToDOM();
    insert_main();
    insertButton(true);
    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
  else if ((msg.from === 'popup') && (msg.subject === 'moveDown')) {
    console.log(msg.to_apply);
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    var i = 0;
    console.log(window.queue);
    for (i = 0; i < window.queue.length; ++i) {
        if (window.queue[i][0] == msg.to_apply)
            break;
    }
    if (i != window.queue.length-1) {
        var temp = window.queue[i];
        window.queue[i] = window.queue[i+1];
        window.queue[i+1] = temp;
    }
    localStorage[save_address] = JSON.stringify(window.queue);

    var domInfo = writeToDOM();
    insert_main();
    insertButton(true);
    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
  else if ((msg.from === 'popup') && (msg.subject === 'generate')) {
    console.log(msg.to_apply);
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    var i = 0;
    console.log(window.queue);
    var playlist="https://www.youtube.com/embed/?playlist=";
    for (i = 0; i < window.queue.length; ++i) {
        playlist = playlist.concat(window.queue[i][0].slice(32) + ",");
    }
    window.open(playlist);
    var domInfo = writeToDOM();
    // Directly respond to the sender (popup), 
    // through the specified callback */
    response(domInfo);
  }
  

});

// YouTube specific transition
document.addEventListener("spfdone", process);
function process() {
    insert_main();
    insertButton();
}
