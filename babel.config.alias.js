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
    
    /**** package json */
    const packagePath = path.resolve(base,"package.json");
    const configPath = path.resolve(expo,"app.config.json");
    if(fs.existsSync(packagePath)){
        try {
            const packageObj = require(`${packagePath}`);
            if(typeof packageObj.name =="string"){
                packageObj.name = packageObj.name.toUpperCase();
            }
            if(packageObj){
                ["scripts","private","main","repository","keywords","bugs","dependencies","devDependencies"].map(v=>{
                    delete packageObj[v];
                })
                fs.writeFileSync(configPath,JSON.stringify(packageObj,null,"\t"));
            }
        } catch (e){
            console.log(e," writing file sync on package JSON, file : $common/babel.config.alias")
        }
    }
    if(fs.existsSync(configPath)){
        r["$package.json"] = r["$packageJSON"] = configPath;
    }
    
    r["$ecomponents"] = r["$expo-components"] = path.resolve(expo,"components");
    r["$econfirm"] = path.resolve(r["$expo-components"],"Dialog","confirm");
    r["$confirm"] = r["$confirm"] || r["$econfirm"];
    r["$eauth"] = path.resolve(expo,"auth");
    r["$etableLink"] = r["$eTableLink"] = path.resolve(r["$ecomponents"],"TableLink");
    r.$tableLink = r.$TableLink = r.$tableLink || r.$TableLink || path.resolve(r.$etableLink,"default");
    r["$components"] = r["$components"] || r["$ecomponents"];
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$enavigation"] = path.resolve(expo,"navigation");
    r["$escreens"] = path.resolve(expo,"screens");
    r["$emainScreens"] = path.resolve(expo,"screens","mainScreens");
    ///les screens principaux de l'application
    r["$mainScreens"] = r["$mainScreens"] || r["$emainScreens"];
    r["$escreen"] = r["$eScreen"] = path.resolve(expo,"layouts/Screen");
    r["$eTableDataScreen"] = path.resolve(expo,"layouts","Screen","TableData");
    r["$TableDataScreen"] = r["$tableDataScreen"] = r["$TableDataScreen"] || r["$tableDataScreen"] || r["$eTableDataScreen"]
    r["$eassets"] = path.resolve(dir,"assets");
    r["$ethemeSelectorComponent"] = path.resolve(expo,"auth","ThemeSelector");
    /*** le composant permettant de sélectionner un theme utilisateur */
    r["$themeSelectorComponent"] = r["$themeSelectorComponent"] || r["$ethemeSelectorComponent"];

    r["$Screen"] = r["$Screen"] || r["$eScreen"];
    ///pour personnaliser les écrans de l'application, il suffit de redefinir l'alis $screens, pointant vers le repertoire racine des écrans personnalisés
    ///cependant, ce repertoire doit contenir un fichier mainScreens.js qui contient la liste de tous les écrans de lapplicaiton
    r["$screens"] = r["$screens"] || r["$escreens"];
    
    r["$expo"] = r["$expo-ui"] = expo;
    r["$epreloader"] = path.resolve(expo,"components/Preloader");
    r["$eform"] = path.resolve(expo,"components","Form");

    //l'alias $extendFormFields, pour étendre les formFields qu'on veut définir
    r["$extendFormFields"] = r["$extendFormFields"] || path.resolve(r["$eform"],"Fields","$extendFormFields")
    
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
    /*** cet alias est utilisé pour modifier les différents items par défaut, rendu par le composant Drawer
     *  l'alias @drawerItems doit retourner en default, soit un tableau où un objet d'objet où une fonction
     * si c'est une fonction, alors la function est exécutée pour obtenir la liste des items à utiliser par le drawer principal
     */
    if(!r["$drawerItems"]){
        r["$drawerItems"] = path.resolve(expo,"navigation","Drawer","items","default")
    }
    ///si l'alias $navigation n'a pas été définie par défaut, alors celui cet allias prendra la même valeur que celle de $envigation
    if(r["$navigation"] == r["$cnavigation"]){
        r["$navigation"] = r["$enavigation"];
    }
    if(r["$loginComponent"] == r["$cloginComponent"]){
        r["$loginComponent"] = path.resolve(expo,"auth","Login");
    }

    /*** alias pour le composant logo par défaut :  */
    r["$elogoComponent"] = path.resolve(expo,"components","Logo","defaultComponent");
    if(!r["$logoComponent"]){
        r["$logoComponent"] = r["$elogoComponent"];
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
    const outputPath = path.resolve(HelpScreen,"openLibraries.js");
    require("./find-licenses")({
        paths : [root,r["$expo-ui-root-path"]],
        nodeModulesPath : path.resolve(root,"node_modules"),
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