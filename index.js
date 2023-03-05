import { registerRootComponent } from "expo";
import {Platform } from 'react-native';
import App from "./src/App";
const isWeb = Platform.OS === "web";
export default function registerApp (options){
    options = options && typeof options =='object' && !Array.isArray(options)? options : {};
    registerRootComponent(function(props){
        return <App {...props} {...options}/>
    });
}

///fix bug lié au fait que l'application stuck on splashscreen en environnement mobile
!isWeb && registerRootComponent(x=>null);