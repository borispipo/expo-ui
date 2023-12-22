// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {getRouteOptions} from "$cnavigation";
import React from "$react";
import useExpo from "./hooks";
import {defaultStr,defaultBool,isObj,extendObj,isNonNullString,defaultObj,defaultVal} from "$cutils";
import {getTableDataListRouteName,getTableDataRouteName,tableDataRouteName,tableDataLinkRouteName,sanitizeName} from "$enavigation/utils";
import {Form as FormLoader} from "$ecomponents/ContentLoader";
import { useEffect,useState } from "react";
import { usePrepareProps } from "../components/TableLink";
import View from "$ecomponents/View";
import Label from "$ecomponents/Label";
import theme from "$theme";
import notify from "$notify";
import appConfig from "$capp/config";
import Screen from "$eScreen";
import { getStateFromPath } from "@react-navigation/native";
import * as Linking from 'expo-linking';


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
        return <ScreenError tableName={tableName} {...props}>
            {`Objet table invalide, pour le rendu de la liste des éléments liés à la table ${tableName}.`}
        </ScreenError>
    }
    const title = defaultStr(tableObj?.text,tableObj?.label);
    return <List testID={"RN_TableDataScreenList_"+tableName.toUpperCase()} table={table} screenName={screenName} tableObj={tableObj} {...props} key={tableName}  tableName={tableName} title={title}/>;
}

TableDataListScreen.Stack = false;

const allFoundScreens = {}

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
    ///@see https://reactnavigation.org/docs/configuring-links : for links configuration
    prepare les différents écrans de l'application
    @param {object} tables, les différentes tables de l'application
    @param {Array} screens, les écrancs initiaux de l'application
    @param {component} TableDataScreen, le composant react à utiliser pour le rendu TableDataScreen, d'un item du tableData
    @return {Array}, la liste des écrans apprêtés
*/
export function prepareScreens ({tables,screens:screensProps,navigationContainerProps:containerProps,TableDataScreen,TableDataScreenList}){
    const foundTables = allFoundScreens;
    Object.map(foundTables,(v,i)=>{delete foundTables[i]});
    const screens = [];
    
    ///linking inintialization for config
    const prefix = Linking.createURL('/');
    containerProps.linking = defaultObj(containerProps.linking);
    containerProps.linking.prefixes = Array.isArray(containerProps.linking.prefixes)? containerProps.linking.prefixes : [];
    containerProps.linking.prefixes.unshift(prefix);
    containerProps.linking.config = defaultObj(containerProps.linking.config);
    if(!containerProps.linking.prefixes.length){
        const appName = sanitizeName(appConfig.name);
        if(appName){
            containerProps.linking.prefixes.push(`${appName.rtrim("://")}://`);
        }
    }
    const {getStateFromPath:cGetStateFromPath} = containerProps.linking;
    containerProps.linking.getStateFromPath = (path,config)=>{
        const state = defaultObj(getStateFromPath(path,config));
        if(typeof cGetStateFromPath =="function"){
            extendObj(true,true,state,cGetStateFromPath(path,config));
        }
        const home = sanitizeName("Home");
        state.routeNames = Array.isArray(state.routeNames)? state.routeNames : [];
        state.routes = Array.isArray(state.routes)? state.routes : []
        if(!state.routeNames.length){
            state.routeNames.push(home);
            state.routes.unshift({
                key : home, name : home,
            })
        }
        return state;
    }
    TableDataScreenComponentRef.current = React.isComponent(TableDataScreen)? TableDataScreen : TableDataScreenComponentRef.current;
    TableDataScreenComponentRef.List = React.isComponent(TableDataScreenList)? TableDataScreenList : TableDataScreenComponentRef.List;
    const Modal = defaultBool(TableDataScreenComponentRef.current?.Modal,TableDataScreenComponentRef.current?.modal,true)
    const ModalList = defaultBool(TableDataScreenComponentRef.List?.Modal,TableDataScreenComponentRef.List?.modal)
    const withNotifications = typeof TableDataScreenComponentRef.List?.withNotifications =="boolean"? TableDataScreenComponentRef.List?.withNotifications: undefined;
    const withFab = typeof TableDataScreenComponentRef.List?.withFab =="boolean"? TableDataScreenComponentRef.List?.withFab: undefined;
    loopForScreen(screensProps,screens,foundTables);
    Object.map(tables,(table,i)=>{
        if(!isObj(table) || !isNonNullString(i)) return;
        const screenName = getTableDataRouteName(i);
        const listScreenName = getTableDataListRouteName(i);
        if(!foundTables[screenName]){
            foundTables[screenName] = {
                Component : TableDataScreenItem,
                screenName,
                Modal
            };
            screens.push(foundTables[screenName]);
        } else if(React.isComponent(foundTables[screenName])){
            foundTables[screenName].Modal = defaultBool(foundTables[screenName]?.Modal,foundTables[screenName].modal,Modal)
        }
        if(!foundTables[listScreenName] && table.datagrid !== false){
            foundTables[listScreenName] = {
                Component : TableDataListScreen,
                screenName : listScreenName,
                Modal : ModalList,
                withFab,
                withNotifications,
            };
            screens.push(foundTables[listScreenName]);
        }
    });
    if(!foundTables[tableDataLinkRouteName]){
        foundTables[tableDataLinkRouteName] = {
            Component : TableDataLinkScreen,
            screenName : tableDataLinkRouteName,
            Modal,
        };
        screens.push(foundTables[tableDataLinkRouteName])
    }
    return screens;
}

export {tableDataRouteName};


const TableDataScreenComponentRef = {current:null};
export const TableDataScreenItem = ({fromTableDataLink,...props})=>{
    const Item = React.useMemo(()=>{
        return TableDataScreenComponentRef.current;
    },[])
    if(!React.isComponent(Item)) {
        throw "Impossible de rendre le composant TableDataScreen, car la fonction registerApp n'a pas été initialisé avec un composant devant servir pour le rendu des TableData screens item";
    }
    const {params:cParams,data,tableName:tbName,table:tb2} = fromTableDataLink===true ? props : getRouteOptions(props);
    const params = extendObj({},props.params,cParams);
    const {getTable} = useExpo();
    const tableName = defaultStr(params?.tableName,params?.table,tbName,tb2,props.tableName,props?.table);
    const tableObj = getTable(tableName);
    if(!isObj(tableObj)){
        return <ScreenError {...props} tableName={tableName}/>
    }
    return <Item testID={"RN_TableDataScreenItem_"+(defaultStr(tableName)).toUpperCase()}{...props} tableObj={tableObj} data={data} tableName={tableName} {...params}/>
}

TableDataScreenItem.displayName = "TableDataScreenItem";

export function TableDataLinkScreen(_p){
    const {params,...p} = getRouteOptions(_p);
    const foreignKeyTable = params.foreignKeyTable = params.tableName = defaultStr(params.foreignKeyTable,params?.tableName,params.table,p.foreignKeyTable,p.tableName,p.table);
    const foreignKeyColumn = params.foreignKeyColumn = defaultStr(params.foreignKeyColumn,p.foreignKeyColumn);
    const id = params.id = defaultVal(params.id,p.id,params.value,p.id);
    const {navigate,fetchData,isAllowed,...props} = usePrepareProps({...p,...params,foreignKeyTable,foreignKeyColumn,id});
    const [content,setContent] = useState(null);
    const [data,setData] = useState(null);
    const isLoading = !isObj(data);
    params.data = data;
    useEffect(()=>{
        if(!isAllowed()){
            setContent(<NotAllowed />)
            return ()=>{};
        }
        fetchData().then((data)=>{setData(data)}).catch(notify.error);
        return ()=>{}
    },[]);
    const Component = React.useMemo(()=>{
        const tableScreenName = getTableDataRouteName(foreignKeyTable);
        const tableScreenP = tableScreenName && allFoundScreens[tableScreenName] || null;
        if(!tableScreenP) return TableDataScreenItem;
        if(React.isComponent(tableScreenP)) return tableScreenP;
        if(React.isComponent(tableScreenP?.Component)){
            return tableScreenP.Component;
        }
        return TableDataScreenItem;
     },[foreignKeyTable]);
    return <Component
        children = {content||<FormLoader/>}
        isLoading = {isLoading}
        {..._p}
        {...props}
        fromTableDataLink
        params = {params}
        data = {data}
    />
}

TableDataLinkScreen.screenName = tableDataLinkRouteName;
TableDataLinkScreen.Modal = true;

function NotAllowed(){
    return <View style={[theme.styles.flex1,theme.styles.h100,theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.alignItemsCenter]}>
        <Label error textBold fontSize={18}>Vous n'êtes pas autorisé à accéder à la resource demandée!!!Veuillez contacter votre administrateur.</Label>
    </View>
}

export function ScreenError({tableName,children,...props}){
    console.log("table data link with tableName ",tableName," has error for props ",props);
    return <Screen {...props}>
        <View style={[theme.styles.w100,theme.styles.p2,theme.styles.h100,theme.styles.justifyContentCenter,theme.styles.textAlignCenter]}>
            <Label textBold error fontSize={18}>
                {React.isValidElement(children,true) && children || `Objet table invalide, impossible de rendre le contenu de la tableDataScreen liée à la table [${tableName?.toString()}]`}
            </Label>
            <Label textBold fontSize={15}>Impossible d'afficher la requête demandée!!</Label>
        </View>
    </Screen>
}