import "./popup.css"
import wcmatch from "wildcard-match"
const isMatch = wcmatch("https://ptrdev1.t3live.com/*/app/dashboardAlt");
const emailVerify = wcmatch("*@*.*");
let scan = document.getElementById("scan");
let addKey = document.getElementById("addKey");
//let sendMail = document.getElementById("sendMail")
let addEmail = document.getElementById("addEmail");
let emailTick = document.getElementById("emailobtained");
let deleteArray = [];



chrome.storage.sync.get("addedListner", async ({ addedListner }) => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!addedListner.flag && isMatch(tab.url)) {
        console.log("matched")
        scan.disabled = false;
    }

});


chrome.storage.sync.get("keyWords", async ({ keyWords }) => {
    for (let i = 0; i < keyWords.length; i++) {
        addchip(keyWords[i]);
    }
});

chrome.storage.sync.get("EmailID", async ({ EmailID }) => {
    document.getElementById("EmailID").value = EmailID.sendTo;
    if (!(EmailID.sendTo === "")) {
        console.log(EmailID.sendTo)
        if (emailVerify(EmailID.sendTo)) {
            console.log("matched");
            emailTick.style.display = "inline";
        }
    }
});

addEmail.addEventListener("click", () => {
    let EmailID = { sendTo: "", threadId: "" };
    EmailID.sendTo = document.getElementById("EmailID").value;

    if (!(EmailID.sendTo === "")) {

        if (emailVerify(EmailID.sendTo)) {
            console.log("matched");
            emailTick.style.display = "inline";
            document.getElementById("EmailID").style.border = "1px solid black";
        }

        else {
            console.log("no email")
            document.getElementById("EmailID").style.border = "2px solid red";
            emailTick.style.display = "none";
        }
    }


    chrome.storage.sync.set({ EmailID });
});



// add error handling
addKey.addEventListener("click", async () => {
    let new_word = document.getElementById("keyWords").value.toUpperCase();
    if (new_word) {

        // convert to uppercase then split
        addchip(new_word);
        //let new_del = document.getElementById(`delete-${new_word}`);
        //new_del.addEventListener("click",deleteChip);
        chrome.storage.sync.get("keyWords", ({ keyWords }) => {
            if (new_word[0] === '$' || new_word[0] === '@') {
                keyWords.push(new_word.slice(1));
            }
            keyWords.push(new_word)
            chrome.storage.sync.set({ keyWords });
        });
    }
    else {
        chrome.storage.sync.get("keyWords", ({ keyWords }) => {
            console.log(keyWords)
        });
    }
    document.getElementById("keyWords").value = '';

});


scan.addEventListener("click", async () => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanChat,
    });

    let addedListner = { tabId: tab.id, flag: true }
    chrome.storage.sync.set({ addedListner });
    scan.disabled = true;
});


// function to add keyword chips : add event listner to each button to remove
// word from list of keywords

function addchip(new_word) {

    const div = document.getElementById("KeyWordsContainer");
    const chip = createChip(new_word);
    div.appendChild(chip);
    document.getElementById("delete-" + new_word).addEventListener("click", deleteChip);
}


function createChip(word) {
    const chip = document.createElement("div");
    // create chip
    chip.className = "chip";
    chip.id = `chip-${word}`;
    chip.innerHTML = `<div class="chipText">${word}</div>\
    <button class="delete" id="delete-${word}">x</button></div>`;
    return chip;
}


/// pass event from delete button on chip
function deleteChip(event) {
    const toremove = event.target.parentElement.outerText.split("\n")[0];

    chrome.storage.sync.get("keyWords", async ({ keyWords }) => {
        //console.log(keyWords);
        //console.log(toremove);
        const index = keyWords.indexOf(toremove);
        if (index > -1) { // only splice array when item is found
            keyWords.splice(index, 1); // 2nd parameter means remove one item only
        }
        chrome.storage.sync.set({ keyWords });
    });
    event.target.parentElement.remove();
}



/**
 *
 sendMail.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: "send-Email", message: "new DRAFT **" });
 
   });

 * 
 */

////////////////////////////////////////script injected to the page for scanning///////////////////////////
async function scanChat() {

    let chatPanel = document.querySelector("#chatContent");

    chatPanel.addEventListener('DOMNodeInserted', checkNewMessage);
    console.log("adding listner");

    if (chatPanel) { };
    async function checkNewMessage(event) {

        chrome.storage.sync.get("keyWords", ({ keyWords }) => {
            // console.log(keyWords);

            ///message parts sticking
            try{
               

            if (event.target.parentNode.id === "chatContent") {
                console.log("new msg in chat")
                let target = event.target;
                let time = target.querySelector(".chat-img.inline").innerText
                let msg = target.querySelector(".chat-msg.chat-msg-txt.inline.smChatBody");
                let user = target.querySelector("strong");
                let new_msg = user.innerText.toUpperCase() + " " + msg.innerText.toUpperCase();
                let words_in_msg = new Set(new_msg.split(/\s/));
                //check if each keyword is present in new msg
                // should be decoupled for cleaner code

                for (let i = 0; i < keyWords.length; i++) {
                    if (words_in_msg.has(keyWords[i])) {
                        // console.log(new_msg);   
                        notifyUser(time + " " + new_msg);
                        break;
                    }

                }
            };

        } catch(err){

            console.log("Unhandled err  on scanner content: ");
            console.log(err);
        }
        });

    }

    function notifyUser(msg) {
        chrome.runtime.sendMessage({ type: "found-match-notification", message: msg });
        console.log(msg)
    }
    // console.log(chatmsgs); current chat messages
    //console.log(chatmsgs[199].innerText); // latest chat msg
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

