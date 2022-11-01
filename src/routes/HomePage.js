
import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
// copied form "https://stackoverflow.com/questions/997284/how-does-md5sum-algorithm-work"
function MD5(){
    this.F = function(x,y,z) { return (x & y) | ((~x) & z); };
    this.G = function(x,y,z) { return (x & z) | (y & (~z)); };
    this.H = function(x,y,z) { return (x ^ y ^ z); };
    this.I = function(x,y,z) { return (y ^ (x | (~z))); };
    this.C = function(q,a,b,x,s,ac) { return this.addu(this.rol(this.addu(this.addu(a,q),this.addu(x,ac)),s),b); };
    this.FF = function(a,b,c,d,x,s,ac) { return this.C((b & c) | ((~b) & d),a,b,x,s,ac); };
    this.GG = function(a,b,c,d,x,s,ac) { return this.C((b & d) | (c & (~d)),a,b,x,s,ac); };
    this.HH = function(a,b,c,d,x,s,ac) { return this.C(b ^ c ^ d,a,b,x,s,ac); };
    this.II = function(a,b,c,d,x,s,ac) { return this.C(c ^ (b | (~d)),a,b,x,s,ac); };

    this.hash = function(message)
    {
        var xl,x=[],k,aa,bb,cc,dd,a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
        x = this.convertToWordArray(this.utf8Encode(message));
        xl = x.length;
        for (var j = 0; j < xl; j += 16) {
        aa=a; bb=b; cc=c; dd=d;
        a=this.FF(a,b,c,d,x[j+0],7,0xD76AA478);
        d=this.FF(d,a,b,c,x[j+1],12,0xE8C7B756);
        c=this.FF(c,d,a,b,x[j+2],17,0x242070DB);
        b=this.FF(b,c,d,a,x[j+3],22,0xC1BDCEEE);
        a=this.FF(a,b,c,d,x[j+4],7,0xF57C0FAF);
        d=this.FF(d,a,b,c,x[j+5],12,0x4787C62A);
        c=this.FF(c,d,a,b,x[j+6],17,0xA8304613);
        b=this.FF(b,c,d,a,x[j+7],22,0xFD469501);
        a=this.FF(a,b,c,d,x[j+8],7,0x698098D8);
        d=this.FF(d,a,b,c,x[j+9],12,0x8B44F7AF);
        c=this.FF(c,d,a,b,x[j+10],17,0xFFFF5BB1);
        b=this.FF(b,c,d,a,x[j+11],22,0x895CD7BE);
        a=this.FF(a,b,c,d,x[j+12],7,0x6B901122);
        d=this.FF(d,a,b,c,x[j+13],12,0xFD987193);
        c=this.FF(c,d,a,b,x[j+14],17,0xA679438E);
        b=this.FF(b,c,d,a,x[j+15],22,0x49B40821);
        a=this.GG(a,b,c,d,x[j+1],5,0xF61E2562);
        d=this.GG(d,a,b,c,x[j+6],9,0xC040B340);
        c=this.GG(c,d,a,b,x[j+11],14,0x265E5A51);
        b=this.GG(b,c,d,a,x[j+0],20,0xE9B6C7AA);
        a=this.GG(a,b,c,d,x[j+5],5,0xD62F105D);
        d=this.GG(d,a,b,c,x[j+10],9,0x2441453);
        c=this.GG(c,d,a,b,x[j+15],14,0xD8A1E681);
        b=this.GG(b,c,d,a,x[j+4],20,0xE7D3FBC8);
        a=this.GG(a,b,c,d,x[j+9],5,0x21E1CDE6);
        d=this.GG(d,a,b,c,x[j+14],9,0xC33707D6);
        c=this.GG(c,d,a,b,x[j+3],14,0xF4D50D87);
        b=this.GG(b,c,d,a,x[j+8],20,0x455A14ED);
        a=this.GG(a,b,c,d,x[j+13],5,0xA9E3E905);
        d=this.GG(d,a,b,c,x[j+2],9,0xFCEFA3F8);
        c=this.GG(c,d,a,b,x[j+7],14,0x676F02D9);
        b=this.GG(b,c,d,a,x[j+12],20,0x8D2A4C8A);
        a=this.HH(a,b,c,d,x[j+5],4,0xFFFA3942);
        d=this.HH(d,a,b,c,x[j+8],11,0x8771F681);
        c=this.HH(c,d,a,b,x[j+11],16,0x6D9D6122);
        b=this.HH(b,c,d,a,x[j+14],23,0xFDE5380C);
        a=this.HH(a,b,c,d,x[j+1],4,0xA4BEEA44);
        d=this.HH(d,a,b,c,x[j+4],11,0x4BDECFA9);
        c=this.HH(c,d,a,b,x[j+7],16,0xF6BB4B60);
        b=this.HH(b,c,d,a,x[j+10],23,0xBEBFBC70);
        a=this.HH(a,b,c,d,x[j+13],4,0x289B7EC6);
        d=this.HH(d,a,b,c,x[j+0],11,0xEAA127FA);
        c=this.HH(c,d,a,b,x[j+3],16,0xD4EF3085);
        b=this.HH(b,c,d,a,x[j+6],23,0x4881D05);
        a=this.HH(a,b,c,d,x[j+9],4,0xD9D4D039);
        d=this.HH(d,a,b,c,x[j+12],11,0xE6DB99E5);
        c=this.HH(c,d,a,b,x[j+15],16,0x1FA27CF8);
        b=this.HH(b,c,d,a,x[j+2],23,0xC4AC5665);
        a=this.II(a,b,c,d,x[j+0],6,0xF4292244);
        d=this.II(d,a,b,c,x[j+7],10,0x432AFF97);
        c=this.II(c,d,a,b,x[j+14],15,0xAB9423A7);
        b=this.II(b,c,d,a,x[j+5],21,0xFC93A039);
        a=this.II(a,b,c,d,x[j+12],6,0x655B59C3);
        d=this.II(d,a,b,c,x[j+3],10,0x8F0CCC92);
        c=this.II(c,d,a,b,x[j+10],15,0xFFEFF47D);
        b=this.II(b,c,d,a,x[j+1],21,0x85845DD1);
        a=this.II(a,b,c,d,x[j+8],6,0x6FA87E4F);
        d=this.II(d,a,b,c,x[j+15],10,0xFE2CE6E0);
        c=this.II(c,d,a,b,x[j+6],15,0xA3014314);
        b=this.II(b,c,d,a,x[j+13],21,0x4E0811A1);
        a=this.II(a,b,c,d,x[j+4],6,0xF7537E82);
        d=this.II(d,a,b,c,x[j+11],10,0xBD3AF235);
        c=this.II(c,d,a,b,x[j+2],15,0x2AD7D2BB);
        b=this.II(b,c,d,a,x[j+9],21,0xEB86D391);
        a=this.addu(a,aa); b=this.addu(b,bb); c=this.addu(c,cc); d=this.addu(d,dd);
        }
        return (this.wordToHex(a)+this.wordToHex(b)+this.wordToHex(c)+this.wordToHex(d)).toLowerCase();
    };

    this.test = function()
    {
        if (this.hash('Dustin Fineout') == '8844be37f4e8b3973b48b95b0c69f0b1') {
        return true;
        }
        return false;
    };

    this.addu = function(x, y)
    {
        var ls = (x & 0xFFFF) + (y & 0xFFFF);
        return (((x >> 16) + (y >> 16) + (ls >> 16)) << 16) | (ls & 0xFFFF);
    };

    this.rol = function(v, s)
    {
        return (v << s) | (v >>> (32 - s));
    };

    this.utf8Encode = function(str)
    {
        return unescape(encodeURIComponent(str));
    };

    this.convertToWordArray = function(str)
    {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=new Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
        lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    this.wordToHex = function(lValue)
    {
        var wordToHexValue="",wordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
        lByte = (lValue>>>(lCount*8)) & 255;
        wordToHexValue_temp = "0" + lByte.toString(16);
        wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length-2,2);
        }
        return wordToHexValue;
    };
    }

    let md5 = new MD5()

    const protein_sequence = 'MTVLEITLAVILTLLGLAILAILLTRWARCKQSEMYISRYSSEQSARLLDYEDGRGSRHAYSTQSDTSYDNRERSKRDYTPSTNSLVSMASKFSLGQTELILLLMCFILALSRSSIGSIKCLQTTEEPPSRTAGAMMQFTAPIPGATGPIKLSQKTIVQTPGPIVQYPGSNAGPPSAPRGPPMAPIIISQRTARIPQVHTMDSSGKITLTPVVILTGYMDEELAKKSCSKIQILKCGGTARSQNSREENKEALKNDIIFTNSVESLKSAHIKEPEREGKGTDLEKDKIGMEVKVDSDAGIPKRQETQLKISEMSIPQGQGAQIKKSVSDVPRGQESQVKKSESGVPKGQEAQVTKSGLVVLKGQEAQVEKSEMGVPRRQESQVKKSQSGVSKGQEAQVKKRESVVLKGQEAQVEKSELKVPKGQEGQVEKTEADVPKEQEVQEKKSEAGVLKGPESQVKNTEVSVPETLESQVKKSESGVLKGQEAQEKKESFEDKGNNDKEKERDAEKDPNKKEKGDKNTKGDKGKDKVKGKRESEINGEKSKGSKRAKANTGRKYNKKVEE'; // can be accessed from protein_data values as reference is there, but If we send requests by typing the protein sequence, it won't be needed;

    let test_hash = md5.hash(protein_sequence)
    console.log(test_hash);
    return(
        <>
            <h1>
                Welcome

               
                    <Link to ='/protein/TSBP1'> go to TSBP1 </Link>

                    
        
            </h1>
        
        
        
        </>


    )

}


export default HomePage;