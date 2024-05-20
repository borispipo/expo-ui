/****
    upgrade to expo sdk version 51, @see : https://expo.dev/changelog/2024/05-07-sdk-51
    
*/
module.exports = ({version,dependencies,packageObj,currentVersion,devDependencies,packageManager,depreciatedDependencies,projectRoot})=>{
    console.log("Avant de lancer le programme de mise à jour, vous devez installer le package concurrently en exécutant la commande : npm i -D concurrently");
    const {exec} = require("@fto-consult/node-utils");
    return new Promise((resolve,reject)=>{
        exec(`npm i -D concurrently`,{projectRoot}).finally(()=>{
            console.log("upgrading to expo sdk 51");
            return exec(`concurrently "npm i -g eas-cli" "npx expo install expo@^51.0.0 --fix" "npx expo-doctor@latest"`,{projectRoot}).then(resolve).catch(reject);
        });
    });
}