const path = require("path");
module.exports = {
    createDir : require("./createDir"),
    writeFile : require("./writeFile"),
    copy : require("./copy"),
    electronDir : path.resolve(__dirname, ".."),
    exec : require("./exec"),
    thowError : (...args)=>{
        console.error(...args);
        process.exit(-1);
    },
    createDirSync : require("./createDirSync"),
    ...require("./dependencies"),
    isObj : x=> typeof x =="object" && x && !Array.isArray(x),
}