// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isRouteActive} from "$cnavigation";
import "$cutils";
import APP from "$capp";
///les items du drawer
import items from "$drawerItems";

export const getItems = (force)=>{
    const name = APP.getName();
    const itx = typeof items === "function" ? items() : items;
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
    r.push({
        key : 'dataHelp',
        label : 'Aide',
        section : true,
        divider : false,
        items : [
            /*{
                icon : 'timeline-help',
                label : name+", Mises à jour",
            },*/
        ]
    });
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