player = document.getElementById('movie_player');
player.addEventListener("onStateChange", "onPlayerStateChanged");


var link = "nothing";
function onPlayerStateChanged(newState) {
// -1 (unstarted)
// 0 (ended)
// 1 (playing)
// 2 (paused)
// 3 (buffering)
// 5 (video cued).
    console.log(link);
    console.log(newState);
    if (newState == 0 && link != "nothing") {
        window.open(link,"_self")
    }
}