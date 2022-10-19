import { registerRootComponent } from 'expo';
import appConfig from "$capp/config";

/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function ExpoUIApp (options){
    options = options && typeof options =='object' && !Array.isArray(options)? options : {};
    const config = defaultObj(options.config);
    appConfig.current = config;
    registerRootComponent(require('./src/App').default(options));
}
