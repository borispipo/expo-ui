import {defaultBool,defaultArray,defaultVal,isObj,isNonNullString,defaultObj,isArray,defaultStr} from "$cutils";
import {sanitizeName,GROUP_NAMES} from "./utils";
import React from "$react";
import ScreenWrapper from "./ScreenWrapper";
import { SCREEN_OPTIONS } from "./utils";

export * from "./mainScreens";

export * from "./utils";

export const handleScreen = ({Screen,Factory,ModalFactory,result,index})=>{
    result = defaultObj(result);
    result.screens = defaultObj(result.screens);
    result.groups = defaultObj(result.groups);
    result.modals = defaultObj(result.modals);
    let screens = result.screens,groups = result.groups;
    let screenName = undefined
    let screenOptions = undefined;
    if(Array.isArray(Screen)){
        Screen.map((S,i)=>{
            return handleScreen({Screen:S,Factory,ModalFactory,result,groups,index:i});
        })
    } else if(typeof Screen ==='object' && React.isComponent(Screen.Component) && isNonNullString(Screen.screenName)){
        screenName = Screen.screenName;
        screenOptions = Screen.options;
        const Modal = typeof Screen.Modal =='boolean'? Screen.Modal : typeof Screen.modal =='boolean'? Screen.modal : undefined;
        const withFab = typeof Screen.withFab =='boolean'? Screen.withFab : undefined;
        const withNotifications = typeof Screen.withNotifications =='boolean'? Screen.withNotifications : undefined;
        Screen = Screen.Component;
        if(typeof withFab =='boolean'){
            Screen.withFab = withFab;
        }
        if(typeof withNotifications =='boolean'){
            Screen.withNotifications = withNotifications;
        }
        if(Modal !== undefined){
            Screen.Modal = Modal;
        }
    }
    if(React.isComponent(Screen)) {
        screenName = defaultStr(screenName,Screen.screenName);
        if(isNonNullString(screenName)){
            let name = screenName;
            const sanitizedName = sanitizeName(screenName);
            let authRequired = typeof Screen.authRequired =="boolean"? Screen.authRequired : true;
            ///le groupe d'écran par défaut
            let groupName = Screen.Start ||Screen.start ? GROUP_NAMES.START : authRequired === false ? GROUP_NAMES.PUBLIC : GROUP_NAMES.PRIVATE;
            if(!GROUP_NAMES[groupName]){
                groupName = GROUP_NAMES.PRIVATE;
            }
            if( groupName !== GROUP_NAMES.INSTALL){
                if(!authRequired){
                    groupName = groupName || GROUP_NAMES.PUBLIC;
                } else{
                    groupName = GROUP_NAMES.PRIVATE;
                    authRequired = true;
                }
                authRequired = authRequired || groupName === GROUP_NAMES.PRIVATE;
            } else {
                authRequired = false;
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
                options.screenName = screenName;
                options.Screen = Screen;
                options.Modal = typeof Screen.Modal =='boolean'? Screen.Modal : options.Modal;
                options.withFab = typeof Screen.withFab =='boolean'? Screen.withFab : options.withFab;
                options.groupName = groupName;
                options.authRequired = authRequired;
                SCREEN_OPTIONS[sanitizedName] = options;
                options.withAppBar = Screen.isModalScreen ? true : false;
                if(options.headerShown === false || Screen.headerShown === false){
                    options.header = x=>null;
                }
                options.elevation = typeof options.elevation =='number'? options.elevation : typeof Screen.elevation =='number'? Screen.elevation : undefined;
                options.back = args.navigation.canGoBack();
                options.isModal = options.Modal = Screen.isModalScreen;
                return options;
            }} component = {ScreenWrapper}/>);
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
 * @return {object} : objet comportant deux propriétés : 
 *      screens : {} : liste des écrans de l'application initialisés. il est à noter que, tous les écrans sont dans les sous répertoire du dossier courant
            screens screens est de la forme : {group1:[],group2:[], ...groupN:[]}:
                    C'est un objet de tableau, ou chaque clé représente le nom du groupe et le tableau représente les écrans qui sont rendu par ledit groupe
            
        groups : {} : la liste des différents groupes d'écrans rendus par la méthode
 */
export default function initScreens ({Factory,ModalFactory,screens,result}){
    if(!isArray(screens) || !screens.length){
        screens = [];
    }
    result = defaultObj(result);
    result.screens = defaultObj(result.screens);
    result.groups = defaultObj(result.groups);
    defaultArray(screens).map((Screen,index)=>{
        handleScreen({Screen,result,Factory,ModalFactory,index})
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
          if(groupName == GROUP_NAMES.START){
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