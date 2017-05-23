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


function checkLink() {
    var to_match = 'a[class="';
    var LOC_HREF = 0;
    if (document.location.href == "https://www.youtube.com/") {
        to_match = to_match.concat("yt-simple-endpoint style-scope ytd-grid-video-renderer", '"]');
        LOC_HREF = 1;
    }
    else if (document.location.href.substring(0, 29) == "https://www.youtube.com/watch") {
        to_match = to_match.concat("yt-simple-endpoint style-scope ytd-compact-video-renderer", '"]');
        LOC_HREF = 2;
    }
    else if (document.location.href.substring(0, 31) == "https://www.youtube.com/results" || document.location.href == "https://www.youtube.com/feed/trending") {
        to_match = to_match.concat("yt-simple-endpoint style-scope ytd-video-renderer", '"]');
        LOC_HREF = 3;
    }
    return [to_match, LOC_HREF];
}

function insertButton() {
    temp = checkLink();
    to_match = temp[0];
    LOC_HREF = temp[1];
    var buttons = document.querySelectorAll('p[class="button play-next"]');
    console.log(to_match);
    var download_links = document.querySelectorAll(to_match);
    console.log("here");
    console.log(download_links, buttons.length);
    if(download_links.length != buttons.length){
        for (var i = download_links.length-1; i >=buttons.length ; --i) {
            // if (!download_links[i].className == "yt-simple-endpoint style-scope ytd-compact-video-renderer")
            //     continue
            var link = download_links[i];
            var p = document.createElement('p');
            p.innerHTML = '<a><i>Play Next</i></a>';
            p.className = "button play-next";
            p.querySelector('a').addEventListener('click',clickHandler,true);
            link.parentElement.insertAdjacentElement('afterend',p);
            p.dataset.inQueue = "0";
            p.dataset.name = link.href;
            if (LOC_HREF == 2)
                p.dataset.song_name = link.querySelectorAll('span[id="video-title"]')[0].innerText;
            if (LOC_HREF == 1 || LOC_HREF == 3 || LOC_HREF == 4)
                p.dataset.song_name = link.innerText;
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
            next_song[0].innerHTML = '<a style="color: blue"><i>Playing Next</i></a>';
            next_song[0].dataset.inQueue = "1";
            next_song[0].querySelector('a').addEventListener('click',clickHandler,true);
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
        this.parentNode.innerHTML = '<a class="add_event_hack"><i>Play Next</i></a>';
        var tmp = document.getElementsByClassName("add_event_hack");
        for (var i = 0; i < tmp.length; ++i) {
            tmp[i].addEventListener('click', clickHandler, false);
        }
    }
    localStorage[save_address] = JSON.stringify(window.queue);
    insertPlayInfo();
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    if (localStorage.getItem(save_address) != null) {
        window.queue = JSON.parse(localStorage[save_address]);
    }
    insert_main();
    insertButton();

    var domInfo = " ";
    for (var i = 0; i < window.queue.length; ++i) {
        domInfo = domInfo.concat("<a href = '", window.queue[i][0], "'>", window.queue[i][1], "</a><br/><br/>");
    }
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

window.addEventListener ("load", myMain, false);
// Small hack to inject code after the elements are loaded
function myMain (evt) {
    var jsInitChecktimer = setInterval (checkForJS_Finish, 111);

    function checkForJS_Finish () {
        to_match = checkLink()[0];
        if (document.querySelectorAll(to_match).length >= 9) { // 9 is arbitrary
            clearInterval (jsInitChecktimer);
            insert_main();
            insertButton();
        }
    }
}