const {exec,thowError,writeFile} = require("./utils");
const fs = require("fs"), path = require("path");
const createAppDir = path.resolve(__dirname,"create-app");
module.exports = function(parsedArgs,{projectRoot}){
    const packageObj = require("../package.json");
    const root = process.cwd(), mainPackagePath = path.resolve(root,"package.json");
    const mainPackage = fs.existsSync(mainPackagePath) && require(`${mainPackagePath}`) || null;
    if(!mainPackage || !mainPackage.name){
        thowError("Nom de l'application invalide. Rassurez vous d'exécuter l'application dans un répertoire valide."," package : ",mainPackage);
        return;
    }
    const name = String(parsedArgs.name||mainPackage.name).trim();
    if(!name){
        return thowError(name," nom de l'application invalide, veuillez spécifier un nom d'application valide");
    }
    const devDpendencies = packageObj.devDependencies;
    const deps = devDpendencies && typeof devDpendencies =="object" && Object.keys(devDpendencies).join(" ");
    new Promise((resolve,reject)=>{
        if(typeof deps =="string" && deps){
            console.log("installing dev dependencies ....");
            return exec(`npm i -D ${deps}`).then(resolve).catch(reject);
        }
        return resolve({});
    }).then(()=>{}).finally(()=>{
        console.log("creating application .....");
        createEntryFile(projectRoot);
        [path.join(projectRoot,"babel.config.js"),path.join(projectRoot,"metro.config.js"),path.join(projectRoot,"webpack.config.js")].map((p)=>{
            if(!fs.existsSync(p)){
                const file = path.basename(p);
                writeFile(p,fs.readFileSync(`${path.join(createAppDir,file)}`));
            }
        });
        process.exit();
    });
}

const createEntryFile = (projectRoot)=>{
    const mainEntry = path.join(projectRoot,"index.js");
    if(!fs.existsSync(mainEntry)){
        console.log("creating main entry ... on path",path.join(createAppDir,"registerApp.js"));
        writeFile(mainEntry,fs.readFileSync(path.join(createAppDir,"registerApp.js")));
        return true;
    }
    return false;
}