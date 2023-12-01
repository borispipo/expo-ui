// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {navigate,sanitizeName} from "$cnavigation";
import {isNonNullString,defaultStr,defaultObj,isObj} from "$cutils";
import appConfig from "$capp/config";

export const tableDataRouteName = 'table-data';

export const structDataRouteName = 'struct-data';

export const tableDataLinkRouteName = "table-data-link";
export const structDataListRouteName = "struct-data-list";

export const tableDataListRouteName = "table-data-list";

export const tableDataLinkScreenName = tableDataLinkRouteName;

export const structDataLinkRouteName = "struct-data-link";
export const structDataLinkScreeName = structDataLinkRouteName;

const canCheckNavPerms = ()=> appConfig.get("checkNavigationPermsOnTableOrStructData")

const navigateToTableOrStructData = function(tableName,params,actionType){
    if(isNonNullString(tableName)){
        tableName = {tableName};
    }
    if(isObj(tableName)){
        params = {...tableName,...defaultObj(params)};
    }
    params = defaultObj(params);
    tableName = defaultStr(params.tableName,params.table).toUpperCase();
    if(!tableName) return;
    const {perm} = params;
    let isAllowed = true;
    actionType = defaultStr(actionType,"tabledata").replaceAll("_","").replaceAll("-","").replaceAll(" ","").toLowerCase();
    const isTableData = actionType =='tabledata';
    if(isNonNullString(perm)){
        isAllowed = Auth.isAllowedFromStr(perm)
    } else if(canCheckNavPerms() !== false){
        if(actionType =='structdata') {
            isAllowed = Auth.isStructDataAllowed({table:tableName})
        } else if(isTableData){
            isAllowed = Auth.isTableDataAllowed({table:tableName});
        }
    }
    if(!isAllowed){
        return Auth.showError();
    }
    params.tableName = tableName;
    params.routeName = buildScreenRoute(tableName,actionType =='structdata'? structDataRouteName : tableDataRouteName);
    return navigate(params)
}

export const navigateToTableData = (tableName,params)=>{
    return navigateToTableOrStructData(tableName,params,"tabledata");
}

export const navigateToStructData = (tableName,params)=>{
    return navigateToTableOrStructData(tableName,params,"structdata");
}
/**** permet de naviguer ver un lien */
export const navigateToTableDataLink = (tableName,options)=>{
    const opts = isNonNullString(tableName)? {tableName,table:tableName} : {};
    return navigate(tableDataLinkRouteName,extendObj({},opts,options));
}

export const buildScreenRoute = function(tableName,parent){
    if(isObj(tableName)){
        tableName = defaultStr(tableName.tableName,tableName.table);
    }
    if(!isNonNullString(tableName)) return undefined;
    parent = defaultStr(parent,tableDataRouteName);
    if(parent){
        parent= parent.rtrim("/")+"/";
    }
    return sanitizeName(parent+tableName);
}

export const getTableDataRouteName = function(tableName){
    return buildScreenRoute(tableName,tableDataRouteName);
}

export const getStructDataRouteName = function(tableName){
    return buildScreenRoute(tableName,structDataRouteName);
}

export const getStructDataScreenName = getStructDataRouteName;
export const getTableDataScreenName = getTableDataRouteName;

/*** permet d'obtenir le lien vers l'écran table data permettant de lister les données de la table data */
export const getTableDataListRouteName = function(tableName){
    return buildScreenRoute(tableName,tableDataListRouteName);
}

export const getStructDataListRouteName = function(tableName){
    return buildScreenRoute(tableName,structDataListRouteName);
}

export const getTableDataListScreenName = getTableDataListRouteName;

export const navigateToTableDataList = function (tableName,params){
    const route = getTableDataListRouteName(tableName);
    if(isNonNullString(route)){
        if(canCheckNavPerms() !== false && !Auth.isTableDataAllowed({table:tableName,action:'read'})){
            return Auth.showError() 
        }
        return navigate({routeName:route,params});
    }
    return false;
}

export * from "$cnavigation";