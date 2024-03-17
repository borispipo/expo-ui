const fs = require("fs");
const path = require("path");
const projectRoot = process.cwd();
const {exec,writeFile,isPlainObj} = require("@fto-consult/node-utils");
const dependencies = require("./create-app/dependencies");
const dependenciesArr = Object.keys(dependencies);
const dependenciesPath = path.resolve(__dirname,"create-app","dependencies.js")
const mainJSONPath = path.resolve(projectRoot,"package.json");
const euiPackageJSON = require("../package.json");
const euDevDependencies = isPlainObj(euiPackageJSON?.devDependencies) ? euiPackageJSON?.devDependencies : {};
if(fs.existsSync(mainJSONPath)){
    const packageObj = JSON.parse(fs.readFileSync(mainJSONPath));
    const packageDev = typeof packageObj?.dependencies =="object" && packageObj?.dependencies || {};
    const devDependencies = [];
    const filterdDObj = {};
    dependenciesArr.filter((v,index)=>{
        if(euDevDependencies[packageDev[v]]){
            devDependencies.push(packageDev[v]);
        } else if((!!packageDev[v] && v !=="expo") || ["expo-intent-launcher"].includes(v)){
            filterdDObj[v] = true;
            return true;
        }
        return false;
    });
    const filteredDeps = Object.keys(filterdDObj);
    if(filteredDeps.length){
        exec(`npm install @fto-consult/expo-ui@latest expo@latest`,{projectRoot}).finally(()=>{
            exec(`npx expo install ${filteredDeps.join(" ")}`,{projectRoot}).finally((i)=>{
                (new Promise((resolve)=>{
                    devDependencies.length ? exec(`npm uninstall ${devDependencies.join(" ")}`,{projectRoot}).finally(()=>{
                        exec(`npm install -D ${devDependencies.join(" ")}`,{projectRoot}).finally(resolve);
                    }) : resolve({});
                })).finally(()=>{
                    const newPackageJS = JSON.parse(fs.readFileSync(mainJSONPath));
                    let hasChanged = false;
                    if(newPackageJS?.dependencies && typeof newPackageJS?.dependencies =="object"){
                        for(let i in dependencies){
                            const old = dependencies[i];
                            dependencies[i] = newPackageJS?.dependencies[i] || dependencies[i];
                            if(!hasChanged && dependencies[i] !== old){
                                hasChanged = true;
                            }
                        }
                    }
                    if(hasChanged){
                        try {
                            writeFile(dependenciesPath,`
    module.exports = ${JSON.stringify(dependencies,null,"\t")};
                            `)
                        } catch(e){
                            console.log(e," is generated error");
                        }
                    }
                //})
                })
            });    
        })
    } else {
        console.log("Aucune dépendence expo à mettre à jour");
    }
} else {
    console.error(`Le fichier ${mainJSONPath} de l'application est inexistant. impossible de mettre à jour les packages @fto-consult/expo-ui`)
}
