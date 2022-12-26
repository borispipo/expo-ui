import {defaultStr,isNonNullString,defaultObj} from "$utils";
import React from "$react";
import CountUp from "$ecomponents/CountUp";
import Avatar from "$ecomponents/Avatar";
import { ActivityIndicator } from "react-native-paper";
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

export default function DatabaseStatisticContainer ({dashboardProps,fetchDataProps,table,fetchCount,index,testID,title,icon,onPress,columns,fetchData,withDashboard,...props}){
    dashboardProps = defaultObj(dashboardProps);
    const [count,setCount] = React.useState(0);
    const datagridRef = React.useRef(null);
    let {} = props;
    title = defaultStr(title)
    table = defaultObj(table);
    const dbStatistics = defaultObj(table.databaseStatistics,table.databaseStatisticsProps);
    const databaseStatisticsFields = defaultObj(table.databaseStatisticsFields);
    const hasDFields = Object.size(databaseStatisticsFields,true);
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
    if((!fetchCount && !withDashboard) || !tableName) return null;
    const refreshingRef = React.useRef(null);
    const isMounted = React.useIsMounted();
    
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
    const isDatagridLoading = datagridRef.current && datagridRef.current.isLoading && datagridRef.current.isLoading();
    const itemProps = {
        testID : defaultStr(testID,"RN_DatabaseStatistic_"+table),
        onPress : (args)=>{
            if(onPress && onPress(args) === false) return;
            navigateToTableDataList(tableName,{
                tableName
            })
        },
        title : <Label splitText numberOfLines={1} color={theme.colors.primaryOnSurface} style={[{fontSize:15}]}>{title}</Label>,
        titleProps : {primary : true},
            description : isLoading || isDatagridLoading?<View style={[theme.styles.justifyContentFlexStart,theme.styles.alignItemsFlexStart]}>
            <ActivityIndicator color={theme.colors.primary}/>
        </View>:<CountUp 
            from={0} 
            to={count}
            style = {{fontSize:20,color:theme.colors.secondaryOnSurface}}
        />
    }
    return withDashboard ? <Dashboard
        {...props}
        {...dbStatistics}
        columns = {columns}
        ref = {datagridRef}
        progressBar = {<View/>}
        tableName = {tableName}
        table = {table}
        fetchData = {(options)=>{
            return fetchData({...defaultObj(fetchDataProps),table,tableName,fetch,Auth,...options});
        }}
        title = {({context})=>{
            return <Item
                {...itemProps}
                left = {(aProps)=>{
                    return <Menu
                        testID={testID+"_Menu"}
                        items = {context.renderMenu()}
                        anchor = {(p)=><Avatar suffix={index} {...aProps} {...p} icon= {icon} size={40} label={title}/>}
                    />
                }}
            />;
        }}
    /> : <Item
        {...itemProps}
        left = {(aProps)=>{
            return <Menu
                testID={testID+"_Menu"}
                items = {[
                    {
                        icon : "refresh",
                        onPress : refresh,
                        text : "Actualiser"
                    }
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