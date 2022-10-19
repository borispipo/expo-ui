import { registerRootComponent } from 'expo';
const expoPath = (require("./expo-ui-production-path")+"/").replace("//","/");
const appConfigPath = expoPath+"node_modules/@fto-consult/common/src/app/config";
console.log(expoPath," is expo path found heinnnnn ",appConfigPath," and expo app is ",expoPath+'src/App');
const appConfig = require (appConfigPath);

const isObj = x=>typeof x =='object' && x && !Array.isArray(x);
const defaultObj = x=> isObj(x)? x : {};

/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function registerExpoUIApp (options){
    options = defaultObj(options);
    const config = defaultObj(options.config);
    appConfig.current = config;
    registerRootComponent(require(expoPath+'src/App').default(options));
}
