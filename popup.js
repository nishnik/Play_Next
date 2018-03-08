
function setDOMInfo(info) {
  if (info != null)
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

var tmp;
function cookieinfo(){
    chrome.cookies.get({name:"PREF", url:"https://www.youtube.com"},function (cookie){
        var YT_COOKIE = cookie;
        tmp = YT_COOKIE;
        console.log(cookie);
        modified_val = YT_COOKIE["value"]
    index = modified_val.indexOf('4100') + 4
        console.log(YT_COOKIE["value"])
          modified_val = modified_val.substr(0, index) + '8' + modified_val.substr(index + 1);
       console.log(modified_val, "old:",  YT_COOKIE["value"])
     
 if (YT_COOKIE["value"][index] == '4') {
          
          chrome.cookies.set({ url: "https://www.youtube.com", name: "PREF", value:  modified_val,  expirationDate: YT_COOKIE["expirationDate"]});
          console.log("Done");
          chrome.tabs.getSelected(null, function(tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab.id, {code: code});
          });
        }
    });
}
cookieinfo()
// window.onload=cookieinfo;
