const scrollingElement = (document.scrollingElement || document.body);

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

    if (request.type === "insert-new-message") {
        await addMessages(request.messages);
        msgfound()
        sendResponse();
    }


});

chrome.runtime.sendMessage({ type: "matchedLoaded", message: "ready" })

function addMessages(msglist) {
    const div = document.getElementsByClassName("main-messages")[0];
    for (let i = 0; i < msglist.length; i++) {
        let newMsg = document.createElement('div');
        newMsg.innerText = `${msglist[i]}`;
        newMsg.style.margin = 0;
        div.appendChild(newMsg);
    }

    scrollingElement.scrollTop = scrollingElement.scrollHeight

}


function msgfound() {
    const audio = document.getElementById("audioFile");
    audio.play();
}


