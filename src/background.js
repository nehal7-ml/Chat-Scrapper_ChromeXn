
import { Email, delay } from "./utilScript"
//import "./Gapi"
let color = '#000000';
let addedListner = { tabId: null, flag: false };
let keyWords = [];
let img_url = "./icons/outline_priority_high_black_24dp.png"
let matched = ["[2:30 pm] AdminChaT Cleared.", "[2:30 pm], LincolnGood, Morning!!"];
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
    //console.log(request);

    if (request.type === "found-match-notification") {
        matched.push(request.message)
        if (newMatched === false) {
            newMatched = true;
            await delay(5000); /// change this
            let emailmsg = matched; // new variable for async.
            sendEmail(emailmsg);
            newNotification(matched);
        }
    }

    else if (request.type === "matchedLoaded") {

        chrome.storage.sync.get("NotifyTab", ({ NotifyTab }) => {
            chrome.tabs.sendMessage(NotifyTab.tab, { type: "insert-new-message", messages: matched });
            newMatched = false;
            matched = [];

        });
    }
  
    sendResponse();

});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    await chrome.storage.sync.get("addedListner", ({ addedListner }) => {

        //console.log(changeInfo.url);
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

        ////let today = new Date().toLocaleDateString();

        const email = new Email(EmailID.sendTo, message[0], message.slice(1).join("\n"));
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
                return response;
            })
            .catch(error => {
                console.log('Error:', error)
                return
            });


    });
}

function openTab() {

    chrome.storage.sync.get("NotifyTab", async ({ NotifyTab }) => {
        if (NotifyTab.created === false) {
            chrome.tabs.create({
                url: 'matched.html',
                active: false,
            }, async (tab) => {
                NotifyTab.tab = tab.id;
                NotifyTab.created = true;
                chrome.tabs.update(tab.id, { active: true });
                chrome.storage.sync.set({ NotifyTab });
                return;
                //alert("new tab opened")
            });
        }
        else {
            try {
                console.log("inserting new msg");
                await chrome.tabs.sendMessage(NotifyTab.tab, { type: "insert-new-message", messages: matched });
                console.log("no error required tab is open")
                newMatched = false;
                matched = [];
                
            }
            catch (err) {
                console.log("Unhandled err: ");
                console.log(err);
                NotifyTab = { created: false, tab: null };
                chrome.storage.sync.set({ NotifyTab });
                ////old tab propbably closed open another////
                await openTab();        

            }
            finally{
                return;
            }
        }
    });

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
