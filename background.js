
let color = '#000000';
let addedListner = false;
let keyWords = ["THANKS", "SOLD", "WEEKEND", "BUY", "SELL", "THINK"];
let img_url = "./outline_priority_high_black_24dp.png"
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color, addedListner, keyWords });

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    options= { 
        type: "basic", 
        title: "Test",
        message: request.message,
        iconUrl: img_url,
    }
    if (request.type === "found-match-notification") {
        chrome.notifications.create("found-match-notification", options);
    }
    sendResponse();
});