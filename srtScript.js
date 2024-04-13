let idOfTimeOut;
let inProgress = false;
const refreshInterval = 2200; //ms

function makeStartButton() {
    var startButton = document.createElement("button");
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");

    if (inProgress) {
        startButton.innerText = "중지";
    } else {
        startButton.innerText = "시작";
    }

    startButton.addEventListener("click", function (event) {
        if (inProgress) {
            updateStatus(false);
            startButton.innerText = "시작";
        } else if (atLeastOneCheck()) {
            updateStatus(true);
            startButton.innerText = "중지";
        } else {
            alert("체크된 항목이 없습니다.");
        }
    });

    document.getElementsByClassName("sub_con_area")[0].appendChild(startButton);
    return startButton;
}

function refreshPageAfter(timeoutPeriod) {
    let reloadButton = document.getElementById("search_top_tag").getElementsByTagName("input")[0];
    idOfTimeOut = setTimeout(function () {reloadButton.click()}, timeoutPeriod);
}

function updateStatus(status) {
    let firstClassList = []
    let economyClassList = []

    if (status) {
        let checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
        let checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");

        for (let i = 0; i < checkboxesForFirstClass.length; ++i) {
            if (checkboxesForFirstClass[i].checked) {
                const parent = checkboxesForFirstClass[i].parentElement.parentElement; //tr td input 이라서 두번 거슬러 올라감
                const trainNumber = parent.children[2].innerText;
                firstClassList.push(trainNumber);
            }
        }

        for (let i = 0; i < checkboxesForEconomyClass.length; ++i) {
            if (checkboxesForEconomyClass[i].checked) {
                const parent = checkboxesForEconomyClass[i].parentElement.parentElement;
                const trainNumber = parent.children[2].innerText;
                economyClassList.push(trainNumber);
            }
        }
    }

    chrome.storage.sync.set({
        mData: {
            flag: status,
            firstClassList: firstClassList,
            economyClassList: economyClassList
        }
    }, function () {
        inProgress = status;
        if (status) {
            location.reload(true);
        } else {
            clearTimeout(idOfTimeOut);
        }
        console.log("status setting completed: " + status + ", firstClassList:" + firstClassList + ", economyClassList:" + economyClassList);
    });
}

//매크로 대상들도 필요할 듯
function doJob(firstClassList, economyClassList) {
    if (inProgress) {
        let sleepTime = 3000 + Math.random() * 3000;
        console.log("sleep time:" + sleepTime)
        window.onload = refreshPageAfter(sleepTime); //random for [2,4] seconds
    }

    let startButton = makeStartButton();

    let tbodyList = document.getElementsByTagName("tbody");
    if (tbodyList.length == 0 && inProgress) {
        startButton.innerText = "시작";
        updateStatus(false);
        return;
    }

    let searchedRows = tbodyList[0].children;
    let targetButtons = []

    for (var i = 0; i < searchedRows.length; ++i) {
        let row = searchedRows[i];
        let trainNumber = row.children[2].innerText;
        let tdForFirstClass = row.children[5];
        let tdForEconomyClass = row.children[6];

        let checkBtn = document.createElement("input");
        checkBtn.setAttribute("type", "checkbox");
        checkBtn.setAttribute("class", "mCheckboxForFirstClass");

        if (firstClassList.includes(trainNumber)) {
            checkBtn.checked = true;
            targetButtons.push(tdForFirstClass.getElementsByTagName("a")[0]);
        }
        tdForFirstClass.insertBefore(checkBtn, tdForFirstClass.firstChild);

        let checkBtn2 = document.createElement("input");
        checkBtn2.setAttribute("type", "checkbox");
        checkBtn2.setAttribute("class", "mCheckboxForEconomyClass");

        if (economyClassList.includes(trainNumber)) {
            checkBtn2.checked = true;
            targetButtons.push(tdForEconomyClass.getElementsByTagName("a")[0]);
        }
        tdForEconomyClass.insertBefore(checkBtn2, tdForEconomyClass.firstChild);

        checkBtn.onclick = canNotModifyCheckBox;
        checkBtn2.onclick = canNotModifyCheckBox;
    }

    if (targetButtons.length <= 0) {
        console.log("flag down")
        updateStatus(false);
    }

    for (let i = 0; i < targetButtons.length; ++i) {
        let onClickAttr = targetButtons[i].getAttribute('onclick')
        if (onClickAttr && onClickAttr.startsWith("reservationAfterMsg")) { //reservationAfterMsg method: 예매하기, requestReservationInfoAnn method: 입석+좌석
            targetButtons[i].setAttribute("onclick", onClickAttr.replace("MRT200164", "")); //잘 적용이 안되네
            targetButtons[i].click();
            updateStatus(false);
            // chrome.runtime.sendMessage({type: 'playSuccessAudio'}, function(data) { });
            // var audio = new Audio();
            // audio.src = chrome.runtime.getURL('success.wav');
            // audio.play();
            // console.log("after sendMsg");
        }
    }
}

function canNotModifyCheckBox() {
    if (inProgress) {
        alert("매크로 동작동안 체크박스를 수정할 수 없습니다.");
        return false;
    }
}

function atLeastOneCheck() {
    const checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
    const checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");

    for (var i = 0; i < checkboxesForFirstClass.length; ++i) {
        if (checkboxesForFirstClass[i].checked) {
            return true;
        }
    }

    for (var i = 0; i < checkboxesForEconomyClass.length; ++i) {
        if (checkboxesForEconomyClass[i].checked) {
            return true;
        }
    }

    return false;
}

chrome.storage.sync.get('mData', function (result) {
    inProgress = false;
    let firstClassList = [];
    let economyClassList = [];

    if (result.mData) {
        inProgress = result.mData.flag;

        if (Array.isArray(result.mData.firstClassList)) {
            firstClassList = result.mData.firstClassList;
        }

        if (Array.isArray(result.mData.economyClassList)) {
            economyClassList = result.mData.economyClassList;
        }
    }

    console.log("inProgress:" + inProgress + ", fList:" + firstClassList + ", eList:" + economyClassList);
    doJob(firstClassList, economyClassList);
});

// 각 줄 가져오는거: $('#result-form fieldset div.tbl_wrap table tbody tr').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(6)').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(7)').length;