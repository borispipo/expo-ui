const path = require("path");
const fs = require("fs");
module.exports = {
    createDir : require("../electron/utils/createDir"),
    writeFile : require("../electron/utils/writeFile"),
    copy : require("../electron/utils/copy"),
    electronDir : path.resolve(__dirname, "..","electron"),
    exec : require("../electron/utils/exec"),
    thowError : (...args)=>{
        console.error(...args);
        process.exit(-1);
    },
    createDirSync : require("../electron/utils/createDirSync"),
}