var idOfTimeOut;
function makeStartButton(flag) {
    var startButton = document.createElement("button");    
    startButton.setAttribute("class", "btn_large wx200 btn_burgundy_dark2 val_m corner");
    startButton.setAttribute("type", "button");
    startButton.setAttribute("id", "mStartButton");
    
    if(flag) {
        startButton.innerText = "중지";
        window.onload = refreshPageAfter(2200);
    } else {
        startButton.innerText = "시작";
    }

    startButton.addEventListener("click", function(event) {
        if(flag) {
            startButton.innerText = "시작";
            updateStatus(false);
            clearTimeout(idOfTimeOut);
        } else {
            startButton.innerText = "중지";
            updateStatus(true);
            location.reload(true);
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
                const parent = checkboxesForFirstClass[i].parentElement.parentElement;
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
        console.log("status setting completed: "+status+", firstClassList:"+firstClassList+", economyClassList:"+economyClassList);
    });
}

function getStatus() {
    chrome.storage.sync.get('mData', function(result) {
        console.log('Value currently is ' + result.flag);
        console.log('Value currently is ' + result.firstClassList);
        console.log('Value currently is ' + result.economyClassList);
    });
}

function initJquery() {
    // var jqry = document.createElement('script');
    // jqry.src = "https://code.jquery.com/jquery-3.3.1.min.js";
    // jqry.type = "text/script";
    // // var jqueryNode = document.createElement("script");
    // // jqueryNode.setAttribute("type", "text/script");
    // // jqueryNode.setAttribute("src", "https://code.jquery.com/jquery-3.3.1.min.js");
    // document.getElementsByTagName('head')[0].appendChild(jqry);
    jQuery.noConflict();
}

//매크로 대상들도 필요할 듯
function doJob(flag, firstClassList, economyClassList) {
    var parentForAddingStartButton = document.getElementsByClassName("sub_con_area")[0];
    var startButton = makeStartButton(flag);

    parentForAddingStartButton.appendChild(startButton);

    var searchedRows = document.getElementsByTagName("tbody")[0].children;
    var targetButtons = []
    // var searchedRows = $('#result-form fieldset div.tbl_wrap table tbody tr');
    // var tdForFirstClass = $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(6)');
    // var tdForEconomyClass = $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(7)');

    for(var i=0; i<searchedRows.length; ++i) {
        var row = searchedRows[i];
        var trainNumber = row.children[2].innerText;
        var tdForFirstClass = row.children[5];
        var tdForEconomyClass = row.children[6];

        checkBtn = document.createElement("input");
        checkBtn.setAttribute("type", "checkbox");
        checkBtn.setAttribute("class", "mCheckboxForFirstClass");
    
        if(firstClassList.includes(trainNumber)) {
            checkBtn.checked = true;
            targetButtons.push(Array.from(tdForFirstClass.getElementsByTagName("a")));
        }
        tdForFirstClass.insertBefore(checkBtn, tdForFirstClass.firstChild);

        checkBtn2 = document.createElement("input");
        checkBtn2.setAttribute("type", "checkbox");
        checkBtn2.setAttribute("class", "mCheckboxForEconomyClass");
        checkBtn2.checked = economyClassList.includes(trainNumber);
        if(economyClassList.includes(trainNumber)) {
            checkBtn2.checked = true;
            targetButtons.push(Array.from(tdForEconomyClass.getElementsByTagName("a")));
        }
        tdForEconomyClass.insertBefore(checkBtn2, tdForEconomyClass.firstChild);
    }

    targetButtons = targetButtons.flat(); //평탄화
    console.log("***********");
    console.log(targetButtons);
    for(var i=0; i<targetButtons.length; ++i) {
        console.log(targetButtons[i])
        console.log(targetButtons[i].tagName);
        var onClickAttr = targetButtons[i].getAttribute('onclick')
        if(onClickAttr && onClickAttr.startsWith("requestReservationInfo")) { //requestReservationInfo method: 예매하기, requestReservationInfoAnn method: 입석+좌석
            targetButtons[i].click();
        }
    }
}

// initJquery();
chrome.storage.sync.get('mData', function(result) {
    var flag = result.mData.flag;
    var firstClassList = [];
    if(Array.isArray(result.mData.firstClassList)) {
        firstClassList = result.mData.firstClassList;
    }
    var economyClassList = [];
    if(Array.isArray(result.mData.economyClassList)) {
        economyClassList = result.mData.economyClassList;
    }

    console.log("flag:"+flag+", fList:"+firstClassList+", eList:"+economyClassList);
    doJob(flag, firstClassList, economyClassList);
});

//.tbl_wrap th_thead > td > a
//$('#result-form fieldset div.tbl_wrap table tbody tr:nth-child(2)').length;
// 각 줄 가져오는거: $('#result-form fieldset div.tbl_wrap table tbody tr').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(6)').length;
// $('#result-form fieldset div.tbl_wrap table tbody tr td:nth-child(7)').length;
