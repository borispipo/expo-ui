// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Dropdown from "$ecomponents/Dropdown";
import {defaultStr,extendObj,isFunction,setQueryParams,defaultVal,isObjOrArray,defaultObj} from "$cutils";
import PropTypes from "prop-types";
import actions from "$cactions";
import {navigateToTableData} from "$enavigation/utils";
import {getFetchOptions,prepareFilters,parseMangoQueries as filtersParseMangoQueries} from "$cutils/filters";
import fetch from "$capi"
import React from "$react";
import useApp from "$econtext/hooks";
import DateLib from "$lib/date";
import {useSWR} from "$econtext/hooks";
import stableHash from "stable-hash";

/*** la tabledataSelectField permet de faire des requêtes distantes pour rechercher les données
 *  Elle doit prendre en paramètre et de manière requis : les props suivante : 
 *  foreignKeyColumn : La colonne dont le champ fait référence à la clé étrangère, ie fKeyTable dans laquelle faire les requêtes fetch
 *  foreignKeyTable : la tableData dans laquelle effectuer les donées de la requêtes
 *  foreignKeyLabel : Le libélé dans la table étrangère
 */
const TableDataSelectField = React.forwardRef(({foreignKeyColumn,swrOptions,foreignKeyLabelRenderers,onChange,isStructData,getForeignKeyTable:cGetForeignKeyTable,prepareFilters:cPrepareFilters,bindUpsert2RemoveEvents,onAdd,showAdd:customShowAdd,canShowAdd,foreignKeyTable,fetchItemsPath,foreignKeyLabel,foreignKeyLabelIndex,dropdownActions,fields,fetchItems:customFetchItem,parseMangoQueries,mutateFetchedItems,onFetchItems,isFilter,isUpdate,isDocEditing,items:customItems,onAddProps,fetchOptions,...props},ref)=>{
    props.data = defaultObj(props.data);
    const type = defaultStr(props.type)?.toLowerCase();
    isStructData = isStructData || type?.replaceAll("-","").replaceAll("_","").trim().contains("structdata");
    const {getTableData:appGetForeignKeyTable,getStructData,components:{datagrid}} = useApp();
    if(!foreignKeyColumn && isNonNullString(props.field)){
        foreignKeyColumn = props.field;
    }
    if(isNonNullString(foreignKeyColumn)){
        foreignKeyColumn = foreignKeyColumn.trim();
    }
    if(isNonNullString(foreignKeyLabel)){
        foreignKeyLabel = foreignKeyLabel.trim().ltrim("[").rtrim("]").split(",");
        if(!isNonNullString(foreignKeyColumn)){
            foreignKeyLabel = foreignKeyLabel.filter((f)=>f?.toLowerCase()?.trim() !== foreignKeyColumn.toLowerCase().trim());
        }
    }
    const getForeignKeyTable = typeof cGetForeignKeyTable =='function'? cGetForeignKeyTable : isStructData ? getStructData: appGetForeignKeyTable;
    parseMangoQueries = defaultBool(parseMangoQueries,datagrid?.parseMangoQueries);
    const parseMangoQueriesRef = React.useRef(parseMangoQueries);
    parseMangoQueriesRef.current = parseMangoQueries;
    const foreignKeyTableStr = defaultStr(foreignKeyTable,props.tableName,props.table);
    const errors = [];
    if(typeof getForeignKeyTable !=='function'){
        errors.push("la fonction getTableData non définie des les paramètres d'initialisation de l'application!!! Rassurez vous d'avoir définier cette fonction!!, options : foreignKeyTable:",foreignKeyTable,"foreignKeyColumn:",foreignKeyColumn,props)
    }
    let fKeyTable = getForeignKeyTable(foreignKeyTableStr,props);
    fetchItemsPath = defaultStr(fetchItemsPath).trim();
    if(!fetchItemsPath && (!isObj(fKeyTable) || !(defaultStr(fKeyTable.tableName,fKeyTable.table)))){
        errors.push("type de données invalide pour la foreignKeyTable ",foreignKeyTable," label : ",foreignKeyLabel,fKeyTable," composant SelectTableData",foreignKeyColumn,foreignKeyTable,props);
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
    const queryPath = fetchItemsPath || typeof fKeyTable.queryPath =='string' && fKeyTable.queryPath || foreignKeyTable;
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
    const foreignKeyColumnValue = props.defaultValue;
    const defaultValueRef = React.useRef(props.multiple ? Object.toArray(foreignKeyColumnValue) : foreignKeyColumnValue);
    let isDisabled = defaultBool(props.disabled,props.readOnly,false);
    if(!isDisabled && props.readOnly === true){
        isDisabled = true;
    }
    const hasErrors = !!errors.length;
    if(!hasErrors){
        fetchOptions = Object.clone(defaultObj(fetchOptions));
        if(fetchOptions.fields !== 'all' && (!Array.isArray(fetchOptions.fields) || !fetchOptions.fields.length)){
            fetchOptions.fields = defaultFields;
        }
        if(fetchOptions.fields =='all'){
            delete fetchOptions.fields;
        }
    }
    const hashKey = React.useMemo(()=>{
        return stableHash(fetchOptions);
    },[fetchOptions]);
    const hasRefreshedRef = React.useRef(false);
    const showAdd = React.useMemo(()=>{
        if(isFilter || !foreignKeyTable) return false;
        if(typeof canShowAdd ==='function'){
            return !!canShowAdd({...props,table:foreignKeyTable,foreignKeyColumn,foreignKeyLabel,sortDir,foreignKeyTableObj:fKeyTable,foreignKeyTable})
        } else if(Auth[isStructData?"isStructDataAllowed":"isTableDataAllowed"]({table:foreignKeyTable,action:'create'})){
            return !!defaultVal(customShowAdd,true);
        }
        return false;
    },[isFilter,foreignKeyTable,customShowAdd]);
    
    const fetchItemsRef = React.useRef(customFetchItem);
    fetchItemsRef.current = customFetchItem;
    swrOptions = Object.assign({},swrOptions);
    ///@see : https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations
    if(isFilter || isDisabled){
        swrOptions.refreshInterval = 0;
        swrOptions.revalidateOnFocus = false;
        swrOptions.revalidateIfStale = false;
        swrOptions.revalidateOnMount = false;
        swrOptions.revalidateOnReconnect = false;
    }
    const restOptionsRef = React.useRef({});
    const fetchedResultRef = React.useRef({});
    restOptionsRef.current = {foreignKeyTable,foreignKeyColumn,foreignKeyLabel,foreignKeyColumnValue,sort,sortColumn,sortDir,foreignKeyTableObj:fKeyTable};
    const queryPathKey = isNonNullString(queryPath) ? setQueryParams(queryPath,{isstabledata:1,"stabledathkey":hashKey,foreignKeyColumn:defaultStr(foreignKeyColumn).toLowerCase()}) : null;
    const onFetchItemsRef = React.useRef();
    onFetchItemsRef.current = onFetchItems;
    const mutateFetchedItemsRef = React.useRef();
    mutateFetchedItemsRef.current = mutateFetchedItems;
    const {isLoading:cIsLoading,data:fetchedItems,isValidating,refresh} = useSWR(hasErrors?null:queryPathKey,{
        fetcher : (url,opts1)=>{
            if(typeof beforeFetchItems ==='function' && beforeFetchItems({fetchOptions}) === false) return Promise.resolve(fetchedResultRef.current);
            let opts = Object.clone(fetchOptions);
            if(parseMangoQueries.current){
                opts.selector = filtersParseMangoQueries(opts.selector);
                opts = getFetchOptions(opts);
                delete opts.selector;
            } else {
                opts = {fetchOptions:opts};
            }
            opts.showError = false;
            const cFetch = typeof fetchItemsRef.current =="function" && fetchItemsRef.current || false;
            const fetchingOpts = {...props,...opts1,...opts,...restOptionsRef.current};
            return Promise.resolve((cFetch||fetch)(queryPath||url,fetchingOpts)).then((args)=>{
                if(Array.isArray(args)){
                    args = {items : args};
                } else if(!isObj(args)) {
                    args = {items:[]}
                }
                args.items = args.data = Array.isArray(args.items) ? args.items : Array.isArray(args.data) ? args.data : [];
                if(typeof mutateFetchedItemsRef.current =='function'){
                    const itx = mutateFetchedItemsRef.current(args.items);
                    if(Array.isArray(itx)){
                        args.items = args.data = itx;
                    }
                }
                if(typeof onFetchItemsRef.current ==='function'){
                    onFetchItemsRef.current({...args,context:{refresh},props});
                }
                hasRefreshedRef.current = true;
                fetchedResultRef.current = args;
                return fetchedResultRef.current;
            }).catch((e)=>{
                console.log(e," fetching list of data select table data ",foreignKeyColumn,foreignKeyTable)
            });
        },
        showError : false,
        swrOptions,
    });
    const isLoading = cIsLoading || isValidating;
    const items = React.useMemo(()=>{
        const fItems = isObj(fetchedItems)? fetchedItems: fetchedResultRef.current;
        if(!isObj(fItems) || !Array.isArray(fItems.items)) return [];
        return fItems.items;
    },[fetchedItems]);
    React.useEffect(()=>{
        if(bindUpsert2RemoveEvents === false || !(foreignKeyTableStr)){
            return ()=>{}
        }
        const onUpsertData = ()=>{
            return isMounted()?refresh():undefined
        };
        APP.on(actions.upsert(foreignKeyTableStr),onUpsertData);
        APP.on(actions.onRemove(foreignKeyTableStr),onUpsertData);
        return ()=>{
            APP.off(actions.upsert(foreignKeyTableStr),onUpsertData);
            APP.off(actions.onRemove(foreignKeyTableStr),onUpsertData);
        };
    },[foreignKeyTableStr,bindUpsert2RemoveEvents]);
    if(hasErrors) {
        console.error(...errors);
        return null;
    }
    dropdownActions = isObj(dropdownActions)? {...dropdownActions} : isArray(dropdownActions)? [...dropdownActions] : []
    const isDropdonwsActionsArray = isArray(dropdownActions);
    const refreshItem = {
        text : 'Rafraichir',
        onPress : refresh,
        icon : 'refresh',
    }
    if(isDropdonwsActionsArray){
        dropdownActions.push(refreshItem)
    } else {
        dropdownActions.trefreshItem = refreshItem;
    }
    foreignKeyLabelRenderers = defaultObj(foreignKeyLabelRenderers);
    const rItem = (p)=>{
        if(!isObj(p) || !isObj(p.item)) return null;
        let itemLabel = typeof foreignKeyLabel =='function'? foreignKeyLabel(p) : undefined;
        if(Array.isArray(foreignKeyLabel)){
            let itl = "";
            foreignKeyLabel.map(fk=>{
                if(!isNonNullString(fk)) return;
                const render = foreignKeyLabelRenderers[fk.trim()];
                let itv = p.item[fk];
                if(typeof render =='function'){
                    itv = render(p);
                } else {
                    ///render c'est le type de données
                    if(isNonNullString(render)){
                        const t = render?.toLowerCase().trim();
                        if(["date","datetime"].includes(t)){
                            itv = DateLib.format(itv,t=='date'?DateLib.defaultDateFormat:DateLib.defaultDateTimeFormat);
                        } else if(typeof itv =='number'){
                            itv = t =='money'? itv.formatMoney()  : itv.formatNumber();
                        }
                    }  else {
                        /***
                            if(typeof itv =='string' && itv && DateLib.isIsoDateStr(itv)){
                                itv = DateLib.format(itv,DateLib.defaultDateFormat);
                            }
                        */
                    }
                }
                itl+= (itl?" ":"")+ (itv || defaultStr(itv))
            });
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
    return <Dropdown
        {...props}
        items = {items}
        isFilter = {isFilter}
        showAdd = {showAdd}
        isLoading = {isLoading}
        dialogProps = {dialogProps}
        onChange = {(...args)=>{
            if(isFilter){
                if(!hasRefreshedRef.current) return;
                if(JSON.stringify(defaultValueRef.current) === JSON.stringify(args[0]?.value)) return;
                defaultValueRef.current = args[0]?.value;
            }
            if(onChange) return onChange(...args);
        }}
        ref = {ref}
        defaultValue = {foreignKeyColumnValue}
        dropdownActions = {dropdownActions}
        context = {{refresh}}
        itemValue = {(p,...rest) => {
            if(typeof props.itemValue ==='function'){
                return props.itemValue(p,...rest);
            }
            return p.item[foreignKeyColumn];
        }}
        renderItem = {(p,...rest) => {
            if(typeof props.renderItem ==='function'){
                return props.renderItem(p,...rest);
            }
            if(typeof props.renderText =='function'){
                return props.renderText(p,...rest);
            }
            return rItem(p,...rest);
        }}
        renderText = {(p,...rest) => {
            if(typeof props.renderText ==='function'){
                return props.renderText(p,...rest);
            }
            if(typeof props.renderItem ==='function'){
                return props.renderItem(p,...rest);
            }
            return rItem(p,...rest);
        }}
        onAdd = {(args)=>{
            onAddProps = defaultObj(isFunction(onAddProps)? onAddProps({context:{refresh},foreignKeyTable,dbName,props}) : onAddProps);
            if(typeof onAdd =='function'){
                return onAdd({...args,...onAddProps});
            }
            return navigateToTableData(foreignKeyTable,{routeParams:{...onAddProps,foreignKeyTable,table:foreignKeyTable,foreignKeyColumn,tableName : foreignKeyTable}});
        }}
    />
});

TableDataSelectField.propTypes = {
    ...Dropdown.propTypes,
    swrOptions : PropTypes.object,//les options supplémentaires à passer à la fonction swr
    /*** permet de faire le mappage entre les foreignKeyLabel et les type correspondants */
    foreignKeyLabelRenderers : PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.string, //représente le type de données associée à la colone dont le nom la clé 
        PropTypes.func, //la fonction utilisée pour le rendu des colonnes de ce type
    ])),
    prepareFilters : PropTypes.bool,//si les filtres seront customisé
    bindUpsert2RemoveEvents : PropTypes.bool,//si le composant écoutera l'évènement de rafraichissement des données
    onAdd : PropTypes.func, //({})=>, la fonction appelée lorsque l'on clique sur le bouton add
    canShowAdd : PropTypes.func, //({foreignKeyTable,foreignKeyColumn})=><boolean> la fonction permettant de spécifier si l'on peut afficher le bouton showAdd
    //la fonction permettant d'effectuer une mutation sur l'ensemble des donnéees récupérées à distance
    //si le résultat de cette fonction est un array, alors le array en question représentera les nouvelles valeurs des items à considérer
    mutateFetchedItems : PropTypes.func, 
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
    parseMangoQueries : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),// si l'on doit convertir les selecteurs de filtres au format SQl
}

export default TableDataSelectField;

TableDataSelectField.displayName = "TableDataSelectField";