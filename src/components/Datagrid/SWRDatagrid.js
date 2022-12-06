// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Datagrid from "./IndexComponent";
import {defaultStr,defaultObj,defaultVal,extendObj} from "$utils";
import React from "$react";
import Auth from "$cauth";
import DateLib from "$lib/date";
import {getFetchOptions} from "$cutils/filters";
import {setQueryParams} from "$cutils/uri";
import Icon from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import { StyleSheet,View } from "react-native";
import theme from "$theme";
import useSWR,{useInfinite} from "$swr";
import appConfig from "$capp/config";
import APP from "$capp/instance";
import cAction from "$cactions";
import PropTypes from "prop-types";

const timeout = 5000*60*60;
export const swrOptions = {
    refreshInterval : timeout, //5 minutes
    shouldRetryOnError : false, //retry when fetcher has an error
    dedupingInterval : timeout,
    errorRetryInterval : timeout*2,
    errorRetryCount : 5,
}

const SWRDatagridComponent = React.forwardRef((props,ref)=>{
    let {
        table,
        data,
        saveButton,
        title,
        fab,
        rowKey,
        actions,
        sessionName,
        server,
        columns,
        canMakePhoneCall,
        makePhoneCallProps,
        fetchData,
        fetchPath,
        fetcher,
        ...rest
    } = props;
    rest = defaultObj(rest);
    rest.exportTableProps = defaultObj(rest.exportTableProps)
    const tableName = defaultStr(table.tableName,table.table).trim().toUpperCase();
    canMakePhoneCall = defaultBool(canMakePhoneCall,table.canMakePhoneCall);
    makePhoneCallProps = defaultObj(makePhoneCallProps,rest.makePhoneCallProps,table.makePhoneCallProps);
    const isExportable = !!Auth.isTableDataAllowed({table:tableName,action:'export'});
    rest.exportable = isExportable;
    rowKey = defaultStr(rowKey,table.rowKey,table.primaryKeyColumnName);
    title = defaultStr(title,table.label,table.text)
    columns = table.fields;
    const fetchFields = [];
    Object.map(columns,(column,i)=>{
        if(isObj(column)){
            fetchFields.push(defaultStr(column.field,i));
        }
    })
    actions = defaultVal(table.actions,actions);
    for(let i in Datagrid.propTypes){
        if(i in table){
            rest[i] = isObj(rest[i])? extendObj(true,{},rest[i],table[i]) : table[i];
        }
    }
    rest.actions = actions;
    rest.columns = columns || [];
    const icon = defaultStr(table.icon);
    rest.tableName = tableName;
    rest.canMakePhoneCall = canMakePhoneCall;
    rest.makePhoneCallProps = makePhoneCallProps;
    rest.exportTableProps.fileName = defaultStr(rest.exportTableProps.fileName,title+"-"+DateLib.format(DateLib.toObj(),'dd-mm-yyyy HH-MM'))
    rest.exportTableProps.pdf = defaultObj(rest.exportTableProps.pdf);
    rest.exportTableProps.pdf = extendObj(true,{},{
        fileName : rest.exportTableProps.fileName,
        title
    },rest.exportTableProps.pdf);
    const fetchOptionsRef = React.useRef({});
    fetchPath = defaultStr(fetchPath,table.queryPath,tableName.toLowerCase()).trim();
    const innerRef = React.useRef(null);
    let {data:fetchedData, error, isValidating,size, setSize,isLoading,refresh} =  useSWR(fetchPath,{
        fetchOptionsMutator : (opts)=>{
            const {url} = opts;
            const fo = fetchOptionsRef.current;
            if(Object.size(fo.queryParams,true)){
                return {url : setQueryParams(url,fo.queryParams)};
            }
        },
        fetcher,
        showError  : false,
        swrOptions : {
            ...swrOptions,
            ...defaultObj(appConfig.swr),
        },
    });
    React.useEffect(()=>{
        innerRef.current && innerRef.current.setIsLoading && innerRef.current.setIsLoading(isLoading);
    },[isLoading])
    React.useEffect(()=>{
        const upsert = cAction.upsert(tableName);
        const remove = cAction.remove(tableName);
        APP.on(remove,refresh);
        APP.on(upsert,refresh);
        return ()=>{
            APP.off(upsert,refresh);
            APP.off(remove,refresh);
        }
    },[])
    return (
        <Datagrid 
            {...rest}
            {...defaultObj(table.datagrid)} 
            isLoading = {isLoading|| isValidating}
            beforeFetchData = {({fetchOptions:opts})=>{
                opts.fields = fetchFields;
                opts = getFetchOptions({fetcher,...opts});
                fetchOptionsRef.current = opts;
                refresh();
            }}
            fetchData = {undefined}
            data = {error ? data : defaultObj(fetchedData).data}
            canMakePhoneCall={canMakePhoneCall} 
            key={tableName} 
            sessionName={defaultStr(sessionName,'list-data')} 
            ref={React.useMergeRefs(ref,innerRef)} 
            rowKey={rowKey}
            renderEmpty = {(p)=>{
                return <View style={styles.emptyAccordion}>
                    {icon ? <Icon name={icon} color={theme.colors.primaryOnSurface} size={80}/> : null}
                    {<Label secondary style={styles.labelTitle}>{title}</Label>}
                    <Label  style={[styles.emptyText]}>
                        {"Aucune données enrégistrée!!"}
                    </Label>
                </View>
            }}    
        />
    )
});

export default SWRDatagridComponent;

SWRDatagridComponent.displayName = "SWRDatagridComponent";

SWRDatagridComponent.propTypes = {
    ...Datagrid.propTypes,
    fetchPath : PropTypes.string,
    fetchData : PropTypes.func,
    table : PropTypes.shape({
        tableName : PropTypes.string,
        table : PropTypes.string,
        fields : PropTypes.oneOfType([
            PropTypes.objectOf(PropTypes.object),
            PropTypes.arrayOf(PropTypes.object),
        ])
    }).isRequired,
}

const styles = StyleSheet.create({
    emptyAccordion : {
        alignSelf : 'center',
        alignItems:'center'
    },
    labelTitle: {
        fontSize : 18,
    },
    emptyText : {
        fontSize : 16,
        fontWeight : 'bold',
        flexWrap : 'wrap',
        marginVertical : 10,
        textAlign : 'center'
    }
})