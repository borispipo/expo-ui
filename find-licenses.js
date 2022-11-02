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

const  loopPackages = (packages,projectPath)=>{
    if(!isObj(packages)) return;
    let p = path.resolve(projectPath,"node_modules");
    for(let i in packages){
        let packagePath = path.resolve(p,i,"package.json");
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

const findLicences = (projectPath)=> {
    if(projectPath && typeof projectPath =='string' && fs.existsSync(projectPath)){
        const packagePath = path.resolve(projectPath,"package.json");
        if(fs.existsSync(packagePath)){
            const packages = require(packagePath);
            if(isObj(packages)){                
                loopPackages(packages.devDependencies,projectPath);
                loopPackages(packages.dependencies,projectPath);
            }
        }
    }
}
module.exports = (options)=>{
    options = typeof options =='string'? {path:options} : typeof options =='object' && options ? options : {};
    if(!options || typeof options !='object'){
        options = {};
    }
    const {outputPath} = options;
    const outputDir = outputPath && typeof outputPath =='string' && path.dirname(outputPath) || '';
    if(outputDir && fs.existsSync(outputDir)){
        openLibraries = {};
        if(Array.isArray(options.paths)){
            options.paths.map((p)=>{
                if(p && typeof p =='string' && fs.existsSync(p)){
                    findLicences(p)
                }
            })
        } else {
            findLicences(options.path)
        }
        const s = Object.keys(openLibraries).sort((a,b)=>{
            if (a.toLowerCase() < b.toLowerCase()) return -1;
            if (a.toLowerCase() > b.toLowerCase()) return 1;
            return 0;
        });
        const content = {};
        for(let i in  s){
            content[s[i]] = openLibraries[s[i]]
        }
        fs.writeFileSync(outputPath, "export default "+JSON.stringify(content));
    } else {
        return ({
            error : true,
            message : "Le chemin du fichier output est innexistant. veuillez spécifier un chemin de fichier existant dans lequel seront générées les licences utilisées pour le développement de l'application"
        });
    }
}