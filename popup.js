
function setDOMInfo(info) {
  document.getElementById('content').innerHTML = info;
  var dds = document.getElementsByTagName("button");
  for (var i = 0, l = dds.length; l > i; i++)
    dds[i].onclick = apply_event(dds[i]);
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

var apply_event = function(dd) {
  return function() {
      chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: dd.className, to_apply:dd.id},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script)
        setDOMInfo);
  });

  }
  };
