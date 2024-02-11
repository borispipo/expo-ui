const fs = require("fs");
const projectRoot = process.cwd();
const {exec,writeFile} = require("@fto-consult/node-utils");
const dependencies = require("./create-app/dependencies");
const scripts = Object.keys(dependencies).join(" ");
const devDependencies = require("./create-app/devDependencies").join(" ");

exec(`npm install expo @fto-consult/expo-ui@latest`,{projectRoot}).finally(()=>{
    exec(`npx expo install ${scripts} --fix`,{projectRoot}).finally((i)=>{
        exec(`npm install -D ${devDependencies}`,{projectRoot}).then((i)=>{
            console.log("packages installés avec succès!!");
        });   
    });    
})