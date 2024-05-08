const path = require('path');
let isObj = x => x && typeof x == 'object';
const fs = require('fs')
let openLibraries = {};
function isValidUrl(str) {
    if(!str || typeof str !== 'string') return false;
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

const  loopPackages = (packages,projectPath,nodeModulesPath)=>{
    if(!isObj(packages)) return;
    nodeModulesPath = typeof nodeModulesPath =='string' && nodeModulesPath ? nodeModulesPath : "";
    const p = path.resolve(projectPath,"node_modules");
    for(let i in packages){
        const packageRootPath = fs.existsSync(path.resolve(p,i))? path.resolve(p,i) : nodeModulesPath && fs.existsSync(path.resolve(nodeModulesPath,i)) ? path.resolve(nodeModulesPath,i) : null;
        if(!packageRootPath) continue;
        const packagePath = path.resolve(packageRootPath,"package.json");
        if(fs.existsSync(packagePath)){
            try {
                let package = require(packagePath);
                if(!isObj(package) || !package.name) return;
                let op = {};
                openLibraries[package.name] = op;
                if(package.version){
                    op.version = package.version;
                }
                if(isValidUrl(package.homepage)){
                    op.url = package.homepage
                } else if(isValidUrl(package.repository)) {
                    op.url = package.repository;
                } else if(isObj(package.repository) && package.repository.url){
                    op.url = package.repository.url;
                }
                if(package.license || package.licence){
                    op.license = typeof package.license =="string"? package.license : typeof package.licence =="string"? package.licence : "";
                }
            } catch(e){
                console.log(e," looking for package dep")
            }
        }
    }
}

const findLicences = (projectPath,nodeModulesPath)=> {
    if(projectPath && typeof projectPath =='string' && fs.existsSync(projectPath)){
        const packagePath = path.resolve(projectPath,"package.json");
        if(fs.existsSync(packagePath)){
            const packages = require(packagePath);
            if(isObj(packages)){                
                loopPackages(packages.devDependencies,projectPath,nodeModulesPath);
                loopPackages(packages.dependencies,projectPath,nodeModulesPath);
            }
        }
    }
}

const findLicencesMain = (options)=>{
    options = typeof options =='string'? {path:options} : typeof options =='object' && options ? options : {};
    if(!options || typeof options !='object'){
        options = {};
    }
    const {outputPath,nodeModulesPath} = options;
    const outputDir = outputPath && typeof outputPath =='string' && path.dirname(outputPath) || path.dirname(path.resolve(__dirname,"../src/screens/Help/OpenLibraryScreen"));
    if(outputDir && fs.existsSync(outputDir)){
        openLibraries = {};
        findLicences(path.resolve(__dirname),path.resolve(__dirname,"node_modules"));
        if(Array.isArray(options.paths)){
            options.paths.map((p)=>{
                if(p && typeof p =='string' && fs.existsSync(p)){
                    findLicences(p,nodeModulesPath)
                }
            })
        } else {
            findLicences(options.path,nodeModulesPath)
        }
        const s = Object.keys(openLibraries).sort((a,b)=>{
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
        const packageJSON = require("../package.json");
        const content = {
            [packageJSON.name] : {
                name : packageJSON.name,
                version : packageJSON.version,
                repository : packageJSON.repository,
                homepage : packageJSON.homepage,
            }
        };
        for(let i in  s){
            content[s[i]] = openLibraries[s[i]]
        }
        fs.writeFileSync(outputPath, "module.exports = "+JSON.stringify(content,null,"\t")+";");
    } else {
        return ({
            error : true,
            message : "Le chemin du fichier output est innexistant. veuillez spécifier un chemin de fichier existant dans lequel seront générées les licences utilisées pour le développement de l'application"
        });
    }
}

module.exports = (projectRoot)=>{
    ///on génère les librairies open sources utilisées par l'application
    projectRoot = typeof projectRoot === "string" && fs.existsSync(path.resolve(projectRoot)) ? path.resolve(projectRoot) : process.cwd();
    const expoUI = require("../expo-ui-path")(projectRoot);
    const localNodeModule = path.resolve(projectRoot,"node_modules");
    const HelpScreen = path.resolve(expoUI,"src","screens","Help");
    const outputPath = path.resolve(HelpScreen,"openLibraries.js");
    return findLicencesMain({
        paths : [projectRoot,path.resolve(__dirname)],
        nodeModulesPath : fs.existsSync(localNodeModule) ? localNodeModule :  path.resolve(expoUI,"node_modules"),
        outputPath
    });
}

module.exports();