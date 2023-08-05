// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isRouteActive} from "$cnavigation";
import {defaultObj} from "$cutils";
import appConfig from "$capp/config";
import useContext from "$econtext/hooks";
import {useMemo,useEffect,useRef} from "react";
///les items du drawer
import { screenName as aboutScreenName} from "$escreens/Help/About";
import theme from "$theme";
import APP from "$capp/instance";

const useGetItems = (options)=>{
    const {navigation:{drawerItems}} = useContext(); 
    options = defaultObj(options);
    const {refresh,force} = options;
    const showProfilOnDrawer = theme.showProfilAvatarOnDrawer;
    const handleHelp =  appConfig.get("handleHelpScreen") !== false ? true : false;
    const refreshItemsRef = useRef(false);
    useEffect(()=>{
        const refreshItems = (...a)=>{
            refreshItemsRef.current = !refreshItemsRef.current;
            if(typeof refresh =='function'){
                refresh(...a);
            }
        }
        APP.on(APP.EVENTS.REFRESH_MAIN_DRAWER,refreshItems);
        APP.on(APP.EVENTS.AUTH_LOGIN_USER,refreshItems);
        APP.on(APP.EVENTS.AUTH_LOGOUT_USER,refreshItems);
        return ()=>{
            APP.off(APP.EVENTS.REFRESH_MAIN_DRAWER,refreshItems);
            APP.off(APP.EVENTS.AUTH_LOGIN_USER,refreshItems);
            APP.off(APP.EVENTS.AUTH_LOGOUT_USER,refreshItems);
            APP.off(APP.EVENTS.UPDATE_THEME,onLogoutUser);
        }
    },[])
    return useMemo(()=>{
        const name = !showProfilOnDrawer ? 'Dashboard' : appConfig.name;
        const itx = typeof drawerItems === "function" ? drawerItems() : drawerItems;
        const r = [
            {
                label : name,
                icon : 'view-dashboard',
                title : 'Dashboard',
                routeName : "Home",
                divider : true,
            },
        ];
        Object.map(itx,(item,i)=>{
            if(isObj(item)){
                r.push(item);
            }
        })
        if(handleHelp){
            r.push({divider:true});
            const dataHelp = {
                key : 'dataHelp',
                label : 'Aide',
                section : true,
                divider : false,
                items : [
                    {
                        icon : 'help',
                        label : 'A propos de '+APP.getName(),
                        routeName : aboutScreenName,
                    }
                ]
            };
            r.push(dataHelp);
        }
        return r;
    },[showProfilOnDrawer,handleHelp,refreshItemsRef.current,force])
}

export default useGetItems;

export const isItemActive = (opts)=>{
    if(isRouteActive(opts)){
        return true;
    }   
    return false;
}