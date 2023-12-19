// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/***
* generate uid : uid(16) generate uid with 16 max  characters
* uid("prefix",16) generate uid with max 16 chars and having prefix like prefix
* 
* @param {type} prefix
* @param {type} idStrLen
* @param {type} separator
* @returns {String|Number|uid.idStr}
*/
module.exports =  function uniqid (prefix,idStrLen,separator) {
    if(typeof prefix == "number" & typeof idStrLen == "undefined"){
        idStrLen = prefix
        prefix = ""
    }
    separator = typeof separator =="string" && separator ? separator : "";
    prefix =  typeof prefix =="string" && prefix ? prefix : "";
    if(typeof idStrLen !=='number') idStrLen = idStrLen-prefix.length;
    if(idStrLen <= 0) idStrLen = 16;
    idStrLen = Math.floor(idStrLen);
    // always start with a letter -- base 36 makes for a nice shortcut
    var idStr = prefix+(Math.floor((Math.random() * 25)) + 10).toString(36) + separator;
    // add a timestamp in milliseconds (base 36 again) as the base
    idStr += (new Date()).getTime().toString(36) + separator;
    // similar to above, complete the Id using random, alphanumeric characters
    do {
        idStr += (Math.floor((Math.random() * 35))).toString(36);
    } while (idStr.length < idStrLen);
    return (idStr);
}