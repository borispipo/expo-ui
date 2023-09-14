import { registerRootComponent } from "expo";
import Provider from "$econtext/Provider";
const REGISTER_EVENT = "REGISTER-APP-COMPONENT-ROOT";
import {useState,useEffect} from "react";
const propsRef = {current:null};
import APP from "$capp/instance";
import {isObj,uniqid} from "$cutils";
import {View} from "react-native";
const isLOCALDEV = uniqid("is-expo-ui-local-DEV...");

/****
 * les options sont de la forme : 
 * {
 *   @param init {function} ()=>Promise<{}>, initialise l'application, lorsque la promèsse n'est pas résolue, alors l'application considère qu'il s'agit d'une étape pour l'écran de GetStarted dans ce cas, 
 *   l'option la route getStartedRouteName est utilisée comme route par défaut de l'application
 *   @param initialRouteName {string} la route initiale, par d'afaut Home, valide lorsque la promèsse résultat de la fonction init est résolue
 *   @param getStartedRouteName {string} la route de l'écran de GetStarted, valide lorsque la promèsse résultat de la fonction init n'est pas résolue
 *      L'écran de route getStartedRouteName prend en paramètre onGetStarted {function}, qui est appelée lorsque le contenu de l'écran GetStarted est affiché à l'utilisateur
 *   @maram {swrConfig}, les options supplémentaires à passer au gestinnaire swr
 *   les écrans d'initialisation doivent garder la propriété Start à true ou doivent avoir le groupe INTALL, pour spécifier que ce sont es écrans qui apparaissent lorsque l'application n'est pas initialisée
 * }
 */


const MainAppEntry = function(mProps){
    const [props,setProps] = useState(propsRef.current);
    const onRegisterProps = (props)=>{
        if(isObj(propsRef.current) || !isObj(props)) return;
        propsRef.current = props;
        setProps({...props});
    }
    useEffect(()=>{
        APP.on(REGISTER_EVENT,onRegisterProps);
        return ()=>{
            APP.off(REGISTER_EVENT,onRegisterProps);
        }
    },[]);
    const cProps = isObj(props) ? props : propsRef.current;
    if(!isObj(cProps)) {
        return <View/>;
    }
    const {onMount,onUnmount,onRender,render,swrConfig,init,...rest} = {...mProps,...cProps};
    const App = require("./src/App").default;
    return  <Provider {...rest} swrConfig={isObj(swrConfig) && swrConfig || {}} children={<App init={init} render={render} onMount={onMount} onUnmount={onUnmount} onRender={onRender}/>}/>
};

registerRootComponent(MainAppEntry);

export default function registerApp (opts){
    propsRef.current = opts;
    APP.trigger(REGISTER_EVENT,opts);
}

//si après 5 secondes, l'application n'a pas été registrer, alors il s'agit d'un test en mode local
registerApp({
    isLOCALDEV,
    navigation : {
        screens : require("./src/test-screens").default
    },
    init : ({appConfig})=>{
        appConfig.set("isAuthSingleUserAllowed",true);
        appConfig.set("authDefaultUser",{code:"root",password:"admin123",label:"Master admin"})
        return Promise.resolve("test ted")
    }
});