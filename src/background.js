
import { Email, delay } from "./utilScript"


///////////////////hard code keywords here////////////////////////////////
const MainInputs = { 
    keyWords: [], 
    EmailID: "" 
};
////////////////////check input.json for reference////////////////////////



let EmailID = { sendTo: MainInputs.EmailID, threadId: "" };
let keyWords = parseInput(MainInputs.keyWords);

let color = '#000000';
let addedListner = { tabId: null, flag: false };
let img_url = "./icons/outline_priority_high_black_24dp.png"
let matched = [];
let NotifyTab = { created: false, tab: null };
let newMatched = false;




//////////////////////////////////////////////////////////////listners/////////////////////////////////////////////////
chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.sync.set({ color, addedListner, keyWords, matched, NotifyTab, EmailID });
    refreshAuth();
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    //console.log(request);

    if (request.type === "found-match-notification") {
        matched.push(request.message)
        if (newMatched === false) {
            newMatched = true;
            await delay(5000); /// change this
            let emailmsg = matched; // new variable for async.

            ////check number of lines in email must not exceed 76 split if required.///
            if (emailmsg.length > 70) {

                const chunkSize = 70;
                for (let i = 0; i < emailmsg.length; i += chunkSize) {
                    const chunk = emailmsg.slice(i, i + chunkSize);
                    console.log(chunkSize)
                    await sendEmail(chunk)

                }
            }
            else sendEmail(emailmsg);
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
    await checkAuth();

    chrome.storage.sync.get(["Oauthtoken", "EmailID"], async ({ Oauthtoken, EmailID }) => {

        ////let today = new Date().toLocaleDateString();

        const email = new Email(EmailID.sendTo, message[0], message.slice(1).join("\n"));
        const raw = email.encodedString;

        const headers = {
            //"Content-Type" : "message/rfc822",
            "Authorization": `Bearer ${Oauthtoken}`,
            "Accept-Encoding": "gzip, deflate, br"
        }
        //let threadId = EmailID.threadId;

        console.log(Oauthtoken)

        const baseURL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
        const body = JSON.stringify({ raw });

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
                return;
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
            finally {
                return;
            }
        }
    });

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function refreshAuth() {
    chrome.identity.getAuthToken(
        { 'interactive': true },
        function (token) {
            //load Google's javascript client libraries
            console.log("refreshed token");
            const Oauthtoken = token;
            chrome.storage.sync.set({ Oauthtoken });
        }
    );
    return true;
}

async function checkAuth() {

    chrome.storage.sync.get("Oauthtoken", ({ Oauthtoken }) => {
        const baseURL = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${Oauthtoken}`;

        fetch(baseURL, { method: "GET" })
            .then(async response => {
                console.log(response)

                if (!(response.status === 200)) {
                    await refreshAuth();
                }
                return true;
            })
            .catch(error => {
                console.log('Error:', error)
                return false;
            });

    });


}


//////////////////////function related to input////////////////////////////////////

function parseInput(keyWords) {

    let result = [];

    keyWords.forEach(word => {
        result.push(word.toUpperCase());

        if ((word[0] === "$") || (word[0] === "@")) {
            result.push(word.slice(1).toUpperCase());
        }
    });
    return result;

}