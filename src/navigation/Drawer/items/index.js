// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isRouteActive} from "$cnavigation";
import {defaultObj,sortBy,defaultStr,isObj,isNonNullString,extendObj} from "$cutils";
import appConfig from "$capp/config";
import useContext from "$econtext/hooks";
import {useMemo,useEffect,useRef} from "react";
import {RecordingButton} from "$expo-ui/desktopCapturer";
///les items du drawer
import { screenName as aboutScreenName} from "$escreens/Help/About";
import theme from "$theme";
import APP from "$capp/instance";
import useExpoUI from "$econtext/hooks";
import Auth,{useIsSignedIn,tableDataPerms} from "$cauth";
import {getTableDataListRouteName} from "$enavigation/utils";
import {isValidElement,usePrevious} from "$react";
import { isPermAllowed } from "$eauth/utils";

/***** les props supplémentaires à passer aux drawers items d'une table de données sont dans le champ drawerItemProps */
const useGetItems = (options)=>{
    const {navigation:{drawerItems,drawerSections,drawerItemsMutator},tablesData} = useContext(); 
    options = defaultObj(options);
    const {refresh,force} = options;
    const showProfilOnDrawer = theme.showProfilAvatarOnDrawer;
    const {handleHelpScreen} = useExpoUI(); 
    const handleHelp =  handleHelpScreen !== false;
    const refreshItemsRef = useRef(false);
    const isSignedIn = useIsSignedIn();
    useEffect(()=>{
        const refreshItems = (...a)=>{
            refreshItemsRef.current = !refreshItemsRef.current;
            if(typeof refresh =='function'){
                refresh(...a);
            }
        }
        APP.on(APP.EVENTS.REFRESH_MAIN_DRAWER,refreshItems);
        return ()=>{
            APP.off(APP.EVENTS.REFRESH_MAIN_DRAWER,refreshItems);
        }
    },[])
    return useMemo(()=>{
        const name = !showProfilOnDrawer ? 'Dashboard' : appConfig.name;
        const itx = typeof drawerItems === "function" ? drawerItems() : drawerItems;
        let items = {};
        const tables = Object.size(tablesData,true)? sortBy(tablesData,{
            column : "drawerSortOrder",
            dir : "asc"
        }) : null;
        let hasDrawerSectionOrder = false;
        Object.map(drawerSections,(ss,s)=>{
            if(typeof(ss) =='string' && ss){
                ss = {label:ss.trim(),code:String(s)};
            }
            if(!isObj(ss)) return null;
            const section= Object.clone(ss);
            const sCode = defaultStr(section.code,s);
            const sLabel = isValidElement(section.label,true) && section.label || isValidElement(section.text,true) && section.text || null;
            if(!sLabel || !sCode) return null;
            items[sCode] = {section:true,divider:true,...section,label:sLabel,code:sCode,items : Array.isArray(section.items)? section.items : []};
            if(typeof section.order =="number"){
                hasDrawerSectionOrder = true;
            }
        });
        if(hasDrawerSectionOrder){
            items = sortBy(items,{column:"order",dir:"asc"});
        }
        let sections = null;
        Object.map(tables,(table,index)=>{
            if(!isObj(table) || !isNonNullString(table.drawerSection)) return null;
            const tableName = defaultStr(table.table,table.tableName,index).trim();
            if(typeof table.showInDrawer =='function' && table.showInDrawer() === false) return;
            if(!tableName || table.showInDrawer === false || !Auth.isTableDataAllowed({table:tableName})){
                return;
            }
            if(!isPermAllowed(table.perm,{...options,tableName:table,permAction:"drawerItem",tables,table,index})) return;
            const section = (table.drawerSection).trim();
            if(!items[section]){
                if(!sections) sections = Object.keys(items);
                console.error("invalid drawer section ",section,"for table's drawer item ",table," please provide any section from the list of sections : ",sections)
                return;
            }
            const tProps = {};
            ["icon","label","text","desc","table","title","dbName","dataFileType","data","routeParams"].map((v)=>{
                if(v in table){
                    tProps[v] = table[v];
                }
            })
            if(isObj(table.drawerItemProps)){
                extendObj(tProps,table.drawerItemProps);
            };
            const toP = {
                routeName : table.routeName === false ? undefined : defaultStr(table.routeName,getTableDataListRouteName(tableName)),
                ...tProps,
                routeParams : {tableName,...Object.assign({},tProps.routeParams)}
            };
            items[section].items.push(toP);
        });
        Object.map(itx,(item,i)=>{
            if(isObj(item) && isNonNullString(item.drawerSection) && (item.drawerSection.trim()) in items){
                items[item.drawerSection.trim()].items.push(item);
            }
        });
        const dashboard = isObj(items.dashboard) ? Object.clone(items.dashboard) : {};
        const dash = {
            icon : 'view-dashboard',
            title : 'Dashboard',
            routeName : "Home",
            divider : true,
            ...dashboard,
            label : isValidElement(dashboard.label,true) && dashboard.label || isValidElement(dashboard.text,true) && dashboard.text || name,
        };
        items = {
            dashboard : dash?.showInDrawer === false || typeof dash.showInDrawer ==='function' && dash.showInDrawer() === false ? null : dash,
            ...items,
        };
        if(typeof drawerItemsMutator ==='function'){
            items = drawerItemsMutator(items,{drawerItems,drawerSections});
        }
        Object.map(items,(item,section)=>{
            if(!isObj(item) || item.section !== true) return;
            if(!Array.isArray(item.items) || !item.items.length){
                delete items[section];
            }
        });
        let hasCapture = false;
        const captureSide = {
            label : (p)=><RecordingButton/>,
            style : [theme.styles.noPadding],
            labelProps : {style : [{flexShrink : 1},theme.styles.alignItemsFlexStart,theme.styles.w100]}
        };
        if(handleHelp){
            const dHelp = isObj(items.help)? Object.clone(items.help) : {};
            items.help = {
                key : 'help',
                label : 'Aide',
                section : true,
                divider : false,
                ...dHelp,
                items : Array.isArray(dHelp.items)? dHelp.items : [],
            };
            items.help.items.push(captureSide,{
                icon : 'help',
                label : 'A propos de '+APP.getName(),
                routeName : aboutScreenName,
            });
            hasCapture = true;
        }
        if(!hasCapture){
            if(isObj(items.help) && Array.isArray(items.help.items)){
                items.help = Object.clone(items.help);
                items.help.items.push(captureSide);
            } else {
                items.desktopCapturer = captureSide;
            }
        }
        return items;
    },[showProfilOnDrawer,handleHelp,theme.name,theme.colors.primary,theme.colors.secondary,refreshItemsRef.current,force,isSignedIn])
}

export default useGetItems;

export const isItemActive = (opts)=>{
    if(isRouteActive(opts)){
        return true;
    }   
    return false;
}