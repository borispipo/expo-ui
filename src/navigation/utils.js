// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {navigate,sanitizeName} from "$cnavigation";
import {isNonNullString,defaultStr,defaultObj,isObj} from "$cutils";


export const tableDataRouteName = 'TableData';

export const navigateToTableData = function(tableName,params,actionType){
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
    actionType = defaultStr(actionType,"tabledata").replaceAll(" ","").toLowerCase();
    const isTableData = actionType =='tabledata';
    if(isNonNullString(perm)){
        isAllowed = Auth.isAllowedFromStr(perm)
    } else if(actionType =='struct_data') {
        isAllowed = Auth.isStructDataAllowed({table:tableName})
    } else if(isTableData){
        isAllowed = Auth.isTableDataAllowed({table:tableName});
    }
    if(!isAllowed){
        return Auth.showError();
    }
    params.routeName = buildScreenRoute(tableName,tableDataRouteName);
    return navigate(params)
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

export const getTableDataScreenName = getTableDataRouteName;

/*** permet d'obtenir le lien vers l'écran table data permettant de lister les données de la table data */
export const getTableDataListRouteName = function(tableName){
    return buildScreenRoute(tableName,tableDataRouteName+"/LIST/");
}

export const getTableDataListScreenName = getTableDataListRouteName;

export const navigateToTableDataList = function (tableName,params){
    const route = getTableDataListRouteName(tableName);
    if(isNonNullString(route)){
        if(!Auth.isTableDataAllowed({table:tableName,action:'read'})){
            return Auth.showError() 
       }
        return navigate({routeName:route,params});
    }
    return false;
}

export * from "$cnavigation";