// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


module.exports.decycle = function decycle(obj, stack = []) {
    if(typeof obj ==='function') return undefined;
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);
    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}

module.exports.stringify = function(jsonObj,decylcleVal){
    return isJSON(jsonObj) ? jsonObj : JSON.stringify(decylcleVal !== false ? decycle(jsonObj) : jsonObj);
}

module.exports.isJSON = function (json_string){
    if(!json_string || typeof json_string != 'string') return false;
    var text = json_string;
    return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(text.replace(/"(\\.|[^"\\])*"/g, '')));
}

/***
 * parse JSON string recursively
 * @param {string} json string to parse
 * @return {object} or null, parse json
 */
 module.exports. parseJSON  = function(jsonStr){
    if(!isJSON(jsonStr)) {
        if(jsonStr && typeof(jsonStr) == 'object'){
            for(var i in jsonStr){
                jsonStr[i] = parseJSON(jsonStr[i]);
            }
        }
        return jsonStr;
    }
    try {
        jsonStr = JSON.parse(jsonStr);
        if(jsonStr && typeof(jsonStr) == 'object'){
            for(var i in jsonStr){
                jsonStr[i] = parseJSON(jsonStr[i]);
            }
        }
    } catch(e){
        return jsonStr;
    }
    return jsonStr;
}