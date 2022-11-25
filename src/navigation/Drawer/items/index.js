// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isRouteActive} from "$cnavigation";
import "$cutils";
import appConfig from "$capp/config";
import {isMobileNative} from "$platform";
import NetworkLoginScreen from "$escreens/NetworkLogin";
import {defaultVal} from "$utils";
import APP from "$capp";
///les items du drawer
import items from "$drawerItems";
import { screenName as aboutScreenName} from "$escreens/Help/About";

export const getItems = (force)=>{
    const name = APP.getName();
    const itx = typeof items === "function" ? items() : items;
    const handleHelp =  defaultVal(appConfig.get("handleHelpScreen"));
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
    r.push({divider:true});
    if(handleHelp){
        const dataHelp = {
            key : 'dataHelp',
            label : 'Aide',
            section : true,
            divider : false,
            items : [
                {
                    icon : 'help',
                    label : 'A propos de '+name,
                    routeName : aboutScreenName,
                }
            ]
        };
        if(__DEV__ && isMobileNative()){
            dataHelp.items.unshift({
                icon : 'math-log',
                label : 'Inpecter les requêtes réseau',
                routeName : NetworkLoginScreen.screenName,
            });
        }
        r.push(dataHelp);
    }
    return r;
}


let CACHED_ITEMS = []

export const refresh = ()=>{
    CACHED_ITEMS = getItems();
    return CACHED_ITEMS;
}

export default function mainDrawerItems(options){
    if(!CACHED_ITEMS.length){
        refresh();
    }
    return CACHED_ITEMS;
};

export const isItemActive = (opts)=>{
    if(isRouteActive(opts)){
        return true;
    }   
    return false;
}