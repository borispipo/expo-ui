/**** vérifie si l'application est en train d'exéccuter en environnement local, mode test 
    du framework expo-ui
*/
const path = require("path");
module.exports = x=> path.resolve(process.cwd()) == path.resolve(__dirname);