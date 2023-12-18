const getIcon = require("../electron/utils/getIcon");
const path = require("path");
const path = require("../electron/utils/paths");
const defaultFunc = (cb,cb2) => typeof cb =='function' ? cb : typeof cb2 ==='function'? cb2 : x=> x;
const paths = require("../electron/paths.json");
const images = paths.$images, assets = paths.$assets, logo = paths.logo;
const createDir = require("../electron/utils/createDir");
const fs = require("fs");
const getDirname = require("../electron/utils/getDirname");
const copy = require("../electron/utils/copy");

/***@see : https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html */
module.exports = function package(opts){
    opts = typeof opts =="object" && !Array.isArray(opts) && opts || {};
    const {projectRoot:pRoot,...options} = opts;
    options.dir = typeof options.dir =='string' && options.dir || typeof options.srcDir =='string' && options.srcDir || typeof options.src =='string' && options.src || undefined;
    const projectRoot = pRoot || options.dir;
    if(typeof projectRoot !='string' || !projectRoot || !fs.existsSync(projectRoot)){
        return Promise.reject({
            message :'projectRoot not defined!! or its invalid '+projectRoot
        })
    }
    const packagerPath = path.resolve(projectRoot,"node_modules","electron-packager");
    if(!fs.existsSync(packagerPath)){
        return Promise.reject({
            message : "packager module not found!! you must initialize your project before to package it; packager path : "+packagerPath,
        })
    }
    const packager = require(`${packagerPath}`);
    options.afterAsar = defaultFunc(options.afterAsar,()=>{});
    options.afterComplete = defaultFunc(options.afterComplete,()=>{});
    options.afterCopy = defaultFunc(options.afterCopy);
    options.appVersion = typeof options.appVersion =='string' && options.appVersion || typeof options.version =='string' && options.version || undefined;
    options.arch = typeof options.arch =='string' && options.arch || process.arch;
    options.asar = typeof options.asar =='boolean'? options.asar : true;
    return new Promise((resolve,reject)=>{
        if(!options.dir || !fs.existsSync(options.dir)){
            return reject({message:"Repertoire source ["+options.dir+"] innexistant!! Veuillez spécifier un répertoire source valide"});
        }
        options.out = typeof options.out =="string" && options.out || typeof options.distDir =="string" && options.distDir || typeof options.dist =='string' && options.dist || undefined;
        if(options.out){
            createDir(options.out);
        }
        options.overwrite = typeof options.overwrite =='boolean'? options.overwrite : true;
        options.platform = typeof options.platform =='string' && options.platform || process.platform;
        options.prune = typeof options.prune =='boolean'? options.prune : true;
        options.quiet = typeof options.quiet =='boolean'? options.quiet : false;
        options.tmpdir = options.tmpdir === false ? false : typeof options.tmpdir =='string' && options.tmpdir || undefined;
        options.icon = options.icon && typeof options.icon =='string' && fs.existsSync(options.icon) && options.icon || getIcon([
            logo && fs.existsSync(logo) && getDirname(logo),
            images && getDirname(images) || '',
            assets && getDirname(assets) || '',
            options.dir && getDirname(options.dir)
        ]);
        return packager(options).then((appPaths)=>{
            console.log(`Electron app bundles created at : ${appPaths.join("\n")}`);
            resolve(appPaths);
        }).catch(reject);
    })
}