/***
    génère le fichier jsconfig.json de vs code pour notemment spécifier les emplacements des alias et autres
*/
const {writeFile,JSONFileManager,extendObj,isNonNullString} = require("@fto-consult/node-utils");
const fs = require("fs");
const path = require("path");

/****
    génière les alias dans le fichier jsconfig.json
    @param {
        projectRoot {string}, le projectRoot
        compilerOptions {obj}, les options de compilerOptions,
        alias | paths {object}, les alias de l'application
    }
*/
module.exports = function generateJSONConfig(opts){
    opts = Object.assign({},opts);
    const alias = extendObj({},opts.alias,opts.paths);
    const projectRoot = opts.projectRoot && typeof opts.projectRoot ==="string" && fs.existsSync(path.resolve(opts.projectRoot)) && path.resolve(opts.projectRoot) || process.cwd();
    const jsconfigPath = path.resolve(projectRoot,"jsconfig.json");
    if(!fs.existsSync(jsconfigPath)){
        try {
            writeFile(jsconfigPath,`{}`);
        } catch(e){
            console.log("generatingn jsconfig.json file on path",jsconfigPath);
        }
    }
    if(!fs.existsSync(jsconfigPath)) {
        console.log("unable to generate jsconfig.json on path "+jsconfigPath);
        return;
    }
    const paths = {};
    const JManager = JSONFileManager(jsconfigPath);
    if(JManager.hasPackage){
        const baseUrl = path.resolve(projectRoot);
        let hasFoundAlias = false;
        for(let i in alias){
            const alia = alias[i];
            const p = Array.isArray(alia) && alia.length && alia || isNonNullString(alia) && alia.split(",") || undefined;
            let aliasIndex = String(i);
            if(Array.isArray(p)){
                const rAlias = [];
                p.map((a)=>{
                    if(!isNonNullString(a)) return;
                    const aa = path.resolve(a);
                    if(!fs.existsSync(aa)) return;
                    const lstat = fs.lstatSync(aa);
                    let np = path.relative(baseUrl,aa).trim().split("\\").join("/");
                    if(lstat.isDirectory() && !lstat.isFile()){
                        np = np.trim().rtrim("/*").rtrim("/").rtrim("\\").trim();
                        if(!np){
                            np = "./*"
                        } else if(!np.endsWith("/*")){
                            np+="/*";
                        }
                        aliasIndex = aliasIndex.rtrim("/*").rtrim("/").rtrim("\\")+"/*";
                    }
                    if(np){
                        rAlias.push(np);
                    }
                });
                if(rAlias.length){
                    paths[aliasIndex] = rAlias;
                    hasFoundAlias = true;
                }
            }
        }
        const excludeA = JManager.get("exclude");
        const jEx = Array.isArray(excludeA)? excludeA : [];
        ["node_modules", "build", "dist","out","web-build"].map((a)=>{
            if(!jEx.includes(a)){
                jEx.push(a);
            }
        });
        JManager.set("compilerOptions",extendObj(true,{},JManager.get("compilerOptions"),{
            paths,
            baseUrl : "./",
        },opts.compilerOptions));
        JManager.set("exclude",jEx);
        JManager.persist();
        if(!hasFoundAlias){
            console.log("not valid alias to update in jsonconfig.json on path "+jsconfigPath);
        }
        console.log("jsconfig.json successfull created on path "+jsconfigPath);
    } 
}