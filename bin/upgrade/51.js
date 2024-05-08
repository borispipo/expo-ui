/****
    upgrade to expo sdk version 51, @see : https://expo.dev/changelog/2024/05-07-sdk-51
*/
module.exports = ({version,dependencies,packageObj,currentVersion,devDependencies,packageManager,depreciatedDependencies,projectRoot})=>{
    const {exec} = require("@fto-consult/node-utils");
    return new Promise((resolve,reject)=>{
        console.log("Updating eas cli : npm i -g eas-cli");
        const runExec = async (command)=>{
            return await exec(command,{projectRoot});
        };
        runExec(`npm i -g eas-cli`).finally(()=>{
            console.log("installing expo sdk 51 : npx expo install expo@^51.0.0 --fix");
            runExec(`npx expo install expo@^51.0.0 --fix`).finally(()=>{
                console.log("fix expo doctor : npx expo-doctor@latest");
                runExec(`npx expo-doctor@latest`,{projectRoot}).then(resolve).catch(reject);
            });
        });
    })
}