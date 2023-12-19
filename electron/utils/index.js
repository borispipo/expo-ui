const path = require("path");
module.exports = {
    createDir : require("./createDir"),
    writeFile : require("./writeFile"),
    copy : require("./copy"),
    electronDir : path.resolve(__dirname, ".."),
    paths : require("./paths"),
    exec : require("./exec"),
    throwError : (...args)=>{
        console.error(...args);
        process.exit(-1);
    },
    isValidUrl : require("./isValidUrl"),
    createDirSync : require("./createDirSync"),
    ...require("./dependencies"),
    isObj : x=> typeof x =="object" && x && !Array.isArray(x),
}