import { registerRootComponent } from "expo";
import {Platform } from 'react-native';
import { createRoot } from 'react-dom/client';
import appConfig from "$capp/config";
import { activateKeepAwake } from 'expo-keep-awake';
//import { startNetworkLogging } from 'react-native-network-logger';
if (__DEV__) {
    activateKeepAwake();
}
const isWeb = Platform.OS === "web";
/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function ExpoUIApp (options){
    options = options && typeof options =='object' && !Array.isArray(options)? options : {};
    const {initConfig,...opts} = options;
    appConfig.current = options.config;
    if(typeof initConfig ==='function'){
        initConfig({appConfig,config:appConfig});
    }
    const App = require('./src/App').default(opts);
    if (false) {
        const root = createRoot(document.getElementById("root") || document.getElementById("main"));
    } else {
        registerRootComponent(App);
    }
}

if(__DEV__ && !isWeb){
    //startNetworkLogging();
}

///fix bug lié au fait que l'application stuck on splashscreen en environnement mobile
!isWeb && registerRootComponent(x=>null);