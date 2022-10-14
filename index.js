import { registerRootComponent } from 'expo';
import appConfig from "$capp/config";
//require('dotenv').config();

const isObj = x=>typeof x =='object' && x && !Array.isArray(x);
const defaultObj = x=> isObj(x)? x : {};

/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function ExpoUIApp (options){
    options = defaultObj(options);
    const config = defaultObj(options.config);
    appConfig.current = config;
    registerRootComponent(require('./src/App').default);
}

ExpoUIApp();