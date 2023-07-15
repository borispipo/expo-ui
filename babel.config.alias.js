const path = require("path");
const fs = require("fs");
const writeFile = require("./electron/utils/writeFile");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const base = opts.base || process.cwd();
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || opts.alias && typeof opts.alias =='object' && opts.alias.$assets || assets;
    opts.base = opts.base || base;
    opts.withPouchDB = opts.withPouchDB !== false && opts.withPouchdb !== false ? true : false;
    delete opts.withPouchdb;
    const expoUI = require("./expo-ui-path")();
    const euCommon = path.resolve(expoUI,"node_modules","@fto-consult","common");
    const cpath = fs.existsSync(euCommon)? path.resolve(euCommon,"babel.config.alias") : "@fto-consult/common/babel.config.alias";
    const r = require(`${cpath}`)(opts);
    const expo = path.resolve(expoUI,"src");
    r["$ecomponents"] = r["$expo-components"] = path.resolve(expo,"components");
    r["$econfirm"] = path.resolve(r["$expo-components"],"Dialog","confirm");
    r["$confirm"] = r["$confirm"] || r["$econfirm"];
    r["$eauth"] = path.resolve(expo,"auth");
    r["$components"] = r["$components"] || r["$ecomponents"];
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$enavigation"] = path.resolve(expo,"navigation");
    r["$escreens"] = path.resolve(expo,"screens");
    ///les screens principaux de l'application
    r["$escreen"] = r["$eScreen"] = path.resolve(expo,"layouts/Screen");
    r["$eassets"] = path.resolve(dir,"assets");
    r["$ethemeSelectorComponent"] = path.resolve(expo,"auth","ThemeSelector");
    /*** le composant permettant de sélectionner un theme utilisateur */
    r["$themeSelectorComponent"] = r["$themeSelectorComponent"] || r["$ethemeSelectorComponent"];
    r.$tableLink = r.$TableLink = r["$etableLink"] = r["$eTableLink"] = path.resolve(r["$ecomponents"],"TableLink");
    
    r["$Screen"] = r["$Screen"] || r["$eScreen"];
    r["$screens"] = r["$screens"] || r["$escreens"];
    
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
    if(!r["$preloader"]){
        r["$preloader"] = r["$epreloader"];
    }
    if(!r["$enotify"]){
        r["$enotify"] = r["$cnotify"];
    }
    if(!r["$chart"]){
        r["$chart"] = r["$echart"];
    }
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
    ///le chemin racine du projet expo-ui
    r["$expo-ui-root-path"] = r["$expo-ui-root"]= path.resolve(expo,"..");

    const HelpScreen = path.resolve(r["$escreens"],"Help");
    /*** alias des termsOfUses */
    r.$eTermsOfUses = path.resolve(HelpScreen,"TermsOfUses","content");
    if(!r.$TermsOfUses){
        r.$TermsOfUses = r.$eTermsOfUses;
    }
    /*** alias des privacyPolicy */
    r.$ePrivacyPolicy = path.resolve(HelpScreen,"PrivacyPolicy","content");
    if(!r.$PrivacyPolicy){
        r.$PrivacyPolicy = r.$ePrivacyPolicy;
    }
    ///on génère les librairies open sources utilisées par l'application
    const root = path.resolve(r.$src,"..");
    const nModulePath = fs.existsSync(path.resolve(root,"node_modules")) && path.resolve(root,"node_modules") || fs.existsSync(path.resolve(r.$src,"node_modules")) && path.resolve(r.$src,"node_modules") || path.resolve(base,"node_modules");
    const nodeModulesPath = fs.existsSync(nModulePath) ? nModulePath : path.resolve(process.cwd(),"node_modules");
    const outputPath = path.resolve(HelpScreen,"openLibraries.js");
    r.$nodeModulesPath = r.$enodeModulesPath= nodeModulesPath;
    require("./find-licenses")({
        paths : [root,r["$expo-ui-root-path"]],
        nodeModulesPath : nodeModulesPath,
        outputPath
    });
    const $assets = r.$assets;
    const $electron = path.resolve(dir,"electron");
    const electronPaths = {
        ...r,
        sourceCode : r.$src,
        assets : $assets,
        images : r.$images,
        projectRoot : base,//la racine au projet
        electron : $electron,//le chemin racine electron
    };
    //le chemin ver le repertoire electron
    r.$eelectron = r["$e-electron"] = $electron;
    r.$electron = r.$electron || r.$eelectron;
    r.$econtext = path.resolve(expo,"context");
    if(!r.$context){
        r.$context = r.$econtext;
    }
    const electronAssetsPath = path.resolve(dir,"electron","assets");
    if($assets){
        const l1 = path.resolve($assets,"logo.png"), l2 = path.resolve($assets,"logo.png");
        const logoPath = fs.existsSync(l1)? l1 : fs.existsSync(l2)? l2 : undefined;
        const ePath = path.resolve(electronAssetsPath,"images","logo.png");
        if(logoPath && require("./electron/utils/createDir")(ePath)){
            fs.copyFileSync(logoPath,ePath,fs.constants.COPYFILE_FICLONE);
            electronPaths.logo = logoPath;
        }
    }
    const jsonPath = path.resolve(base,'package.json');
    if(fs.existsSync(jsonPath)){
        require("./electron/utils/copy")(jsonPath,path.resolve(dir,"electron","package.app.json"));
    }
    ///on sauvegarde les chemins des fichiers utiles, qui seront utilisées par la variable electron plus tard
    writeFile(path.resolve(dir,"electron","paths.json"),JSON.stringify(electronPaths));
    return r;
}