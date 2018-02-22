function run_now() {
	if (player == document.getElementById('movie_player'))
		return;
	player = document.getElementById('movie_player');
	player.addEventListener("onStateChange", "onPlayerStateChanged");//'onStateChange': self.YTonStateChange.bind(self) can we use this to bind the video an call with 'this' keyword
}
run_now();
var link = "nothing";
var save_address = 'songs_queue';

function onPlayerStateChanged(newState) {
// -1 (unstarted)
// 0 (ended)
// 1 (playing)
// 2 (paused)
// 3 (buffering)
// 5 (video cued).
	var queue;
	if (localStorage.getItem(save_address) != null) {
        queue = JSON.parse(localStorage[save_address]);
    }
	if (queue && newState == 0) {
		window.open(queue[0][0],"_self");
		queue.shift();
		localStorage[save_address] = JSON.stringify(queue);
	}
	
}

