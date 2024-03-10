const fs = require("fs");
const path = require("path");
const projectRoot = process.cwd();
const {exec,writeFile} = require("@fto-consult/node-utils");
const dependencies = require("./create-app/dependencies");
const dependenciesArr = Object.keys(dependencies);
const dependenciesPath = path.resolve(__dirname,"create-app","dependencies.js")
const mainJSONPath = path.resolve(projectRoot,"package.json");
if(fs.existsSync(mainJSONPath)){
    const packageObj = JSON.parse(fs.readFileSync(mainJSONPath));
    const packageDev = typeof packageObj?.dependencies =="object" && packageObj?.dependencies || {};
    const filterdDObj = {};
    dependenciesArr.filter((v,index)=>{
        if((!!packageDev[v] && v !=="expo") || ["expo-intent-launcher"].includes(v)){
            filterdDObj[v] = true;
            return true;
        }
        return false;
    });
    const filteredDeps = Object.keys(filterdDObj);
    if(filteredDeps.length){
        exec(`npm install expo@latest`,{projectRoot}).finally(()=>{
            let i = -1;
            const next = ()=>{
                return exec(`npx expo install ${filteredDeps.join(" ")}`,{projectRoot}); 
                i++;
                if(i>= filteredDeps.length) return Promise.resolve();
                const script = filteredDeps[i];
                return exec(`npx expo install ${script}`,{projectRoot}).finally(next);  
            }
            next().finally((i)=>{
                //exec(`npm install`,{projectRoot}).finally(()=>{
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
            });    
        })
    } else {
        console.log("Aucune dépendence expo à mettre à jour");
    }
} else {
    console.error(`Le fichier ${mainJSONPath} de l'application est inexistant. impossible de mettre à jour les packages @fto-consult/expo-ui`)
}
