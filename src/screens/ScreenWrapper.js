// Copyright 2023 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import BackHandler from "$ecomponents/BackHandler";
import APP from "$capp";
import {useDrawer} from "$ecomponents/Drawer";
import {navigationRef,getScreenProps,setRoute,setActiveNavigation,setScreenOptions,goBack} from "$cnavigation";
import { SCREEN_OPTIONS } from "./utils";
import {ScreenContext} from "$econtext/hooks";

export default function ScreenWrapperNavComponent(_props){
    const {navigation,route,...props} = getScreenProps(_props);
    const sanitizedName = route.name;
    const options = defaultObj(SCREEN_OPTIONS[sanitizedName]);
    const {screenName,groupName,Screen,authRequired,isModal,...rest} = options;
    const {drawerRef} = useDrawer()
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
    const allowDrawer = typeof options.allowDrawer ==='boolean'? options.allowDrawer : typeof options.withDrawer =='boolean'? options.withDrawer : typeof Screen.allowDrawer =='boolean'? Screen.allowDrawer : typeof Screen.withDrawer =='boolean' ? Screen.withDrawer : Screen.isModalScreen == true ? false : true;
    const withFab = typeof options.withFab ==='boolean' ? options.withFab : typeof Screen.withFab =='boolean'? Screen.withFab : false;
    const withNotifications = typeof options.withNotifications =='boolean'? options.withNotifications : typeof Screen.withNotifications =='boolean'? Screen.withNotifications : false;
    const titleText = defaultVal(props.title,options.title,rest.title);
    const authRequiredS = authRequired === false || Screen.authRequired ===false ? false : authRequired || allowDrawer;
    const backActionS = options.backAction === false || Screen.backAction ===false ? false : isModal;
    return <ScreenContext.Provider
        value={{navigation,modal:isModal,backAction:backActionS,authRequired:authRequiredS,route,title:titleText,isModal,screenName,sanitizedName,options,isFocused:navigation.isFocused,withFab,allowDrawer}}
        children={<Screen 
            withFab = {withFab}
            groupName = {groupName}
            withNotifications = {withNotifications}
            {...rest}
            key = {sanitizedName}
            authRequired={authRequiredS} 
            backAction={backActionS} 
            modal={isModal} 
            navigation = {navigation}
            route = {route}
            allowDrawer={allowDrawer} 
            withDrawer = {allowDrawer !== false ? true : false} 
            {...props} 
            title = {titleText}
            subtitle = {defaultVal(props.subtitle,options.subtitle,rest.subtitle)}
            screenName={sanitizedName} 
            options={options}
         />}
    />
}