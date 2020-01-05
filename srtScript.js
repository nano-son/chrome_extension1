var idOfTimeOut;
function makeStartButton(flag) {
    var startButton = document.createElement("button");    
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");
    
    if(flag) {
        startButton.innerText = "중지";
        window.onload = refreshPageAfter(5000);
    } else {
        startButton.innerText = "시작";
    }

    startButton.addEventListener("click", function(event) {
        if(flag) {
            startButton.innerText = "시작";
            clearTimeout(idOfTimeOut);
            updateStatus(false);
        } else {
            startButton.innerText = "중지";
            window.onload = refreshPageAfter(10);
            updateStatus(true);
        }
    });
    return startButton;
}

function refreshPageAfter(timeoutPeriod) {
	idOfTimeOut = setTimeout("location.reload(true);",timeoutPeriod);
}

function updateStatus(status) {
    chrome.storage.sync.set({flag: status}, function() {
        console.log("status setting completed: "+status);
    });
}

function getStatus() {
    chrome.storage.sync.get('flag', function(result) {
        console.log('Value currently is ' + result.flag);
    });
}

//매크로 대상들도 필요할 듯
function doJob(flag) {
    var parentForAddingStartButton = document.getElementsByClassName("sub_con_area")[0];
    var startButton = makeStartButton(flag);

    parentForAddingStartButton.appendChild(startButton);
}

chrome.storage.sync.get('flag', function(result) {
    var flag = result.flag;
    doJob(flag);
});
