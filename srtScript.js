var idOfTimeOut;
var globalFlag = false;
const refreshInterval = 2200; //ms

function makeStartButton() {
    var startButton = document.createElement("button");    
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");
    
    if(globalFlag) {
        startButton.innerText = "중지";
    } else {
        startButton.innerText = "시작";
    }

    startButton.addEventListener("click", function(event) {
        if(globalFlag) {
            updateStatus(false);
        } else {
            if(atLeastOneCheck()) {
                updateStatus(true);
            } else {
                alert("체크된 항목이 없습니다.");        
            }
        }
    });
    return startButton;
}

function refreshPageAfter(timeoutPeriod) {
	idOfTimeOut = setTimeout("location.reload(true);",timeoutPeriod);
}

function updateStatus(status) {
    var checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
    var checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");
    var firstClassList = []
    var economyClassList = []
    
    if(status) {
        for(var i=0; i<checkboxesForFirstClass.length; ++i) {
            if(checkboxesForFirstClass[i].checked) {
                const parent = checkboxesForFirstClass[i].parentElement.parentElement; //tr td input 이라서 두번 거슬러 올라감
                const trainNumber = parent.children[2].innerText;
                firstClassList.push(trainNumber);
            }
        }

        for(var i=0; i<checkboxesForEconomyClass.length; ++i) {
            if(checkboxesForEconomyClass[i].checked) {
                const parent = checkboxesForEconomyClass[i].parentElement.parentElement;
                const trainNumber = parent.children[2].innerText;
                economyClassList.push(trainNumber);
            }
        }
    }

    chrome.storage.sync.set({mData: {flag: status, firstClassList: firstClassList, economyClassList: economyClassList}}, function() {
        globalFlag = status;
        startButton = $("#mStartButton");
        if(status) {
            startButton.html("중지");
            location.reload(true);
        } else {
            startButton.html("시작");
            clearTimeout(idOfTimeOut);
        }
        console.log("status setting completed: "+status+", firstClassList:"+firstClassList+", economyClassList:"+economyClassList);
    });
}

//매크로 대상들도 필요할 듯
function doJob(firstClassList, economyClassList) {
    if(globalFlag) {
        window.onload = refreshPageAfter(refreshInterval);
    }

    var parentForAddingStartButton = $(".sub_con_area")[0];
    parentForAddingStartButton.appendChild(makeStartButton());

    var tbodyList = $("tbody");
    if(tbodyList.length == 0 && globalFlag) {
        updateStatus(false);
        return;
    }

    var searchedRows = tbodyList[0].children;
    var reservationButtons = []

    //각 줄에 체크박스를 넣고 초기화한다.
    for(var i=0; i<searchedRows.length; ++i) {
        var row = searchedRows[i];
        var trainNumber = row.children[2].innerText;
        var tdForFirstClass = row.children[5];
        var tdForEconomyClass = row.children[6];

        checkBtn = document.createElement("input");
        checkBtn.setAttribute("type", "checkbox");
        checkBtn.setAttribute("class", "mCheckboxForFirstClass");
    
        tdForFirstClass.insertBefore(checkBtn, tdForFirstClass.firstChild);
        if(firstClassList.includes(trainNumber)) {
            checkBtn.checked = true;
            reservationButtons.push(Array.from(tdForFirstClass.getElementsByTagName("a")));
        }

        checkBtn2 = document.createElement("input");
        checkBtn2.setAttribute("type", "checkbox");
        checkBtn2.setAttribute("class", "mCheckboxForEconomyClass");

        tdForEconomyClass.insertBefore(checkBtn2, tdForEconomyClass.firstChild);
        if(economyClassList.includes(trainNumber)) {
            checkBtn2.checked = true;
            reservationButtons.push(Array.from(tdForEconomyClass.getElementsByTagName("a")));
        }

        if(globalFlag) {
            checkBtn.onclick = canNotModifyCheckBox;
            checkBtn2.onclick = canNotModifyCheckBox;
        }
    }

    reservationButtons = reservationButtons.flat(); //평탄화
    if(reservationButtons.length <= 0) {
        updateStatus(false);
    }
    
    for(var i=0; i<reservationButtons.length; ++i) {
        var onClickAttr = reservationButtons[i].getAttribute('onclick')
        if(onClickAttr && onClickAttr.startsWith("requestReservationInfo")) { //requestReservationInfo method: 예매하기, requestReservationInfoAnn method: 입석+좌석
            reservationButtons[i].click();
            updateStatus(false);
            chrome.runtime.sendMessage({type: 'playSuccessAudio'}, function(data) { });
        }
    }
}

function canNotModifyCheckBox() {
    if(globalFlag) {
        alert("매크로 동작동안 체크박스를 수정할 수 없습니다.");
        return false;
    }
}

function atLeastOneCheck() {
    const checkboxesForFirstClass = document.getElementsByClassName("mCheckboxForFirstClass");
    const checkboxesForEconomyClass = document.getElementsByClassName("mCheckboxForEconomyClass");

    for(var i =0; i<checkboxesForFirstClass.length; ++i) {
        if(checkboxesForFirstClass[i].checked) {
            return true;
        }
    }

    for(var i =0; i<checkboxesForEconomyClass.length; ++i) {
        if(checkboxesForEconomyClass[i].checked) {
            return true;
        }
    }

    return false;
}

chrome.storage.sync.get('mData', function(result) {
    globalFlag = false;
    var firstClassList = [];
    var economyClassList = [];

    if(result.mData) {
        globalFlag = result.mData.flag;

        if(Array.isArray(result.mData.firstClassList)) {
            firstClassList = result.mData.firstClassList;
        }

        if(Array.isArray(result.mData.economyClassList)) {
            economyClassList = result.mData.economyClassList;
        }
    }

    console.log("flag:"+globalFlag+", fList:"+firstClassList+", eList:"+economyClassList);
    doJob(firstClassList, economyClassList);
});

// 각 줄 가져오는거: $('#result-form fieldset div.tbl_wrap table tbody tr').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(6)').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(7)').length;