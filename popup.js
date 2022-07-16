let changeColor = document.getElementById("changeColor");
let addKey = document.getElementById("addKey");


// add error handling
addKey.addEventListener("click", async () => {
    let new_words = document.getElementById("keyWords");
    if (new_words.value) {

        // convert to uppercase then split
        let new_list = new_words.value.toUpperCase().split(/\s/)
        chrome.storage.sync.get("keyWords", async ({ keyWords }) => {
            console.log(keyWords)
            let array = keyWords;
            keyWords = Array.from(new Set([...array, ...new_list]));
            await chrome.storage.sync.set({ keyWords });

        });
    }
    else {
        chrome.storage.sync.get("keyWords", ({ keyWords }) => {
            console.log(keyWords)
        });
    }
    new_words.value = '';

});


changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: findElement,
    });
});



// input is a Set of key words
async function findElement() {


    let chatPanel = document.querySelector("#chatContent");

    chrome.storage.sync.get("addedListner", ({ addedListner }) => {
        if (addedListner) {
            chatPanel.removeEventListener("DOMNodeInserted", checkNewMessage, true);
            console.log("removing old listner")
        }

        chatPanel.addEventListener('DOMNodeInserted', checkNewMessage, true);

        chrome.storage.sync.set({ addedListner: true });
        console.log("adding listner")
    });



    async function checkNewMessage(event) {

        await chrome.storage.sync.get("keyWords", ({ keyWords }) => {
            // console.log(keyWords);

            if (event.target.parentNode.id === "chatContent") {
                console.log("new msg in chat")
                let new_msg = event.target.innerText.toUpperCase();
                let words_in_msg = new Set(new_msg.split(/\s/));
                //check if each keyword is present in new msg
                // should be decoupled for cleaner code

                for (let i = 0; i < keyWords.length; i++) {
                    if (words_in_msg.has(keyWords[i])) {
                        // console.log(new_msg);   
                        notifyUser(new_msg);
                        break;
                    }

                }
            };
        });

    }
    function notifyUser(msg) {

        chrome.runtime.sendMessage({ type: "found-match-notification", message: msg });
        console.log(msg)
    }
    // console.log(chatmsgs); current chat messages
    //console.log(chatmsgs[199].innerText); // latest chat msg
}


// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor(text) {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
    console.log(text);
}