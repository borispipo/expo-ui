import {defaultBool,defaultArray,defaultVal,isObj,isNonNullString,defaultObj,isArray,defaultStr} from "$utils";
import {sanitizeName,GROUP_NAMES} from "./utils";
import mainScreens from "./mainScreens"
import React from "$react";
import { BackHandler } from "react-native";
import APP from "$app";
import {useDrawer} from "$ecomponents/Drawer";
import {navigationRef,getScreenProps,setRoute,setActiveNavigation,setScreenOptions,goBack} from "$navigation/utils";

export * from "./utils";

export const SCREEN_OPTIONS = {};



export const handleScreen = ({Screen,Factory,ModalFactory,result,useTheme,filter,index})=>{
    result = defaultObj(result);
    result.screens = defaultObj(result.screens);
    result.groups = defaultObj(result.groups);
    result.modals = defaultObj(result.modals);
    let screens = result.screens,groups = result.groups;
    let screenName = undefined
    let screenOptions = undefined;
    if(Array.isArray(Screen)){
        Screen.map((S,i)=>{
            return handleScreen({Screen:S,Factory,ModalFactory,result,groups,useTheme,filter,index:i});
        })
    } else if(typeof Screen ==='object' && React.isComponent(Screen.Component) && isNonNullString(Screen.screenName)){
        screenName = Screen.screenName;
        screenOptions = Screen.options;
        Screen = Screen.Component;
    }
    if(React.isComponent(Screen)) {
        screenName = defaultStr(screenName,Screen.screenName);
        if(isNonNullString(screenName)){
            let name = screenName;
            let sanitizedName = sanitizeName(screenName);
            let extra = filter({Screen,name,sanitizedName}),
            authRequired = !!Screen.authRequired;
            if(extra ===false){
                return null;
            }
            ///le groupe d'écran par défaut
            let groupName = defaultStr(Screen.groupName,GROUP_NAMES.DEFAULT).toUpperCase().trim();
            if(!GROUP_NAMES[groupName]){
                groupName = GROUP_NAMES.DEFAULT
            }
            if(!authRequired){
                groupName = groupName || GROUP_NAMES.PUBLIC;
            } else{
                groupName = GROUP_NAMES.PRIVATE;
                authRequired = true;
            }
            groups[groupName] = defaultObj(groups[groupName]);
            groups[groupName][sanitizeName] = name;
            Screen.groupName = groupName;
            let screensGroups = screens,ScreenComponent=Factory.Screen;
            if((Screen.Modal === true || Screen.modal === true)){
                screensGroups = result.modals;
                ScreenComponent = ModalFactory.Screen;
                Screen.isModalScreen = true;
            }
            screensGroups[groupName] = defaultArray(screensGroups[groupName]);
            screensGroups[groupName].push(<ScreenComponent key={sanitizedName} name={sanitizedName} options={args=>{
                const options = typeof Screen.options === 'function'? Screen.options(args) : typeof screenOptions ==='function'? screenOptions(args) : defaultObj(Screen.options,screenOptions);
                SCREEN_OPTIONS[sanitizedName] = options;
                options.withAppBar = Screen.isModalScreen ? true : false;
                if(options.headerShown === false || Screen.headerShown === false){
                    options.header = x=>null;
                }
                options.elevation = typeof options.elevation =='number'? options.elevation : typeof Screen.elevation =='number'? Screen.elevation : undefined;
                options.back = args.navigation.canGoBack();
                const {title,subtitle} = getScreenProps(args);
                options.title = defaultVal(options.title,title);
                options.subtitle = defaultVal(options.subtitle,subtitle);
                return options;
            }}>
                {props =>{
                    const options = defaultObj(SCREEN_OPTIONS[sanitizedName]);
                    const {drawerRef} = useDrawer()
                    const {navigation,route} = props;
                    setActiveNavigation(navigation);
                    setRoute(route);
                    React.useEffect(()=>{
                        const unsubscribe = navigation.addListener('focus', (a) => {
                            APP.trigger(APP.EVENTS.SCREEN_FOCUS,{
                                screenName,
                                sanitizedName,
                                options,
                            })
                        });
                        const unsubscribeBlur =  navigation.addListener('blur', (a) => {
                            APP.trigger(APP.EVENTS.SCREEN_BLUR,{
                                screenName,
                                sanitizedName,
                                options,
                            })
                        });
                        const backAction = (a) => {
                            if(drawerRef && drawerRef.current.canToggle() && drawerRef.current.isOpen()){
                                drawerRef.current.closeDrawer();
                                return true;
                            }
                            let isGoingBack = false;
                            if(navigationRef.canGoBack()){
                                if(isGoingBack) return true;
                                isGoingBack = true;
                                const opts = navigationRef.getCurrentOptions();
                                const aProps = defaultObj(opts.appBarProps);
                                goBack({...opts,...aProps,...defaultObj(aProps.appBarProps)});
                                isGoingBack = false;
                                return true;
                            }
                            APP.trigger(APP.EVENTS.BACK_BUTTON,{groupName,route:navigationRef.getCurrentRoute(),screenName:sanitizedName,source:'screen'});
                            return true;
                        };
                        const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
                        return ()=>{    
                            if(unsubscribe){
                                unsubscribe();
                            }
                            if(unsubscribeBlur){
                                unsubscribeBlur();
                            }
                            if(subscription?.remove)subscription.remove();
                            return BackHandler.removeEventListener('hardwareBackPress', backAction);
                        }
                    },[]);
                    setScreenOptions(options);
                    const allowDrawer = typeof options.allowDrawer ==='boolean'? options.allowDrawer : typeof Screen.allowDrawer =='boolean'? Screen.allowDrawer : Screen.isModalScreen == true ? false : true;
                    return <>
                        <Screen authRequired={authRequired||allowDrawer} backAction={Screen.isModalScreen} modal={Screen.isModalScreen} allowDrawer={allowDrawer} withDrawer = {allowDrawer !== false ? true : false} {...props} screenName={sanitizedName} extra ={defaultObj(extra)} options={options} />
                    </>
                }}
            </ScreenComponent>)
        } else {
            console.error("Aucun nom définit pour l'écran ",Screen,index,". cet écran ne pourra pas être pris en compte dans l'application et peut provoquer des bugs.")
        }
    }
    return {screens,groups}
}


/**** cette fonction a pour but d'initialiser les écrans de l'application
 * @param Factory {typeof Factory : voir @https://reactnavigation.org/}
 * @param screens {Object {screns:{screens:{},groups:{}}}} l'objet dans lequel le screensat sera retourné
 * @param screens {array} la liste des écrans à rendre dynamiquement dans le FactoryContainer
 * @param useTheme {boolean} si le composant sera wrapper par le hook withTheme de react-native-paper
 * @return {object} : objet comportant deux propriétés : 
 *      screens : {} : liste des écrans de l'application initialisés. il est à noter que, tous les écrans sont dans les sous répertoire du dossier courant
            screens screens est de la forme : {group1:[],group2:[], ...groupN:[]}:
                    C'est un objet de tableau, ou chaque clé représente le nom du groupe et le tableau représente les écrans qui sont rendu par ledit groupe
            
        groups : {} : la liste des différents groupes d'écrans rendus par la méthode
 */
export default function initScreens ({Factory,ModalFactory,useTheme,screens,result,filter}){
    if(!isArray(screens) || !screens.length){
        screens = mainScreens;
    }
    result = defaultObj(result);
    result.screens = defaultObj(result.screens);
    result.groups = defaultObj(result.groups);
    ///lorsque les écrans sont passés enparamètres, par défaut, le wrapper withTheme n'est pas utilisé
    useTheme = defaultBool(useTheme,false);
    filter = typeof filter =="function" ? filter : x=> true;
    defaultArray(screens).map((Screen,index)=>{
        handleScreen({Screen,result,Factory,ModalFactory,filter,index})
    });
    return result;
}

export const handleContent = ({screens,hasGetStarted,state,Factory})=>{
    const content = [];
    state = defaultObj(state);
    screens = defaultObj(screens);
    if(isObj(screens.screens)){
        screens = screens.screens;
    }
    Object.map(screens,(screens,groupName)=>{
        if(!Array.isArray(screens)) return null;
        if(hasGetStarted === false){
          if(groupName == GROUP_NAMES.INSTALL){
              content.push(<Factory.Group key={groupName}>
                {screens}
              </Factory.Group>)
          }
        } else if(groupName === GROUP_NAMES.PRIVATE){
            content.push(<Factory.Group key={groupName}>
                {screens}
            </Factory.Group>)
            return
        }
        if(groupName ===GROUP_NAMES.PUBLIC && screens.length){
            content.push(<Factory.Group key={groupName}>
              {screens}
            </Factory.Group>)
        } 
    });
    return content;
}
export {initScreens}