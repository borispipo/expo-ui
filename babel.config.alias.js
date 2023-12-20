const path = require("path");
const fs = require("fs");
const writeFile = require("./electron/utils/writeFile");
const paths = require("./electron/utils/paths");
module.exports = (opts)=>{
    const isLocalDev = require("./is-local-dev")();
    const dir = path.resolve(__dirname);
    const projectRoot = typeof opts.projectRoot =='string' && fs.existsSync(opts.projectRoot.trim()) && opts.projectRoot.trim() || process.cwd();
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || opts.alias && typeof opts.alias =='object' && opts.alias.$assets || assets;
    opts.projectRoot = opts.projectRoot || projectRoot;
    opts.withPouchDB = opts.withPouchDB !== false && opts.withPouchdb !== false ? true : false;
    delete opts.withPouchdb;
    const expoUI = require("./expo-ui-path")();
    const euCommon = path.resolve(expoUI,"node_modules","@fto-consult","common");
    const cpath = fs.existsSync(euCommon)? path.resolve(euCommon,"babel.config.alias") : "@fto-consult/common/babel.config.alias";
    const r = require(`${cpath}`)(opts);
    const expo = path.resolve(expoUI,"src");
    r.$edocs = path.resolve(expoUI,"docs");//l'alias de la documentation
    r["$edocs-components"] = path.resolve(r.$edocs,"components");
    r["$edocs-screens"] = path.resolve(r.$edocs,"screens");
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
    r.$eutils = path.resolve(expo,"utils");
    r.$ehooks = path.resolve(expo,"context","hooks");
    ///le chemin racine du projet expo-ui
    r["$expo-ui-root-path"] = r["$expo-ui-root"]= path.resolve(expo,"..");
    
    const $assets = r.$assets;
    const $electron = path.resolve(dir,"electron");
    const electronPaths = {
        ...r,
        sourceCode : r.$src,
        assets : $assets,
        images : r.$images,
        projectRoot : projectRoot,//la racine au projet
        electron : $electron,//le chemin racine electron
    };
    //le chemin ver le repertoire electron
    r.$eelectron = r["$e-electron"] = $electron;
    r.$electron = r.$electron || r.$eelectron;
    r.$projectRoot = r.$eprojectRoot = projectRoot;
    r.$electronProjectRoot = path.resolve(r.$projectRoot,"electron");
    r.$econtext = path.resolve(expo,"context");
    r.$epdf = path.resolve(expo,"pdf");
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
    const expoUIElectronPath = path.resolve(projectRoot,"electron")
    const pathsSringified = JSON.stringify(electronPaths, null, "\t");
    ///on sauvegarde les chemins des fichiers utiles, qui seront utilisées par la variable electron plus tard
    try {
        writeFile(paths(projectRoot),pathsSringified);
    } catch{}
    if(fs.existsSync(expoUIElectronPath)){
        writeFile(path.resolve(expoUIElectronPath,"paths.json"),pathsSringified);
    }
    r["$erealm"] = path.resolve(expo,'realm');
    if(!r.$realm){
        r.$realm = r.$erealm;
    }
    const {withRealm} = opts; //si la prise en compte de la base de données realm est nécessaire
    const $realmProvider = path.resolve(r.$realm,"Provider");
    r.$erealmProvider = r.$realmProvider = false && !withRealm ? path.resolve($realmProvider,"realm.not-enabled.js") : $realmProvider;  
    return r;
}