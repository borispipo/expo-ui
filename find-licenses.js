const path = require('path');
const dir = path.resolve(__dirname);
let filePath = path.resolve(dir,"src/help/openLibraries.js")
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

const  loopPackages = (packages,_path)=>{
    if(!isObj(packages)) return;
    let p = path.resolve(_path,"node_modules");
    for(let i in packages){
        let packagePath = path.resolve(p,i,"package.json");
        if(fs.existsSync(packagePath)){
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
        }
    }
}

const findLicences = (_path)=> new Promise((resolve,reject)=>{
    let pD = path.resolve(_path,"package.json");
    if(fs.existsSync(pD)){
        let packages = require(pD);
        if(isObj(packages)){
            loopPackages(packages.devDependencies,_path);
            loopPackages(packages.dependencies,_path);
        }
    }
    resolve(openLibraries);
})
const parentPath = require("./parent-package");
Promise.all([
    parentPath ? path.resolve(path.dirname(parentPath)): findLicences(dir),
]).then(()=>{
    let s = Object.keys(openLibraries).sort((a,b)=>{
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;
    });
    let content = {};
    for(let i in  s){
        content[s[i]] = openLibraries[s[i]]
    }
    content = "export default "+JSON.stringify(content);
    fs.writeFileSync(filePath, content)
});