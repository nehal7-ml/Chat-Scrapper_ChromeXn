

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

    if (request.type === "insert-new-message") {
        await addMessages(request.messages);
        msgfound()
        sendResponse();
    }
   
    
});


chrome.runtime.sendMessage({type:"matchedLoaded",message:"ready"})

function addMessages(msglist){
    const div =document.getElementsByClassName("main-messages")[0];
    for(let i=0;i<msglist.length;i++){
        newMsg= `<span>${msglist[i]}</span></br></br>`
      div.innerHTML=div.innerHTML+newMsg;
    }
   
}


function msgfound(){
    const audio = document.getElementById("audioFile");
    audio.play();
    alert("new Messages found")
}