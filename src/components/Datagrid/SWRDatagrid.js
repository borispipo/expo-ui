// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****
 *  @see : https://swr.vercel.app/examples/infinite-loading
 *  @see : 
 */
import Datagrid from "./IndexComponent";
import {defaultStr,defaultObj,defaultVal,isNonNullString,defaultNumber,isObjOrArray,isObj,extendObj} from "$utils";
import {Pressable} from "react-native";
import SimpleSelect from "$ecomponents/SimpleSelect";
import React from "$react";
import Auth from "$cauth";
import DateLib from "$lib/date";
import {getFetchOptions} from "$cutils/filters";
import {setQueryParams} from "$cutils/uri";
import {uniqid} from "$utils";
import { getFetcherOptions } from "$capi/fetch";
import Icon from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import { StyleSheet,View } from "react-native";
import theme from "$theme";
import useSWR,{useInfinite} from "$swr";
import appConfig from "$capp/config";
import APP from "$capp/instance";

import PropTypes from "prop-types";
import {isDesktopMedia} from "$dimensions";
import ActivityIndicator from "$ecomponents/ActivityIndicator";
import {Menu} from "$ecomponents/BottomSheet";
import session from "$session";

export const getSessionKey = ()=>{
    return Auth.getSessionKey("swrDatagrid");
}
export const getSessionData = (key)=>{
    const data = defaultObj(session.get(getSessionKey()));
    return isNonNullString(key) ? data[key.trim()] : data;
}

export const setSessionData = (key,value)=>{
    const d = getSessionData();
    if(isObj(key)){
        return session.set(getSessionKey(),extendObj({},d,key));
    }
    d[key] = value;
    return session.set(getSessionKey(),d);
}



export const timeout = 5000*60;//5 minutes
/***@see : https://swr.vercel.app/docs/api */

export const getSWROptions = ()=>{
    const delay = defaultNumber(appConfig.get("swrRefreshTimeout"),timeout);
    return {
        dedupingInterval : delay,
        errorRetryInterval : delay*2,
        errorRetryCount : 5,
        revalidateOnMount : false,//enable or disable automatic revalidation when component is mounted
        revalidateOnFocus : true, //automatically revalidate when window gets focused (details)
        revalidateOnReconnect : true, //automatically revalidate when the browser regains a network
        refreshInterval : delay, //5 minutes : Disabled by default: refreshInterval = 0, If set to a number, polling interval in milliseconds, If set to a function, the function will receive the latest data and should return the interval in milliseconds
        refreshWhenHidden : false, //polling when the window is invisible (if refreshInterval is enabled)
        refreshWhenOffline : false, //polling when the browser is offline (determined by navigator.onLine)
        shouldRetryOnError : false, //retry when fetcher has an error
        dedupingInterval : delay,//dedupe requests with the same key in this time span in milliseconds
    }
}

const getDefaultPaginationRowsPerPageItems = ()=>{
    return [5,10,15,20,25,30,40,50,60,80,100,500,1000,...(isDesktopMedia() ? [1500,2000,2500,3000,3500,4000,4500,5000,10000]:[])];
}
/****la fonction fetcher doit toujours retourner : 
 *  1. la liste des ??l??ments fetch??s dans la props data
 *  2. le nombre total d'??l??ments de la liste obtenue en escluant les clause limit et offset correspondant ?? la m??me requ??te
 */
const SWRDatagridComponent = React.forwardRef((props,ref)=>{
    let {
        table,
        data:customData,
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
        fetchPathKey,
        fetcher,
        ListFooterComponent,
        testID,
        autoSort,
        fetchOptions:customFetchOptions,
        handleQueryLimit,
        onFetchData,
        beforeFetchData,
        sort,
        defaultSortColumn,
        defaultSortOrder,
        ...rest
    } = props;
    rest = defaultObj(rest);
    rest.exportTableProps = defaultObj(rest.exportTableProps)
    const firstPage = 1;
    const tableName = defaultStr(table.tableName,table.table).trim().toUpperCase();
    defaultSortColumn = defaultStr(defaultSortColumn,table.defaultSortColumn);
    defaultSortOrder = defaultStr(defaultSortOrder,table.defaultSortOrder).toLowerCase().trim();
    sort = isNonNullString(sort)? {column:sort} : isObj(sort)?sort : {};
    const sColumn = defaultStr(sort.column,defaultSortColumn);
    if(sColumn){
        sort.column = sColumn;
        if(defaultSortOrder =='asc' || defaultSortOrder =='desc'){
            sort.dir = defaultSortOrder;
        }
    } else {
        delete sort.column;
    }
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
    const fetchOptionsRef = React.useRef(defaultObj(customFetchOptions));
    const refreshCBRef = React.useRef(null);
    const fPathRef = React.useRef(defaultStr(fetchPathKey,uniqid("fetchPath")));
    fetchPath = defaultStr(fetchPath,table.queryPath,tableName.toLowerCase()).trim();
    if(fetchPath){
        fetchPath = setQueryParams(fetchPath,"SWRFetchPathKey",fPathRef.current)
    }
    const innerRef = React.useRef(null);
    const showProgressRef = React.useRef(true);
    const dataRef = React.useRef([]);
    const hasResultRef = React.useRef(false);
    const totalRef = React.useRef(0);
    const isFetchingRef = React.useRef(false);
    const pageRef = React.useRef(1);
    const canHandleLimit = handleQueryLimit !== false ? true : false;
    const limitRef = React.useRef(!canHandleLimit ?0 : defaultNumber(getSessionData("limit"),500));
    const isInitializedRef = React.useRef(false);
    testID = defaultStr(testID,"RNSWRDatagridComponent");
    const isLoadingRef = React.useRef(true);
    const {error, isValidating,isLoading:customIsLoading,refresh} = useSWR(fetchPath,{
        fetcher : (url,opts)=>{
            if(!isInitializedRef.current) {
                isFetchingRef.current = false;
                isLoadingRef.current = false;
                return;
            }
            opts = extendObj({},opts,fetchOptionsRef.current);
            opts.queryParams = defaultObj(opts.queryParams);
            opts.queryParams.withTotal = true;
            if(canHandleLimit){
                opts.queryParams.limit = limitRef.current;
                opts.queryParams.page = pageRef.current -1;
            } else {
                delete opts.queryParams.limit;
                delete opts.queryParams.page;
                delete opts.queryParams.offset;
            }
            if(isObj(opts.sort)){
                opts.queryParams.sort = opts.sort;
            }
            const fetchCB = ({data,total})=>{
                totalRef.current = total;
                dataRef.current = data;
                const dd = Object.size(data);
                if(dd>total){
                    total = dd;
                }
                hasResultRef.current = true;
                if(onFetchData && typeof onFetchData =='function'){
                    onFetchData({allData:data,total,data,context:innerRef.current})
                }
                return data;
            };
            hasResultRef.current = false;
            isFetchingRef.current = true;
            if(typeof fetcher =='function'){
                url = setQueryParams(url,opts.queryParams);
                return fetcher(url,opts).then(fetchCB).finally(()=>{
                    isFetchingRef.current = false;
                    isLoadingRef.current = false;
                });
            }
            const {url:fUrl,fetcher:cFetcher,...rest} = getFetcherOptions(url,opts);
            if(showProgressRef.current ===false){
                rest.showError = false;
            }
            return cFetcher(fUrl,rest).then(fetchCB).finally(()=>{
                isFetchingRef.current = false;
            });
        },
        showError  : false,
        swrOptions : {
            ...getSWROptions(),
            ...defaultObj(appConfig.swr),
        },
    });
    const isLoading = isLoadingRef.current  && customIsLoading || false;
    /*React.useEffect(()=>{
        innerRef.current && innerRef.current.setIsLoading && innerRef.current.setIsLoading(isLoading);
    },[isLoading])*/
    React.useEffect(()=>{
        const cb = refreshCBRef.current;
        refreshCBRef.current = null;
        if(!isValidating && !customIsLoading && typeof cb =='function'){
            cb();
        }
    },[isValidating,customIsLoading])
    const doRefresh = (showProgress)=>{
        showProgressRef.current = showProgress ? typeof showProgress ==='boolean' : false;
        if(isFetchingRef.current) return;
        isLoadingRef.current = true;
        refresh();
    }
    const canPaginate = ()=>{
        if(canHandleLimit && typeof totalRef.current !=='number' || typeof pageRef.current !='number' || typeof limitRef.current !='number') return false;
        if(limitRef.current <= 0) return false;
        return true;
    }
    const getTotalPages = ()=>{
        if(!canPaginate()) return false;
        return Math.ceil(totalRef.current / limitRef.current);;
    };
    const getNextPage = ()=>{
        if(!canPaginate()) return false;
        const totalPages = getTotalPages();
        let nPage = pageRef.current+1;
        if(nPage > totalPages){
            nPage  = totalPages;
        }
        if(nPage === pageRef.current){
            return false;
        }
        return nPage;
    },getPrevPage = ()=>{
        if(!canPaginate()) return false;
        let pPage = pageRef.current - 1;
        if(pPage < firstPage){
            pPage  = firstPage;
        }
        if(pPage === pageRef.current){
            return false;
        }
        return pPage;
    }, canSortRemotely = ()=>{
        if(!canPaginate() || autoSort === true) return false;
        ///si le nombre total d'??lements est inf??rieur au nombre limite alors le trie peut ??tre fait localement
        return totalRef.current > limitRef.current && true || false;
    }
    const loading = (isLoadingRef.current && (isLoading|| isValidating));
    const pointerEvents = loading ?"node" : "auto";
    const itLimits = [{
        text : "Limite nbre elts par page",
        divider : true,
    }]
    getDefaultPaginationRowsPerPageItems().map((item)=>{
        itLimits.push({
            text : item.formatNumber(),
            icon : limitRef.current == item ? 'check' : null,
            primary : limitRef.current === item ? true : false,
            onPress : ()=>{
                if(item == limitRef.current) return;
                limitRef.current = item;
                setSessionData("limit",limitRef.current);
                pageRef.current = firstPage;
                setTimeout(() => {
                    doRefresh(true);
                }, (500));
            }
        });
    });
    return (
        <Datagrid 
            testID = {testID}
            {...defaultObj(table.datagrid)} 
            {...rest}
            sort = {sort}
            onSort = {({sort})=>{
                if(!canSortRemotely()) return;
                fetchOptionsRef.current.sort = sort;
                pageRef.current = firstPage;
                doRefresh(true);
                return false;
            }}
            renderCustomPagination = {({context})=>{
                if(!canPaginate()) return null;
                const page = pageRef.current, totalPages = getTotalPages(), prevPage = getPrevPage(),nextPage = getNextPage();
                const iconProp = {
                    size : 25,
                    style : [theme.styles.noMargin,theme.styles.noPadding],
                }
                const sStyle = [styles.limitStyle1,theme.styles.noPadding,theme.styles.noMargin];
                return <View testID={testID+"_PaginationContainer"} pointerEvents={pointerEvents}>
                    <View style={[theme.styles.row,theme.styles.w100]} pointerEvents={pointerEvents} testID={testID+"_PaginationContentContainer"}>
                        <Menu
                            testID={testID+"_SimpleSelect"}
                            style = {sStyle}
                            anchor = {(p)=>{
                                return <Pressable style={[theme.styles.noMargin,theme.styles.noPadding]} {...p} testID={testID+"MenuSelectLimit"}>
                                    <Label primary testID={testID+"_Label"} fontSize={16}>
                                        {limitRef.current.formatNumber()}
                                    </Label>
                                </Pressable>
                            }}
                            title = {'Limite du nombre d\'??l??ments par page'}
                            items = {itLimits}
                        />
                        <Icon
                            ///firstPage
                            {...iconProp}
                            title = {"Aller ?? la premi??re page"}
                            name="material-first-page"
                            disabled = {pageRef.current <= 1 && true || false}
                            onPress = {()=>{
                                if(pageRef.current <= firstPage) return;
                                pageRef.current = firstPage;
                                doRefresh(true);
                            }}
                        />
                        <Icon
                            //decrement
                            {...iconProp}
                            title = {"Aller ?? la page pr??c??dente {0}".sprintf(prevPage && prevPage.formatNumber()||undefined)}
                            name="material-keyboard-arrow-left"
                            disabled = {page === prevPage || getPrevPage() === false ? true : false}
                            onPress = {()=>{
                                const page = getPrevPage();
                                if(page === false) return;
                                if(pageRef.current === page) return;
                                pageRef.current = page;
                                doRefresh(true);
                            }}
                            
                        />
                        <View testID={testID+"_PaginationLabel"}>
                            <Label style={{fontSize:15}}>
                                {(totalRef.current?page:0).formatNumber()}-{totalPages.formatNumber()}{" / "}{totalRef.current.formatNumber()}
                            </Label>
                        </View>
                        <Icon
                            //increment
                            {...iconProp}
                            title = {"Aller ?? la page suivante {0}".sprintf(nextPage && nextPage.formatNumber()||undefined)}
                            name="material-keyboard-arrow-right"
                            disabled = {nextPage >= totalPages || getNextPage() === false ? true : false}
                            onPress = {()=>{
                                const page = getNextPage();
                                if(page === false) return;
                                if(pageRef.current === page) return;
                                pageRef.current = page;
                                doRefresh(true);
                            }}
                        />
                        <Icon
                            //lastPage
                            {...iconProp}
                            name="material-last-page"
                            title = {"Aller ?? la derni??re page {0}".sprintf(totalPages && totalPages.formatNumber()||undefined)}
                            disabled = {page >= totalPages ? true : false}
                            onPress = {()=>{
                                const page = getTotalPages();
                                if(pageRef.current >= page) return;
                                pageRef.current = page;
                                doRefresh(true);
                            }}
                            
                        />
                    </View>
                </View>
            }}
            handleQueryLimit = {false}
            handlePagination = {false}
            autoSort = {canSortRemotely()? false : true}
            isLoading = {loading && !error && showProgressRef.current && true || false}
            beforeFetchData = {(args)=>{
                if(typeof beforeFetchData =="function" && beforeFetchData(args)==false) return;
                let {fetchOptions:opts,force} = args;
                opts.fields = fetchFields;
                opts = getFetchOptions({showError:showProgressRef.current,...opts});
                isInitializedRef.current = true;
                fetchOptionsRef.current = opts;
                if(force){
                    pageRef.current = firstPage;
                }
                doRefresh(force);
                return false;
            }}
            isTableData
            fetchData = {undefined}
            data = {dataRef.current}
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
                        {"Aucune donn??es enr??gistr??e!!"}
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
    /*** le nom de la colonne de trie par d??faut */
    defaultSortColumn : PropTypes.string,
    fetchPath : PropTypes.string,
    fetchPathKey : PropTypes.string,//la cl?? permettant de suffixer l'url fecherPath afin que ce ne soit pas unique pour certaines tables
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
    limitStyle : {
        backgroundColor:'transparent',
        width:50,
        height : 35,
    },
    emptyText : {
        fontSize : 16,
        fontWeight : 'bold',
        flexWrap : 'wrap',
        marginVertical : 10,
        textAlign : 'center'
    }
})