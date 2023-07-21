
//permet de retourner le contenu de la variable d'environnement .env de l'application//
module.exports = function(){
    const fs = require("fs");
    const path = require("path");
    try {
        const envPath = path.resolve(process.cwd(),".env");
        return fs.existsSync(envPath)? require("./parse-env")(fs.readFileSync(envPath,'utf8')) : {};
    } catch{}
    return {};
}