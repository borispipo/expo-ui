const path = require("path");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || opts.alias && typeof opts.alias =='object' && opts.alias.$assets || assets;
    opts.base = opts.base || dir;
    opts.withPouchDB = opts.withPouchDB !== false && opts.withPouchdb !== false ? true : false;
    delete opts.withPouchdb;
    const r = require(`@fto-consult/common/babel.config.alias`)(opts);
    const expo = require("./lookup-expo-ui-path")()?path.resolve(r.$src,"..","expo-ui","src") : path.resolve(dir,"src");
    r["$eauth"] = path.resolve(expo,"auth");
    r["$ecomponents"] = r["$expo-components"] = path.resolve(expo,"components");
    r["$components"] = r["$components"] || r["$ecomponents"];
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$enavigation"] = path.resolve(expo,"navigation");
    r["$escreens"] = path.resolve(expo,"screens");
    r["$emainScreens"] = path.resolve(expo,"screens","mainScreens");
    ///les screens principaux de l'application
    r["$mainScreens"] = r["$mainScreens"] || r["$emainScreens"];
    r["$escreen"] = r["$eScreen"] = path.resolve(expo,"layouts/Screen");
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
    return r;
}