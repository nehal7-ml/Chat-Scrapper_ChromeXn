
let color = '#000000';
let addedListner = false;
let keyWords = ["THANKS", "SOLD", "WEEKEND", "BUY", "SELL", "THINK"];
let img_url = "./outline_priority_high_black_24dp.png"
let matched = [] ;



chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color, addedListner, keyWords });

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    
    if (request.type === "found-match-notification") {
    }
    sendResponse();
});

function newNotification (msg){
    options= { 
        type: "basic", 
        title: "Test",
        message: request.message,
        iconUrl: img_url,
    }

        chrome.notifications.create("found-match-notification", options);

}

async function sendEmail(message) {

}