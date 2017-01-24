var download_links = document.querySelectorAll('a[class=" content-link spf-link  yt-uix-sessionlink      spf-link "]');

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


function clickHandler(e){
	var actualCode = `var link = "${ this.parentNode.dataset.name }";`;
	console.log(actualCode);
	var script = document.createElement('script');
	script.textContent = actualCode;
	document.documentElement.appendChild(script);
	script.remove();
}
