// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/****
 *  @see : https://swr.vercel.app/examples/infinite-loading
 *  @see : 
 */
import Datagrid from "./IndexComponent";
import {defaultStr,defaultObj,defaultVal,isNonNullString,defaultNumber,isObjOrArray,isObj,extendObj} from "$cutils";
import {Pressable} from "react-native";
import React from "$react";
import Auth from "$cauth";
import DateLib from "$lib/date";
import {getFetchOptions} from "$cutils/filters";
import {setQueryParams} from "$cutils/uri";
import {uniqid} from "$cutils";
import apiFetch from "$capi/fetch";
import Icon from "$ecomponents/Icon";
import Label from "$ecomponents/Label";
import { StyleSheet} from "react-native";
import View from "$ecomponents/View";
import theme from "$theme";
import {getRowsPerPagesLimits} from "./Common/utils";
import PropTypes from "prop-types";
import {Menu} from "$ecomponents/BottomSheet";
import session from "$session";
import {useScreen,useSWR} from "$econtext/hooks";
import {HStack} from "$ecomponents/Stack";

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


const isValidMakePhoneCallProps = p=> isObj(p) && Object.size(p,true) || typeof p ==='function';
/****la fonction fetcher doit toujours retourner : 
 *  1. la liste des éléments fetchés dans la props data
 *  2. le nombre total d'éléments de la liste obtenue en escluant les clause limit et offset correspondant à la même requête
 */
const SWRDatagridComponent = React.forwardRef((props,ref)=>{
    let {
        table,
        data:customData,
        saveButton,
        title:customTitle,
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
        handlePagination,
        onFetchData,
        beforeFetchData,
        sort,
        defaultSortColumn,
        defaultSortOrder,
        isLoading : customIsLoading,
        icon : cIcon,
        swrOptions,
        pagination,
        renderCustomPagination,
        ...rest
    } = props;
    const screenContext = useScreen();
    rest = defaultObj(rest);
    pagination = defaultObj(pagination);
    rest.exportTableProps = defaultObj(rest.exportTableProps)
    const firstPage = 1;
    const tableName = defaultStr(table?.tableName,table?.table,rest?.tableName,rest?.table).trim().toUpperCase();
    defaultSortColumn = defaultStr(defaultSortColumn,table?.defaultSortColumn);
    defaultSortOrder = defaultStr(defaultSortOrder,table?.defaultSortOrder).toLowerCase().trim();
    sort = isNonNullString(sort)? {column:sort} : isObj(sort)?sort : {};
    const sColumn = defaultStr(sort.column,defaultSortColumn);
    if(sColumn){
        sort.column = sColumn;
        sort.dir = defaultStr(sort.dir).toLowerCase().trim();
        if(!['asc','desc'].includes(sort.dir) && ['asc','desc'].includes(defaultSortOrder)){
            sort.dir = defaultSortOrder;
        }
    } else {
        delete sort.column;
    }
    canMakePhoneCall = defaultBool(canMakePhoneCall,table?.canMakePhoneCall);
    makePhoneCallProps = isValidMakePhoneCallProps(makePhoneCallProps) && makePhoneCallProps || isValidMakePhoneCallProps(rest.makePhoneCallProps) && rest.makePhoneCallProps ||  isValidMakePhoneCallProps(table?.makePhoneCallProps) && table?.makePhoneCallProps || {};
    rowKey = defaultStr(rowKey,table?.rowKey,table?.primaryKeyColumnName);
    const title = React.isValidElement(customTitle,true) && customTitle || defaultStr(table?.label,table?.text)
    columns = (isObj(columns) || Array.isArray(columns)) && Object.size(columns,true) && columns || table?.fields;
    const fetchFields = [];
    Object.map(columns,(column,i)=>{
        if(isObj(column)){
            fetchFields.push(defaultStr(column.field,i));
        }
    });
    actions = defaultVal(table?.actions,actions);
    if(isObj(table) && isObj(table?.datagrid)){
        for(let i in Datagrid.propTypes){
            if(i in table){
                rest[i] = isObj(rest[i])? extendObj({},rest[i],table[i]) : table[i];
            }
        }
    }
    rest.actions = actions;
    rest.columns = columns || [];
    const icon = defaultStr(cIcon,table?.icon);
    rest.tableName = tableName;
    rest.canMakePhoneCall = canMakePhoneCall;
    rest.makePhoneCallProps = makePhoneCallProps;
    rest.exportTableProps.fileName = defaultStr(rest.exportTableProps.fileName,title+"-"+DateLib.format(DateLib.toObj(),'dd-mm-yyyy HH-MM'))
    rest.exportTableProps.pdf = defaultObj(rest.exportTableProps.pdf);
    rest.exportTableProps.pdf = extendObj(true,{},{
        fileName : rest.exportTableProps.fileName,
        title : React.getTextContent(title),
    },rest.exportTableProps.pdf);
    const fetchOptionsRef = React.useRef({});
    const isFetchPathNull = fetchPath === null || fetchPath ===false;
    const fPathRef = React.useRef(defaultStr(fetchPathKey,"defaultFetchPathKey"));
    fetchPath = defaultStr(fetchPath,table?.queryPath,tableName.toLowerCase()).trim();
    if(fetchPath){
        fetchPath = setQueryParams(fetchPath,"SWRFetchPathKey",fPathRef.current)
    }
    const sortRef = React.useRef({});
    const innerRef = React.useRef(null);
    const showProgressRef = React.useRef(true);
    const forceRefreshRef = React.useRef(true);
    const pageRef = React.useRef(defaultNumber(pagination.start,1));
    const canHandlePagination = handlePagination !== false ? true : false;
    const canHandleLimit = handleQueryLimit !== false && canHandlePagination ? true : false;
    const limitRef = React.useRef(!canHandleLimit ?0 : defaultNumber(getSessionData("limit"),pagination.limit,500));
    const isInitializedRef = React.useRef(false);
    const hasFetchedRef = React.useRef(false);
    swrOptions = defaultObj(swrOptions);
    swrOptions.revalidateOnMount = typeof swrOptions.revalidateOnMount =="boolean"? swrOptions.revalidateOnMount : false;
    testID = defaultStr(testID,"RNSWRDatagridComponent");
    const {error, isValidating,isLoading,data:result,refresh} = useSWR(isFetchPathNull?null:fetchPath,{
        fetcher : (url,opts)=>{
            if(!isInitializedRef.current) {
                return Promise.resolve({data:[],total:0});
            }
            opts = defaultObj(opts);
            opts.fetchOptions = isObj(opts.fetchOptions)? Object.clone(opts.fetchOptions) : {};
            extendObj(true,opts.fetchOptions,fetchOptionsRef.current);
            if(props.parseMangoQueries === false){
                opts.fetchOptions.selector = extendObj(true,{},opts.fetchOptions.selector,fetchOptionsRef.current?.selector);
            }
            opts.fetchOptions.sort = sortRef.current;
            if(canHandleLimit && limitRef.current > 0){
                opts.fetchOptions.limit = limitRef.current;
                opts.fetchOptions.page = pageRef.current -1;
            } else {
                delete opts.limit;
                delete opts.fetchOptions.limit;
                delete opts.fetchOptions.page;
                delete opts.page;
                delete opts.offset;
            }
            opts.url = opts.path = url;
            if(showProgressRef.current ===false || typeof forceRefreshRef.current !=='boolean'){
                opts.showError = false;
            }
            const end = (a)=> {
                hasFetchedRef.current = true;
                return a;
            };
            if(typeof fetcher =='function'){
                return Promise.resolve(fetcher(url,opts)).then(end);
            }
            return apiFetch(url,opts).then(end);
        },
        swrOptions,
    });
    const dataRef = React.useRef(null);
    const totalRef = React.useRef(0);
    const prevIsLoading = React.usePrevious(isLoading);
    const loading = (customIsLoading === true || isLoading || (isValidating && showProgressRef.current));
    const {data,total} = React.useMemo(()=>{
        if((loading && customIsLoading !== false) || !isObjOrArray(result)){
            return {data:dataRef.current,total:totalRef.current};
        }
        let {data,total} = (Array.isArray(result) ? {data:result,total:result.length} : isObj(result)? result : {data:[],total:0});
        const dd = Object.size(data);
        if(typeof total !=='number'){
            total = dd;
        } else if(dd>total){
            total = dd;
        }
        if(onFetchData && typeof onFetchData =='function'){
            onFetchData({allData:data,total,data,context:innerRef.current})
        }
        dataRef.current = data;
        totalRef.current = total;
        return {data,total};
    },[result,loading])
    React.useEffect(()=>{
        setTimeout(x=>{
            if(error && innerRef.current && innerRef.current.isLoading && innerRef.current.isLoading()){
                innerRef.current.setIsLoading(false,false);
            }
        },500);
    },[error]);
    const doRefresh = (showProgress)=>{
        showProgressRef.current = showProgress || typeof showProgress ==='boolean' ? showProgress : false;
        const fPath = isNonNullString(fetchPath)? fetchPath : fPathRef.current;
        const rKey = `${setQueryParams(fPath,"swrRefreshKeyId",uniqid("swr-refresh-key"))}`;
        forceRefreshRef.current = true;
        refresh(rKey);
    }
    const canPaginate = ()=>{
        if(!canHandlePagination) return false;
        if(canHandleLimit && typeof total !=='number' || typeof pageRef.current !='number' || typeof limitRef.current !='number') return false;
        if(limitRef.current <= 0) return false;
        return true;
    }
    const getTotalPages = ()=>{
        if(!canPaginate()) return false;
        return Math.ceil(total / limitRef.current);;
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
        ///si le nombre total d'élements est inférieur au nombre limite alors le trie peut être fait localement
        return total > limitRef.current && true || false;
    }
    const pointerEvents = loading ?"node" : "auto";
    const itLimits = [{
        text : "Limite nbre elts par page",
        divider : true,
    }]
    getRowsPerPagesLimits().map((item)=>{
        itLimits.push({
            text : item.formatNumber(),
            icon : limitRef.current == item ? 'check' : null,
            primary : limitRef.current === item ? true : false,
            tooltip : item === 0 ? "Sélectionnez cette valeur si vous souhaitez vous en passer de la limite du nombre d'items à afficher" : item.formatNumber(),
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
    React.useEffect(()=>{
        if(hasFetchedRef.current){
            showProgressRef.current = false;
        }
    },[showProgressRef.current]);
    const isAppLoading = loading && showProgressRef.current && forceRefreshRef.current || false;
    forceRefreshRef.current = undefined;
    return (
        <Datagrid 
            testID = {testID}
            accordionProps = {table?.accordionProps}
            {...defaultObj(table?.datagrid)} 
            {...rest}
            renderProgressBar = {screenContext && screenContext?.isFocused() === false?false : rest.renderProgressBar || table?.datagrid?.renderProgressBar}
            fetchOptions = {customFetchOptions}
            title = {customTitle || title || undefined}
            sort = {sort}
            onSort = {({sort})=>{
                sortRef.current = sort;
                if(!canSortRemotely()) return;
                pageRef.current = firstPage;
                doRefresh(true);
                return false;
            }}
            renderCustomPagination = {(...args)=>{
                const cPagination = typeof renderCustomPagination =="function"? renderCustomPagination(...args) : null;
                if(!canPaginate()) {
                    return <HStack testID={testID+"_PaginationLabel"}>
                        {React.isValidElement(cPagination)? cPagination : null}
                        <Label textBold primary style={{fontSize:15}}>
                            {total.formatNumber()}
                        </Label>
                    </HStack>
                }
                const page = pageRef.current, totalPages = getTotalPages(), prevPage = getPrevPage(),nextPage = getNextPage();
                const iconProp = {
                    size : 25,
                    style : [theme.styles.noMargin,theme.styles.noPadding],
                }
                const sStyle = [styles.limitStyle1,theme.styles.noPadding,theme.styles.noMargin];
                return <View testID={testID+"_PaginationContainer"} pointerEvents={pointerEvents}>
                    <View style={[theme.styles.row,theme.styles.w100]} pointerEvents={pointerEvents} testID={testID+"_PaginationContentContainer"}>
                        {React.isValidElement(cPagination)? cPagination : null}
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
                            title = {'Limite du nombre d\'éléments par page'}
                            items = {itLimits}
                        />
                        <Icon
                            ///firstPage
                            {...iconProp}
                            title = {"Aller à la première page"}
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
                            title = {"Aller à la page précédente {0}".sprintf(prevPage && prevPage.formatNumber()||undefined)}
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
                                {(total?page:0).formatNumber()}-{totalPages.formatNumber()}{" / "}{total.formatNumber()}
                            </Label>
                        </View>
                        <Icon
                            //increment
                            {...iconProp}
                            title = {"Aller à la page suivante {0}".sprintf(nextPage && nextPage.formatNumber()||undefined)}
                            name="material-keyboard-arrow-right"
                            disabled = {nextPage > totalPages || getNextPage() === false ? true : false}
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
                            title = {"Aller à la dernière page {0}".sprintf(totalPages && totalPages.formatNumber()||undefined)}
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
            isLoading = {isAppLoading}
            beforeFetchData = {(args)=>{
                let {fetchOptions:opts,force,renderProgressBar} = args;
                opts = getFetchOptions({showError:showProgressRef.current,...opts});
                fetchOptionsRef.current = opts.fetchOptions;
                opts.fetchOptions.withTotal = true;
                sortRef.current = opts.fetchOptions.sort;
                isInitializedRef.current = true;
                if(force){
                    pageRef.current = firstPage;
                }
                if(typeof beforeFetchData =="function" && beforeFetchData(args)==false) return;
                doRefresh(typeof renderProgressBar =='boolean'? renderProgressBar : showProgressRef.current);
                return false;
            }}
            isSWRDatagrid
            isTableData
            fetchData = {undefined}
            data = {data}
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
    swrOptions : PropTypes.object,//les ooptions supplémentaires à passer à la fonction swr
    handlePagination : PropTypes.bool, //spécifie si le datagrid prendra en compte la pagination
    /*** le nom de la colonne de trie par défaut */
    defaultSortColumn : PropTypes.string,
    fetchPath : PropTypes.oneOfType([PropTypes.string,PropTypes.bool,PropTypes.object]),
    fetchPathKey : PropTypes.string,//la clé permettant de suffixer l'url fecherPath afin que ce ne soit pas unique pour certaines tables
    fetchData : PropTypes.func,
    table : PropTypes.shape({
        tableName : PropTypes.string,
        table : PropTypes.string,
        fields : PropTypes.oneOfType([
            PropTypes.objectOf(PropTypes.object),
            PropTypes.arrayOf(PropTypes.object),
        ])
    }),
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