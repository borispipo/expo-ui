import { registerRootComponent } from 'expo';


/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function ExpoUIApp (options){
    const expoUIPath = require("./expo-ui-production-path");
    if(expoUIPath && !expoUIPath.includes("@fto-consult/")){
        const path = (expoUIPath+"/").replace("//","/")+"src/index";
        console.log("found local expo-ui dev index path at ",path," from expo-ui path : ",expoUIPath);
        return require(`${path}`).default(options);
    }
    const appConfig = require("$capp/config").default;
    options = options && typeof options =='object' && !Array.isArray(options)? options : {};
    const config = defaultObj(options.config);
    appConfig.current = config;
    registerRootComponent(require('./src/App').default(options));
}
