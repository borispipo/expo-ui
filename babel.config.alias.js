const path = require("path");
const fs = require("fs");

module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const isDev = String(process.env.NODE_ENV).toLowerCase() !="production";
    const projectRoot = typeof opts.projectRoot =='string' && fs.existsSync(opts.projectRoot.trim()) && opts.projectRoot.trim() || process.cwd();
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || opts.alias && typeof opts.alias =='object' && opts.alias.$assets || assets;
    opts.projectRoot = opts.projectRoot || projectRoot;
    opts.withPouchDB = opts.withPouchDB !== false && opts.withPouchdb !== false ? true : false;
    delete opts.withPouchdb;
    const expoUI = require("./expo-ui-path")();
    const cPath = isDev && fs.existsSync(path.resolve(expoUI,"node_modules","@fto-consult","common"))? path.resolve(expoUI,"node_modules","@fto-consult","common") : null; 
    const r = require(`${cPath ? path.resolve(cPath,"babel.config.alias.js"):'@fto-consult/common/babel.config.alias'}`)(opts);
    const expo = path.resolve(expoUI,"src");
    r["$ecomponents"] = r["$expo-components"] = path.resolve(expo,"components");
    r["$econfirm"] = path.resolve(r["$expo-components"],"Dialog","confirm");
    if(!r.$confirm){
        r.$confirm = r.$econfirm;
    }
    r["$eauth"] = path.resolve(expo,"auth");
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$enavigation"] = path.resolve(expo,"navigation");
    r["$escreens"] = path.resolve(expo,"screens");
    r["$eview-shot"] = path.resolve(expo,"view-shot");
    ///les screens principaux de l'application
    r["$escreen"] = r["$eScreen"] = path.resolve(expo,"layouts/Screen");
    r["$eassets"] = path.resolve(dir,"assets");
    r["$ethemeSelectorComponent"] = path.resolve(expo,"auth","ThemeSelector");
    /*** le composant permettant de sélectionner un theme utilisateur */
    r["$themeSelectorComponent"] = r["$themeSelectorComponent"] || r["$ethemeSelectorComponent"];
    r.$tableLink = r.$TableLink = r["$etableLink"] = r["$eTableLink"] = path.resolve(r["$ecomponents"],"TableLink");
    
    r["$Screen"] = r["$Screen"] || r["$eScreen"];
    r["$expo"] = r["$expo-ui"] = expo;
    r["$epreloader"] = path.resolve(expo,"components/Preloader");
    r["$eform"] = path.resolve(expo,"components","Form");

    r["$form"] = r["$form"] || r["$eform"];
    r["$eform-data"] = r["$eformData"]= path.resolve(expo,"components","Form","FormData");
    r["$formData"] = r["$formData"] || r["$eformData"];
    r["$eform-manager"] = path.resolve(expo,"components","Form/utils/FormManager");
    r["$echart"] = path.resolve(expo,"components","Chart");
    r["$efile-system"] = path.resolve(expo,"media","file-system");
    r["$eAssets"] = path.resolve(expo,"media","Assets");
    if(!r["$screen"]){
        r["$screen"] = r["$escreen"];
    }
    if(!r["$preloader"] || r["$preloader"] === r["$cpreloader"]){
        r["$preloader"] = r["$epreloader"];
    }
    r["$enotify"] = r["$cnotify"];
    if(!r["$file-system"]){
        r["$file-system"] = r["$efile-system"];
    }
    ///si l'alias $navigation n'a pas été définie par défaut, alors celui cet allias prendra la même valeur que celle de $envigation
    if(r["$navigation"] == r["$cnavigation"]){
        r["$navigation"] = r["$enavigation"];
    }
    if(typeof opts.mutator =='function'){
        opts.mutator(r);
    }
    r.$eutils = path.resolve(expo,"utils");
    r.$ehooks = path.resolve(expo,"context","hooks");
    r["$expo-ui-root-path"] = r["$expo-ui-root"]= path.resolve(expo,"..");
    const $electron = path.resolve(dir,"electron");
    //le chemin ver le repertoire electron
    r.$eelectron = r["$e-electron"] = $electron;
    r.$electron = r.$electron || r.$eelectron;
    r.$projectRoot = r.$eprojectRoot = projectRoot;
    r.$electronProjectRoot = path.resolve(r.$projectRoot,"electron");
    r.$econtext = path.resolve(expo,"context");
    r.$epdf = path.resolve(expo,"pdf");
    r.$session = path.resolve(expo,"session");
    return r;
}