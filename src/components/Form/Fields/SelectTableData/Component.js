// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Dropdown from "$ecomponents/Dropdown";
import {defaultStr,extendObj,isFunction,defaultVal,isObjOrArray,defaultObj} from "$cutils";
import PropTypes from "prop-types";
import actions from "$cactions";
import {navigateToTableData} from "$enavigation/utils";
import {getFetchOptions,prepareFilters} from "$cutils/filters";
import fetch from "$capi"
import {willConvertFiltersToSQL} from "$ecomponents/Datagrid/utils";
import React from "$react";
import useApp from "$econtext/hooks";

/*** la tabledataSelectField permet de faire des requêtes distantes pour rechercher les données
 *  Elle doit prendre en paramètre et de manière requis : les props suivante : 
 *  foreignKeyColumn : La colonne dont le champ fait référence à la clé étrangère, ie fKeyTable dans laquelle faire les requêtes fetch
 *  foreignKeyTable : la tableData dans laquelle effectuer les donées de la requêtes
 *  foreignKeyLabel : Le libélé dans la table étrangère
 */
const TableDataSelectField = React.forwardRef(({foreignKeyColumn,isStructData,getForeignKeyTable:cGetForeignKeyTable,prepareFilters:cPrepareFilters,bindUpsert2RemoveEvents,onAdd,showAdd:customShowAdd,canShowAdd,foreignKeyTable,fetchItemsPath,foreignKeyLabel,foreignKeyLabelIndex,dropdownActions,fields,fetchItems:customFetchItem,convertFiltersToSQL,mutateFetchedItems,onFetchItems,isFilter,isUpdate,isDocEditing,items,onAddProps,fetchOptions,...props},ref)=>{
    props.data = defaultObj(props.data);
    const {getTableData:appGetForeignKeyTable,getStructData} = useApp();
    if(!foreignKeyColumn && isNonNullString(props.field)){
        foreignKeyColumn = props.field;
    }
    if(isNonNullString(foreignKeyColumn)){
        foreignKeyColumn = foreignKeyColumn.trim();
    }
    if(isNonNullString(foreignKeyLabel)){
        foreignKeyLabel = foreignKeyLabel.trim();
        foreignKeyLabel = foreignKeyLabel.ltrim("[").rtrim("]").split(",");
    }
    const getForeignKeyTable = typeof cGetForeignKeyTable =='function'? cGetForeignKeyTable : isStructData ? getStructData: appGetForeignKeyTable;
    convertFiltersToSQL = defaultVal(convertFiltersToSQL,willConvertFiltersToSQL());
    const foreignKeyTableStr = defaultStr(foreignKeyTable,props.tableName,props.table);
    if(typeof getForeignKeyTable !=='function'){
        console.error("la fonction getTableData non définie des les paramètres d'initialisation de l'application!!! Rassurez vous d'avoir définier cette fonction!!, options : foreignKeyTable:",foreignKeyTable,"foreignKeyColumn:",foreignKeyColumn,props)
        return null;
    }
    let fKeyTable = getForeignKeyTable(foreignKeyTableStr,props);
    fetchItemsPath = defaultStr(fetchItemsPath).trim();
    if(!fetchItemsPath && (!isObj(fKeyTable) || !(defaultStr(fKeyTable.tableName,fKeyTable.table)))){
        console.error("type de données invalide pour la foreignKeyTable ",foreignKeyTable," label : ",foreignKeyLabel,fKeyTable," composant SelectTableData",foreignKeyColumn,foreignKeyTable,props);
        return null;
    }
    fKeyTable = defaultObj(fKeyTable);
    foreignKeyTable = defaultStr(fKeyTable.tableName,fKeyTable.table,foreignKeyTable).trim().toUpperCase();
    const sortColumn = defaultStr(fKeyTable.defaultSortColumn);
    const sortDir = defaultStr(fKeyTable.defaultSortOrder).toLowerCase().trim();
    const sort = {};
    if(sortColumn){
        sort.column = sortColumn;
        if(sortDir =='asc' || sortDir =='desc'){
            sort.dir = sortDir;
        }
    }
    const isMounted = React.useIsMounted();
    
    const [state,setState] = React.useState({
        items : [],
    });
    const [isLoading,setIsLoading] = React.useState(true);
    fetchOptions = Object.clone(defaultObj(fetchOptions));
    const queryPath = fetchItemsPath || typeof fKeyTable.queryPath =='string' && fKeyTable.queryPath || typeof fKeyTable.fetchPath =='string' && fKeyTable.fetchPath || '';
    
    isUpdate = defaultBool(isUpdate,typeof isDocEditing ==='function' && isDocEditing({data:props.data,foreignKeyTable,foreignKeyColumn}));
    if(isFilter){
        isUpdate = false;
    }
    const defaultFields = Array.isArray(foreignKeyColumn)? foreignKeyColumn : [foreignKeyColumn];
    if(Array.isArray(foreignKeyLabel)){
        foreignKeyLabel.map(f=>{
            if(isNonNullString(f) && !defaultFields.includes(f.trim())){
                defaultFields.push(f.trim());
            }
        })
    }
    if(isNonNullString(foreignKeyLabel)){
        foreignKeyLabel = foreignKeyLabel.trim();
        defaultFields.push(foreignKeyLabel);
    } 
    if(fetchOptions.fields !== 'all' && (!Array.isArray(fetchOptions.fields) || !fetchOptions.fields.length)){
        fetchOptions.fields = defaultFields;
    }
    const foreignKeyColumnValue = props.defaultValue;
    let isDisabled = defaultBool(props.disabled,props.readOnly,false);
    if(!isDisabled && props.readOnly === true){
        isDisabled = true;
    }
    if(isUpdate && isNonNullString(foreignKeyColumnValue) && (isDisabled)){
        fetchOptions.selector = defaultObj(fetchOptions.selector);
        fetchOptions.selector.$and = defaultArray(fetchOptions.selector.$and);
        let hasF = false;
        for(let i in fetchOptions.selector.$and){
            const cFilter = fetchOptions.selector.$and[i];
            if(isObj(cFilter)) {
                if(cFilter[foreignKeyColumn] === foreignKeyColumnValue){
                    hasF = true;
                    break;
                }
            }
        }
        if(!hasF){
            fetchOptions.selector.$and.push({[foreignKeyColumn] : foreignKeyColumnValue})
        }
    }
    React.useEffect(()=>{
        context.refresh();
        if(bindUpsert2RemoveEvents !== false){
            const onUpsertData = ()=>{return isMounted()?context.refresh():undefined};
            APP.on(actions.upsert(foreignKeyTable),onUpsertData);
            APP.on(actions.onRemove(foreignKeyTable),onUpsertData);
            return ()=>{
                APP.off(actions.upsert(foreignKeyTable),onUpsertData);
                APP.off(actions.onRemove(foreignKeyTable),onUpsertData);
            };
        }
        return ()=>{
            
        }
    },[]);
    
    let dat = isNonNullString(foreignKeyColumnValue)? {
        [foreignKeyColumn]:foreignKeyColumnValue, 
        ...(isNonNullString(foreignKeyLabel) ? {[foreignKeyLabel]:foreignKeyColumnValue+", introuvable dans le système"}:{})
    } : null;
    const cFetch = typeof customFetchItem =='function' && customFetchItem;
    const fetchItems = (opts)=>{
        opts.showError = false;
        if(sortColumn){
            opts.sort = sort;
        }
        if(cFetch) return cFetch(queryPath,{...props,sort:{column:sortColumn,dir:sortDir},sortColumn,isUpdate,foreignKeyColumn,foreignKeyLabel,sortDir,foreignKeyTableObj:fKeyTable,foreignKeyTable,...opts});
        if(queryPath){
            return fetch(queryPath,opts);
        }
    };
    const context = {
        refresh : (force,cb)=>{
            if(!isMounted()) return;
            if(typeof beforeFetchItems ==='function' && beforeFetchItems(fetchOptions) === false) return;
            let opts = Object.clone(fetchOptions);
            if(cPrepareFilters !== false){
                opts.selector = prepareFilters(fetchOptions.selector,{convertToSQL:convertFiltersToSQL});
                opts = getFetchOptions(opts);
            } else {
                opts = {fetchOptions};
            }
            const r = fetchItems(opts);
            if(r === false) return;
            setIsLoading(true);
            if(isPromise(r)){
                r.then((args)=>{
                    if(Array.isArray(args)){
                        args = {data : args};
                    }
                    if(!isObj(args)) {
                        args = {items:[]}
                    }
                    let items = args.items = args.data = Array.isArray(args.items) ? args.items : Array.isArray(args.data) ? args.data : [];
                    if(dat && isUpdate){
                        if(isFunction(mutateFetchedItems)){
                            items = mutateFetchedItems(items);
                        }
                        let hasFound = false;
                        if(!isObjOrArray(items)) items = [];
                        for(let i in items){
                            if(isObj(items[i]) && items[i][foreignKeyColumn] == foreignKeyColumnValue){
                                hasFound = true;
                                break;
                            }
                        }
                        if(!hasFound){
                            if(Array.isArray(items)){
                                items.push(dat); 
                            } else {
                                items[foreignKeyColumnValue] = dat;
                            }
                        }
                    }
                    setState({...state,items});
                    if(onFetchItems){
                        onFetchItems({data:items,items,context,props});
                    }
                }).catch((e)=>{
                    console.log(e," fetching list of data select table data ",foreignKeyColumn,foreignKeyTable)
                }).finally((e)=>{
                    setIsLoading(false);
                })
            } else {
                setIsLoading(false);
            }
        }
    }
    const prevIsUpdate = React.usePrevious(isUpdate);
    const prevDefaultValue = React.usePrevious(foreignKeyColumnValue);
    /*if(!isFilter){
        React.useEffect(()=>{
            if(prevIsUpdate === isUpdate && JSON.stringify(prevDefaultValue) === JSON.stringify(foreignKeyColumnValue)) return;
            context.refresh();
        },[isUpdate,foreignKeyColumnValue])
    }*/
    dropdownActions = isObj(dropdownActions)? {...dropdownActions} : isArray(dropdownActions)? [...dropdownActions] : []
    const isDropdonwsActionsArray = isArray(dropdownActions);
    const refreshItem = {
        text : 'Rafraichir',
        onPress : context.refresh,
        icon : 'refresh',
    }
    if(isDropdonwsActionsArray){
        dropdownActions.push(refreshItem)
    } else {
        dropdownActions.trefreshItem = refreshItem;
    }
    const rItem = (p)=>{
        if(!isObj(p) || !isObj(p.item)) return null;
        let itemLabel = typeof foreignKeyLabel =='function'? foreignKeyLabel(p) : undefined;
        if(Array.isArray(foreignKeyLabel)){
            let itl = "";
            foreignKeyLabel.map(fk=>{
                if(!fk) return;
                const itv = p.item[fk];
                itl+= (itl?" ":"")+ (typeof itv =='number' && itv || defaultStr(itv))
            })
            if(itl){
                itemLabel = itl;
            }
            
        }
        if(!itemLabel && isNonNullString(foreignKeyLabel)){
            itemLabel = defaultStr(p.item[foreignKeyLabel] !== undefined && p.item[foreignKeyLabel] !== null && p.item[foreignKeyLabel].toString(), p.item[foreignKeyColumn] !== undefined && p.item[foreignKeyColumn] !== null && p.item[foreignKeyColumn].toString());
        }
        const itemCode = p.item[foreignKeyColumn] !== undefined && p.item[foreignKeyColumn] !== null && p.item[foreignKeyColumn].toString() || undefined;
        if(!isNonNullString(itemLabel)){
            itemLabel = "";
        }
        if(!itemLabel) return itemCode;
        return (itemLabel !== itemCode ? ((isNonNullString(itemCode)?("["+itemCode+"] "):"")+itemLabel):itemLabel);
    }
    const dialogProps = defaultObj(props.dialogProps);
    let ttitle = defaultStr(dialogProps.title);
    if(!ttitle){
        const txt = defaultStr(props.label,props.text);
        const tt = defaultStr(fKeyTable.text,fKeyTable.label);
        ttitle = txt && tt ? "{0} [{1}]".sprintf(txt,tt) : tt || txt;
    }
    dialogProps.title = ttitle;
    const showAdd = React.useMemo(()=>{
        if(isFilter || !foreignKeyTable) return false;
        if(typeof canShowAdd ==='function'){
            return canShowAdd({...props,table:foreignKeyTable,foreignKeyColumn,foreignKeyLabel,sortDir,foreignKeyTableObj:fKeyTable,foreignKeyTable})
        }
        if(Auth.isTableDataAllowed({table:foreignKeyTable,action:'create'})){
            return !!defaultVal(customShowAdd,true);
        }
        return false;
    },[isFilter,foreignKeyTable,customShowAdd]);
    return <Dropdown
        {...props}
        isFilter = {isFilter}
        showAdd = {showAdd}
        {...state}
        isLoading = {isLoading}
        dialogProps = {dialogProps}
        ref = {ref}
        defaultValue = {foreignKeyColumnValue}
        dropdownActions = {dropdownActions}
        context = {context}
        itemValue = {(p) => {
            if(typeof props.itemValue ==='function'){
                return props.itemValue(p);
            }
            return p.item[foreignKeyColumn];
        }}
        renderItem = {(p) => {
            if(typeof props.renderItem ==='function'){
                return props.renderItem(p);
            }
            if(typeof props.renderText =='function'){
                return props.renderText(p);
            }
            return rItem(p);
        }}
        renderText = {(p) => {
            if(typeof props.renderText ==='function'){
                return props.renderText(p);
            }
            if(typeof props.renderItem ==='function'){
                return props.renderItem(p);
            }
            return rItem(p);
        }}
        onAdd = {(args)=>{
            onAddProps = defaultObj(isFunction(onAddProps)? onAddProps.call(context,{context,foreignKeyTable,dbName,props}) : onAddProps);
            if(typeof onAdd =='function'){
                return onAdd({...args,...onAddProps});
            }
            return navigateToTableData(foreignKeyTable,{routeParams:{...onAddProps,foreignKeyTable,table:foreignKeyTable,foreignKeyColumn,tableName : foreignKeyTable}});
        }}
    />
});

TableDataSelectField.propTypes = {
    ...Dropdown.propTypes,
    prepareFilters : PropTypes.bool,//si les filtres seront customisé
    bindUpsert2RemoveEvents : PropTypes.bool,//si le composant écoutera l'évènement de rafraichissement des données
    onAdd : PropTypes.func, //({})=>, la fonction appelée lorsque l'on clique sur le bouton add
    canShowAdd : PropTypes.func, //({foreignKeyTable,foreignKeyColumn})=><boolean> la fonction permettant de spécifier si l'on peut afficher le bouton showAdd
    mutateFetchedItems : PropTypes.func, //la fonction permettant d'effectuer une mutation sur l'ensemble des donnéees récupérées à distance
    fetchItems : PropTypes.func,//la fonction de rappel à utiliser pour faire une requête fetch permettant de selectionner les données à distance
    foreignKeyTable : PropTypes.string, //le nom de la fKeyTable data à laquelle se reporte le champ
    fetchItemsPath : PropTypes.string, //le chemin d'api pour récupérer les items des données étrangères en utilisant la fonction fetch
    beforeFetchItems : PropTypes.func, //appelée immédiatement avant l'exécution de la requête fetch
    foreignKeyColumn : PropTypes.string,//le nom de la clé étrangère à laquelle fait référence la colone dans la fKeyTable
    foreignKeyLabel : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string), ///si c'est un tableau, il s'agit des colonnes qui seront utilisées pour le rendu du foreignKey
        PropTypes.func, //s'il s'agit d'une fonciton qui sera appelée
    ]),
    /***les séparateurs de label */
    foreignKeyLabelIndex : PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func, //s'il s'agit d'une fonciton qui sera appelée
    ]),
    onFetchItems : PropTypes.func,
    fetchOptions : PropTypes.shape({
        fields : PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
            PropTypes.array,
        ])
    }),
    itemValue : PropTypes.func,
    renderItem : PropTypes.func,
    renderText : PropTypes.func,
    convertFiltersToSQL : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),// si l'on doit convertir les selecteurs de filtres au format SQl
}

export default TableDataSelectField;

TableDataSelectField.displayName = "TableDataSelectField";