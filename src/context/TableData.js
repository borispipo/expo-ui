// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {getRouteOptions} from "$cnavigation";
import React from "$react";
import useExpo from "./hooks";
import {defaultStr,defaultBool,isObj,isNonNullString} from "$cutils";
import {getTableDataListRouteName,getTableDataRouteName,tableDataRouteName} from "$enavigation/utils";

export function TableDataListScreen({tableName,table,screenName,...props}){
    const {getTable} = useExpo();
    const List = React.useMemo(()=>{
        return TableDataScreenComponentRef.List;
    },[]);
    if(!React.isComponent(List)){
        throw "Impossible d'effectuer le rendu de la liste des éléments liés à la table "+tableName+", Le composant List est invalide, rassurez vous de faire passer dans la fonction registerApp, un composant TableDataScreenList à utiliser pour le dit rendu";
    }
    tableName = defaultStr(tableName,table).toUpperCase();
    let tableObj = getTable(tableName);
    if(!tableObj){
        throw `object table invalide, pour le rendu de la liste des éléments liés à la table ${tableName}.`;
    }
    const title = defaultStr(tableObj?.text,tableObj?.label);
    return <List testID={"RN_TableDataScreenList_"+tableName.toUpperCase()} table={table} screenName={screenName} tableObj={tableObj} {...props} key={tableName}  tableName={tableName} title={title}/>;
}

TableDataListScreen.Stack = false;

const loopForScreen = (lScreens,screens,foundTables)=>{
    screens = Array.isArray(screens)? screens : [];
    foundTables = isObj(foundTables) ? foundTables : {};
    Object.map(lScreens,(Titem)=>{
        if(!Titem) return;
        if(Array.isArray(Titem)){
            loopForScreen(Titem,screens,foundTables)
        } else if(isNonNullString(Titem.screenName)) {
            foundTables[Titem.screenName] = Titem;
            screens.push(Titem);
        }
    });
    return {screens,foundTables};
}

/****
    prepare les différents écrans de l'application
    @param {object} tables, les différentes tables de l'application
    @param {Array} screens, les écrancs initiaux de l'application
    @param {component} TableDataScreen, le composant react à utiliser pour le rendu TableDataScreen, d'un item du tableData
    @return {Array}, la liste des écrans apprêtés
*/
export function prepareScreens ({tables,screens:screensProps,TableDataScreen,TableDataScreenList}){
    const foundTables = {};
    const screens = [];
    TableDataScreenComponentRef.current = React.isComponent(TableDataScreen)? TableDataScreen : TableDataScreenComponentRef.current;
    TableDataScreenComponentRef.List = React.isComponent(TableDataScreenList)? TableDataScreenList : TableDataScreenComponentRef.List;
    const Modal = defaultBool(TableDataScreenComponentRef.current?.Modal,TableDataScreenComponentRef.current?.modal,true)
    const ModalList = defaultBool(TableDataScreenComponentRef.List?.Modal,TableDataScreenComponentRef.List?.modal)
    const withFab = typeof TableDataScreenComponentRef.List?.withFab =="boolean"? TableDataScreenComponentRef.List?.withFab: undefined;
    loopForScreen(screensProps,screens,foundTables);
    Object.map(tables,(table,i)=>{
        if(!isObj(table) || !isNonNullString(i)) return;
        const screenName = getTableDataRouteName(i);
        const listScreenName = getTableDataListRouteName(i);
        if(!foundTables[screenName]){
            screens.push({
                Component : TableDataScreenItem,
                screenName,
                Modal
            })
            foundTables[screenName] = TableDataScreenItem;
        } else if(React.isComponent(foundTables[screenName])){
            foundTables[screenName].Modal = defaultBool(foundTables[screenName]?.Modal,foundTables[screenName].modal,Modal)
        }
        if(!foundTables[listScreenName] && table.datagrid !== false){
            screens.push({
                Component : TableDataListScreen,
                screenName : listScreenName,
                Modal : ModalList,
                withFab,
            });
            foundTables[listScreenName] = TableDataListScreen;
        }
    });
    return screens;
}

export {tableDataRouteName};

const TableDataScreenComponentRef = {current:null};
export const TableDataScreenItem = (props)=>{
    const Item = React.useMemo(()=>{
        return TableDataScreenComponentRef.current;
    },[])
    if(!React.isComponent(Item)) {
        throw "Impossible de rendre le composant TableDataScreen, car la fonction registerApp n'a pas été initialisé avec un composant devant servir pour le rendu des TableData screens item";
    }
    const {params,data,tableName:tbName} = getRouteOptions(props);
    const {getTable} = useExpo();
    const tableName = defaultStr(params?.tableName,params?.table,tbName);
    const tableObj = getTable(tableName);
    if(!isObj(tableObj)){
        throw "Objet table invalide, impossible de rendre le contenu de la tableDataScreen liée à la table "+tableName;
    }
    return <Item testID={"RN_TableDataScreenItem_"+(defaultStr(tableName)).toUpperCase()}{...props} tableObj={tableObj} data={data} tableName={tableName} {...params}/>
}
TableDataScreenItem.Modal = true;

TableDataScreenItem.displayName = "TableDataScreenItem";
