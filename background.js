function playSuccessAudio() {
  console.log("hello!!! audio");
  var audio = new Audio();
  audio.src = chrome.runtime.getURL('success.wav');
  audio.play();
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("message receive: "+message);
  if(message && message.type == 'playSuccessAudio') {
    playSuccessAudio();
  }

  sendResponse(true);
})