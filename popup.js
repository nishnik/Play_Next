// TODO
 // chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
 //                     chrome.tabs.sendMessage(tabs[0].id, {message: "hello"});});

function setDOMInfo(info) {
    var queue = JSON.parse(info);
    console.log(queue);
  //   for (var i = 0; i <= queue.length; ++i) {
		// var p = document.createElement('p');
		// p.innerHTML = '<a href="';
		// p.innerHTML.concat(queue[i][0], '">', queue[i][1], '</a>');
		// p.className = "song-queue";
		// document.getElementById('content').appendChild(p);
  //   }

  document.getElementById('content').textContent = queue;
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script)
        setDOMInfo);
  });
});

var p = document.createElement('p');
console.log(localStorage);
p.innerHTML = '<a href="#"><i>Play Next</i></a>';
p.className = "button play-next";
window.postMessage({ type: "FROM_PAGE", text: "popup" }, "*");
// link.parentElement.insertAdjacentElement('afterbegin',p);
// p.dataset.name = link.href;
// p.querySelector('a').addEventListener('click',clickHandler,true);