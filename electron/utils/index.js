const path = require("path");
module.exports = {
    createDir : require("./createDir"),
    writeFile : require("./writeFile"),
    copy : require("./copy"),
    electronDir : path.resolve(__dirname, ".."),
    paths : require("./paths"),
    exec : require("./exec"),
    uniqid : require("./uniqid"),
    debounce : require("./debounce"),
    throwError : (...args)=>{
        console.error(...args);
        process.exit(-1);
    },
    json : require("./json"),
    replaceAll : require("./replaceAll"),
    isBase64 : require("./isBase64"),
    isDataURL : require("./isDataURL"),
    dataURLToBase64 : require("./isDataURL").toBase64,
    isValidUrl : require("./isValidUrl"),
    createDirSync : require("./createDirSync"),
    ...require("./dependencies"),
    isObj : x=> typeof x =="object" && x && !Array.isArray(x),
}