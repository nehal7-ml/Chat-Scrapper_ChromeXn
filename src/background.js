
import { Email, delay } from "./utilScript"
//import "./Gapi"
let color = '#000000';
let addedListner = { tabId: null, flag: false };
let keyWords = ["THANKS", "SOLD", "WEEKEND", "BUY", "SELL", "THINK"];
let img_url = "./icons/outline_priority_high_black_24dp.png"
let matched = [];
let NotifyTab = { created: false, tab: null };
let newMatched = false;
let EmailID = { sendTo: "", threadId: "" };
//console.log(gapi.client);


//////////////////////////////////////////////////////////////listners/////////////////////////////////////////////////
chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.sync.set({ color, addedListner, keyWords, matched, NotifyTab, EmailID });

    chrome.identity.getAuthToken(
        { 'interactive': true },
        function (token) {
            //load Google's javascript client libraries
            const Oauthtoken = token;
            chrome.storage.sync.set({ Oauthtoken });
        }
    );

});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log(request);

    if (request.type === "found-match-notification") {
        matched.push(request.message)

        if (newMatched === false) {
            newMatched = true;
            await delay(5000);
            let emailmsg = matched; // new variable for async.
            sendEmail(emailmsg);
            newNotification(matched);
            sendResponse();
        }
    }

    else if (request.type === "matchedLoaded") {

        await chrome.storage.sync.get("NotifyTab", ({ NotifyTab }) => {
            chrome.tabs.sendMessage(NotifyTab.tab.id, { type: "insert-new-message", messages: matched });
            newMatched = false;
            matched = [];
            sendResponse();
        });
    }
    else if (request.type === "tabClosed") {
        NotifyTab = { created: false, tab: null };

    }

});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    await chrome.storage.sync.get("addedListner", ({ addedListner }) => {

        console.log(changeInfo.url);
        if ((tabId === addedListner.tabId) && (changeInfo.url)) {

            addedListner = { tabId: null, flag: false };
            chrome.storage.sync.set({ addedListner });
        }
    });



})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function newNotification() {
    console.log(matched[matched.length - 1])
    openTab();
}

async function sendEmail(message) {
    chrome.storage.sync.get(["Oauthtoken", "EmailID"], async ({ Oauthtoken, EmailID }) => {

        let today = new Date().toLocaleDateString();

        const email = new Email(EmailID.sendTo, "New message found-" + today, message.join("\n"));
        const raw = email.encodedString;

        const headers = {
            //"Content-Type" : "message/rfc822",
            "Authorization": `Bearer ${Oauthtoken}`,
            "Accept-Encoding": "gzip, deflate, br"
        }
        let threadId = EmailID.threadId;

        const baseURL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
        const body = JSON.stringify({ threadId, raw });

        fetch(baseURL, {
            method: "POST",
            headers,
            body
        })
            .then(response => response.json())
            .then(response => {
                console.log(response)

                if (!EmailID.threadId === response.threadId) {
                    EmailID.threadId = response.threadId;

                    chrome.storage.sync.set({ EmailID });
                }
                return response;
            })
            .catch(error => {
                console.log('Error:', error)
                return
            });


    });
}

function openTab() {

    chrome.storage.sync.get("NotifyTab", ({ NotifyTab }) => {
        if (NotifyTab.created === false) {
            chrome.tabs.create({
                url: 'matched.html',
                active: false,
            }, async (tab) => {
                NotifyTab.tab = tab;
                NotifyTab.created = true;
                chrome.tabs.update(tab.id, { active: true });
                chrome.storage.sync.set({ NotifyTab });
                //alert("new tab opened")
            });
        }
        else {
            chrome.tabs.sendMessage(NotifyTab.tab.id, { type: "insert-new-message", messages: matched });
            console.log("inserting new msg");
            newMatched = false;
            matched = [];
        }
    });



}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function createDarft(msg) {

    const email = new Email("nehal.sk.99@gmail.com", "new api Draft", msg);
    //console.log(email.decodeString(email.encodedString))
    const message = { "raw": email.encodedString };
    chrome.storage.sync.get("Oauthtoken", async ({ Oauthtoken }) => {
        //console.log(Oauthtoken);
        const headers = {
            //"Content-Type" : "message/rfc822",
            "Authorization": `Bearer ${Oauthtoken}`,
            "Accept-Encoding": "gzip, deflate, br"
        }


        const baseURL = "https://gmail.googleapis.com/gmail/v1/users/nehal.sk.99@gmail.com/drafts";
        const body = JSON.stringify({ message });
        //console.log(body)


        fetch(baseURL, {
            method: "POST",
            headers,
            body
        })
            .then(response => response.json())
            .then(response => {
                console.log(response)
                return response
            })
            .catch(error => {
                console.log('Error:', error)
                return
            });
    });


}
