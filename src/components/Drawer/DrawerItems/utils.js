import {navigate} from "$navigation/utils";
import {defaultObj,isPromise,isObj,isNonNullString,isFunction} from "$utils";
import {open as openPreloader,close as closePreloader} from "$preloader";
import React from "$react";
import theme,{Colors} from "$theme";

export const getBackgroundColor = (active)=>{
    return active ? Colors.setAlpha(theme.colors.primary,0.12) : 'transparent';
}
export const closeDrawer = (drawerRef,cb,force)=>{
    return drawerRef && drawerRef.current && drawerRef.current.runAfterSlide ? drawerRef.current.runAfterSlide(cb,force) : typeof cb == 'function' ? cb({}) : null;
}

/**** permet de construire l'action onPress à partir de l'props passé en paramète */
export const getOnPressAction = (props) =>{
    props = defaultObj(props);
    let {onPress,drawerRef,closeOnPress,beforePress,isExpandable,preloader,routeParams,routeName} = props;
    let _onPress = null;
    _onPress = onPress === false ? null : onPress;
    if(onPress === null) {
        return null;
    }
    routeName = defaultStr(routeName);
    if(isFunction(_onPress) || routeName){
        _onPress = (args)=>{
            if(isFunction(onPress) && onPress (args) === false) return;
            if(routeName){
                navigate(routeName,routeParams);
                return;
            }
        }
    }
    if(isFunction(_onPress)){
        return  (event,ev2)=>{
            const args = React.getOnPressArgs(event,ev2);
            const cb = ()=>{
                if(isExpandable || closeOnPress === false){
                    return _onPress({...props,...args,drawerRef});;
                }
                if(preloader){
                    openPreloader();
                }
                closeDrawer(drawerRef, x=> {
                    _onPress({...props,...args,drawerRef});
                    if(preloader){
                        closePreloader();
                    }
                });
            }
            if(typeof beforePress =='function'){
                const r = beforePress(args);
                if(r === false ) return;
                if(isPromise(r)){
                    return r.then(cb);
                }
            }
            cb();
        }
    }
    return _onPress;
}

const activeRouteKey = "drawerActiveRoute";
/*** retourne la route active à travers la sesison passé soit dans la 
 * - la propriété sessionManager de prop, soit la props elle même constituant un gestionnaire de session
 */
export const getActiveSessionRoute = (props)=>{
    const getSession = isObj(props) && isObj(props.sessionManager) && props.sessionManager.get ? props.sessionManager.get : isObj(props) && typeof props.get =='function'? props.get : undefined;
    if(typeof getSession =='function'){
        return getSession(activeRouteKey);
    }
    return undefined;
}
/*** permet de définir la route active à travers els props passé en paramètre */
export const setActiveSessionRoute = (activeRoute,props)=>{
    const setSession = isObj(props) && isObj(props.sessionManager) && props.sessionManager.set ? props.sessionManager.set : isObj(props) && typeof props.set =='function'? props.set : undefined;
    if(typeof setSession =='function'){
        return setSession(activeRouteKey,defaultStr(activeRoute));
    }
    return undefined;
}

/*** vérifie si la route passée en paramètre est active */
export const isRouteActive = (route,sessionManager)=>{
    if(!isNonNullString(route)) return false;
    const activeRoute = getActiveSessionRoute(sessionManager);
    if(!isNonNullString(activeRoute)) return false;
    return route.toLowerCase().trim().ltrim("#").rtrim("/") === activeRoute.toLowerCase().trim().ltrim("#").rtrim("/") ? true : false;
}

export const previousActiveItemRef = React.createRef(null);

export const activeItemRef = React.createRef(null);

export const getActiveItem = x=> activeItemRef.current;


export const setActiveItem = (item,toogleActiveItem)=> {
    if(toogleActiveItem ===true && activeItemRef.current && activeItemRef.current.desactivate){
        activeItemRef.current.desactivate();
    }
    previousActiveItemRef.current = activeItemRef.current;
    activeItemRef.current = item;
    if(toogleActiveItem === true && activeItemRef.current && activeItemRef.current.activate){
        activeItemRef.current.activate();
    }
}
