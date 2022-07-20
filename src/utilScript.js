import { Buffer } from "buffer";
class Base64Url
{   
    
     Encode(arg)
    {
        let s = Buffer.from(arg).toString("base64"); // Standard base64 encoder
        //console.log(s)    
        s = s.split('=')[0]; // Remove any trailing '='s
        s = s.replace('+', '-'); // 62nd char of encoding
        s = s.replace('/', '_'); // 63rd char of encoding
            
        return s;
    }

    Decode( arg)
    {
        let s = arg;
        s = s.replace('-', '+'); // 62nd char of encoding
        s = s.replace('_', '/'); // 63rd char of encoding
        //console.log(s.length)    
        switch (s.length % 4) // Pad with trailing '='s
        {
            case 0: break; // No pad chars in this case
            case 1: s += "==="; break;
            case 2: s += "=="; break; // Two pad chars
            case 3: s += "="; break; // One pad char
            default: throw "Illegal base64url string";
        }
            
        return Buffer.from(s, 'base64').toString('ascii'); // Standard base64 decoder
    }
}


// email object to create raw base64URL message for messge object
export class Email {
    id;
    to;
    subject;
    body;
    constructor (to, subject, body){
        this. to =to;
        this.subject =subject;
        this.body = body;
        let trailer = "\nIn-Reply-To:\n" +"References:\n";
        this.string = "To:"+this.to+"\n"+ "subject:"+this. subject + "\n\n" + this.body + trailer;
   
    }
       
    get rawString () {          
       return this.string
    }

    get encodedString (){
        const encoder = new Base64Url();
        return encoder.Encode(this.string) 
    }
    set id(id){
        this.id=id;
    }

    decodeString(raw) {
        const decoder = new Base64Url();
        return decoder.Decode(raw);

    }

}

export const delay = ms => new Promise(res => setTimeout(res, ms));