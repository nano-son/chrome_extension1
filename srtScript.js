function makeStartButton() {
    var startButton = document.createElement("button");    
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");
    startButton.innerText = "시작";

    startButton.addEventListener("click", startButtonOnClick)

    return startButton;
}

function startButtonOnClick(event) {
    alert("hello extension!");
    window.onload = timedRefresh(5000);
    startButton.innerText = "클릭됨"
    updateStatus(true)
}

function timedRefresh(timeoutPeriod) {
	setTimeout("location.reload(true);",timeoutPeriod);
}

function updateStatus(status) {
    chrome.storage.sync.set({flag: status}, function() {
        console.log("status setting completed: "+status);
    });
}

function getStatus() {
    chrome.storage.sync.get(['flag'], function() {
        console.log('Value currently is ' + result.key);
    })
}
getStatus()
// window.onload = timedRefresh(5000);

var parentForAddingStartButton = document.getElementsByClassName("sub_con_area")[0];
var startButton = makeStartButton();
var text = document.createTextNode("nano test");

parentForAddingStartButton.appendChild(startButton);
parentForAddingStartButton.appendChild(text);

