import {isNonNullString,defaultStr,uniqid} from "$cutils";
import PropTypes from "prop-types"
import _DrawerItem from "./_DrawerItem";
import {navigate,setActiveRoute} from "$cnavigation";
import { useDrawer } from "../context";
import { setActiveItem,getOnPressAction,closeDrawer as nCloseDrawer,previousActiveItemRef,activeItemRef} from "./utils";
import {useIsScreenFocused} from "$enavigation/hooks";
import React from "$react";



/**** wrapper du drawerItem */
export default function DrawerItem(props){
    let {navigation,closeOnPress,routeName,routeParams,...rest} = props;
    const {drawerRef,isItemActive} = useDrawer();
    const isActive = isItemActive(props);
    const isFocused = useIsScreenFocused(routeName);
    const [active,setActive] = React.useState(isActive);
    const isMounted = React.useIsMounted();
    const itemId = React.useState(uniqid("drawer-item-id"));
    routeName = defaultStr(routeName);
    const [context] = React.useState({
        activate : x=> isMounted() && setActive(true),
        desactivate : x=> isMounted() && setActive(false),
        isMounted,
        id:itemId,
        routeName
    });
    React.useEffect(()=>{
        if(isMounted() && isNonNullString(routeName)){
            if(isFocused !== active){
                setActive(isFocused);
            }
        }
    },[isFocused])
    React.useEffect(()=>{
        if(active && isMounted()){
            setActiveItem(context);
        }
    },[active])
    const closeDrawer = (cb,force)=>{
        return nCloseDrawer(drawerRef,cb,force);
    }
    React.useEffect(()=>{
        if(isMounted() && isActive !== active){
            setActive(isActive); 
        }
    },[isActive]);
    return <_DrawerItem 
        {...rest} 
        drawerRef = {drawerRef}
        onPress = {getOnPressAction({
            ...props,
            drawerRef,
            beforePress : (args)=>{
                if(isNonNullString(routeName)){
                    const cItem = activeItemRef.current;
                    setActiveRoute({name:routeName,params:routeParams})  
                    if(isMounted()){
                       setActiveItem(context,true);
                    }  
                    closeDrawer(()=>{
                        routeParams = defaultObj(routeParams);
                        navigate({...rest,routeName,routeParams,from:"drawer",source:'drawer'});
                    },cItem?.routeName === routeName?true : false);
                    return false;
                } else {
                    if(closeOnPress === false) return false;
                }
            }
        })}
        active={active}
    />
}

DrawerItem.propTypes = {
    onPress : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    /*** l'objet navigation, pour la navigation dans les containers */
    navigation : PropTypes.object,
}