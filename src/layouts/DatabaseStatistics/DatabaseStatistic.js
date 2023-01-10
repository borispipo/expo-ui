import {defaultStr,defaultVal,isNonNullString,defaultNumber,defaultObj} from "$utils";
import React from "$react";
import CountUp from "$ecomponents/CountUp";
import Avatar from "$ecomponents/Avatar";
import { Pressable } from "react-native";
import {ActivityIndicator} from "react-native-paper";
import Item from "$ecomponents/Expandable/Item";
import {navigateToTableDataList} from "$enavigation/utils";
import theme from "$theme";
import Label from "$ecomponents/Label";
import PropTypes from "prop-types";
import APP from "$capp/instance"
import cActions from "$cactions";
import {View} from "react-native";
import {Menu} from "$ecomponents/BottomSheet";
import Dashboard from "$ecomponents/Datagrid/Dashboard";
import fetch from "$capi/fetch";
import Auth from "$auth";
import Icon from "$ecomponents/Icon";

export default function DatabaseStatisticContainer ({dashboardProps,onRefreshAll,fetchDataProps,table,fetchCount,index,testID,title,icon,onPress:customOnPress,columns,fetchData,withDashboard,...props}){
    dashboardProps = defaultObj(dashboardProps);
    const [count,setCount] = React.useState(0);
    const datagridRef = React.useRef(null);
    let {} = props;
    table = defaultObj(table);
    const dbStatistics = defaultObj(table.databaseStatistics,table.databaseStatisticsProps);
    const databaseStatisticsFields = defaultObj(table.databaseStatisticsFields);
    const hasDFields = table.databaseStatistics !== false && Object.size(databaseStatisticsFields,true);
    if(!withDashboard && hasDFields){
        withDashboard = true;
    }
    const dFields = hasDFields ? databaseStatisticsFields : defaultObj(dbStatistics.fields,dbStatistics.columns);
    if(typeof fetchData !=='function'){
        fetchData = typeof dbStatistics.fetchData =='function'? dbStatistics.fetchData : undefined;
    }
    withDashboard = withDashboard && typeof fetchData == 'function'? true : false;
    columns = Object.size(columns,true)? columns : Object.size(dFields,true)? dFields : table.fields;
    const tableName = defaultStr(table.tableName,table.table).toUpperCase();
    fetchCount = typeof table.fetchCount =='function'? table.fetchCount : typeof fetchCount =='function'? fetchCount : undefined;
    if((!fetchCount && !withDashboard) || !tableName) {
        return null
    }
    const refreshingRef = React.useRef(null);
    const isMounted = React.useIsMounted();
    const onRefreshAllItem = typeof onRefreshAll =='function'? {
        text : "Tout actualiser",
        onPress : onRefreshAll,
        icon : "refresh-circle"
    } : {}
    
    const [isLoading,setIsLoading] = React.useState(withDashboard?false:true);
    const refresh = ()=>{
        if(refreshingRef.current || !isMounted()) return;
        if(!fetchCount){
            return;
        }
        refreshingRef.current = true;
        setIsLoading(true);
        setTimeout(()=>{
            fetchCount({table,tableName}).then((count)=>{
                    setCount(count);
                    setIsLoading(false);
                    refreshingRef.current = false;
                }).catch((e)=>{
                    setIsLoading(false);
                    refreshingRef.current = false;
                });
            },100);
    }

    React.useEffect(()=>{
        if(!withDashboard){
            APP.on(cActions.upsert(tableName),refresh);
            APP.on(cActions.remove(tableName),refresh);
            refresh();
        }
        return ()=>{
            if(!withDashboard){
                APP.off(cActions.upsert(tableName),refresh);
                APP.off(cActions.remove(tableName),refresh);
            }
        }
    },[]);
    const progressBar = <View style={[theme.styles.justifyContentFlexStart,theme.styles.p1,theme.styles.alignItemsFlexStart]}>
        <ActivityIndicator color={theme.colors.primary}/>
    </View>;
    const isDatagridLoading = datagridRef.current && datagridRef.current.isLoading && datagridRef.current.isLoading();
    testID = defaultStr(testID,"RN_DatabaseStatistic_"+table);
    const onPress = (args)=>{
        if(customOnPress && customOnPress(args) === false) return;
        navigateToTableDataList(tableName,{
            tableName
        })
    };
    const fetchFields = React.useCallback(()=>{
        const fetchFields = [];
        Object.map(columns,(field,f)=>{
            const ff = defaultStr(isObj(field) && field.filter !== false? field.field: undefined,f);
            if(ff){
                fetchFields.push(ff);
            }
        });
        return fetchFields;
    },[columns])();
    const counUpStyle = {fontSize:20,fontWeight:'bold',color:theme.colors.secondaryOnSurface};
    title =  React.isValidElement(title,true)?<Label splitText numberOfLines={1} color={theme.colors.primaryOnSurface} style={[{fontSize:15}]}>{title}</Label>: null;
    const titleText = title && React.getTextContent(title) || null;
    const titleItem = titleText && {text:titleText,icon,divider:true} || null;
    return withDashboard ? <Dashboard
        chartProps = {{
            stroke: {
                curve: 'straight'
            },
            fill: {
                type: 'solid',
                opacity: 1,
            },
        }}
        sessionName = {tableName+"-database-statistics"}
        {...props}
        {...dbStatistics}
        style = {[theme.styles.pr1,props.style]}
        columns = {columns}
        ref = {datagridRef}
        progressBar = {isLoading?<View/>:<View style={[theme.styles.w100,theme.styles.alignItemsCenter,theme.styles.justifyContentCenter]}>{progressBar}</View>}
        tableName = {tableName}
        table = {table}
        fetchData = {(options)=>{
            return fetchData({...defaultObj(fetchDataProps),fields:fetchFields,table,tableName,fetch,Auth,...options});
        }}
        title = {({context})=>{
            if(!context || !context.state) return null;
            const {state} = context;
            const footers = context.getFooters && context.getFooters() || {};
            const dataSize = context.getStateDataSize && context.getStateDataSize() || 0;
            const footersValues = context.getFooterValues && context.getFooterValues() || {};
            const y = defaultStr(state.chartConfig?.y);
            const footerValue = y && isObj(footersValues) && footersValues[y] || null;
            const format = defaultStr(isObj(footerValue) && isNonNullString(footerValue.format) && footerValue.format || undefined).toLowerCase();
            const aggregatorFunction = isNonNullString(state.aggregatorFunction)? state.aggregatorFunction : undefined;
            let value = isObj(footerValue) && aggregatorFunction && aggregatorFunction in footerValue ? footerValue[aggregatorFunction] : undefined;
            if(typeof value !=='number'){
                value = isObj(footerValue) && typeof footerValue.sum =='number'? footerValue.sum : 0;
            }
            const formattedValue = typeof context.formatValue =="function"? context.formatValue(value,format) : (format =='money'?value.formatMoney():value.formatNumber());
            return <Pressable onPress={onPress} testID={testID+"_TitleContainer"} style={[theme.styles.w100]}>
                <View testID={testID+"_TitleCountUp"} style={[theme.styles.w100]}>
                    <View style={[theme.styles.w100,theme.styles.row,theme.styles.alignItemsCenter]}>
                        <Icon style={[theme.styles.noPadding,theme.styles.noMargin]} suffix={index} icon= {icon} size={20} label={title}/>
                        {title}
                        {typeof dataSize =='number' && dataSize && <Label>
                            {dataSize.formatNumber()}
                        </Label> || null}
                    </View>
                    <Menu
                        testID={testID+"_Menu"}
                        items = {[titleItem,...context.renderMenu(),onRefreshAllItem]}
                        anchor = {(p)=><Pressable {...p} style={[theme.styles.pl1]} testID={testID+"_MenuAnchor"}>
                            <Label
                                textCenter
                                style = {counUpStyle}
                            >{formattedValue}</Label>
                        </Pressable>}
                    />
                </View>
            </Pressable>
        }}
    /> : <Item
        onPress = {onPress}
        title = {title}
        //style = {[theme.styles.pv1]}
        description = {isLoading ?progressBar:<CountUp 
            from={0} 
            to={count}
            style = {counUpStyle}
        />}
        titleProps ={{primary : true}}
        left = {(aProps)=>{
            return <Menu
                testID={testID+"_Menu"}
                items = {[
                    titleItem,
                    {
                        icon : "refresh",
                        onPress : refresh,
                        text : "Actualiser"
                    },
                    onRefreshAllItem,
                ]}
                anchor = {(p)=><Avatar suffix={index} {...aProps} {...p} icon= {icon} size={40} label={title}/>}
            />
        }}
    />;
}

/*** DBSTAT, prend en paramètre le nom de la bd ainsi que celui de la table et affiche en statistic,: 
 *  Le nombre d'éléments crées en bases ainsi que ceux actifs
 */
 DatabaseStatisticContainer.propTypes = {
    ...Item.propTypes,
    /*** les props supplémentaires à passer à la fonction fetchData */
    fetchDataProps : PropTypes.oneOfType([
        PropTypes.object,
    ]),
    /*** La méthode fetchCount doit retourner une promèsse qui lorsqu'elle est résolue, résoue le nombre d'éléments de la table de données en bd */
    fetchCount : PropTypes.func,//la fonction permettant de counter les éléments de la table data
    table : PropTypes.shape({
        table : PropTypes.string,
        tableName : PropTypes.string,
        fetchCount : PropTypes.func,//la fonction permettant de counter les éléments de la table data
    }).isRequired,
    title : PropTypes.string, //le titre à afficher
}