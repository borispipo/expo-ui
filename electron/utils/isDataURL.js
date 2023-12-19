const isDataURLRegex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)$/i;

function isDataURL(s) {
    return s && typeof s ==='string' && !s.includes("data:image/x-icon") && !!s.match(isDataURLRegex);
}

isDataURL.toBase64 = (dataURLStr)=>{
    if(!isDataURL(dataURLStr)) return undefined;
    return dataURLStr.replace(/^data:.+;base64,/, '')
}

module.exports = isDataURL;

