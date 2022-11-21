import { registerRootComponent } from "expo";
import {AppRegistry, Platform } from 'react-native';
import { createRoot } from 'react-dom/client';
import appConfig from "$capp/config";
import { activateKeepAwake } from 'expo-keep-awake';
if (__DEV__) {
    activateKeepAwake();
}

/**** initialise l'application expoUI avec les paramètres de configuration
 * les options sont de la forme : 
 * {
 *      config {object}, le fichier de configuration de l'application
 * }
 */
export default function ExpoUIApp (options){
    options = options && typeof options =='object' && !Array.isArray(options)? options : {};
    appConfig.current = options.config;
    const App = require('./src/App').default(options);
    if (false && Platform.OS === "web") {
        const root = createRoot(document.getElementById("root") || document.getElementById("main"));
        root.render(<App />);
    } else {
        registerRootComponent(App);
    }
}