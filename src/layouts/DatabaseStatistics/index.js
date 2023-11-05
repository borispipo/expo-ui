import Screen from "$screen";
import Grid,{Cell} from "$ecomponents/Grid";
import {defaultStr,defaultNumber,defaultVal} from "$cutils";
import React from "$react";
import DatabaseStatistic from "./DatabaseStatistic";
import theme from "$theme";
import PropTypes from "prop-types";
import Auth from "$cauth";
import Surface from "$ecomponents/Surface";
import { StyleSheet } from "react-native";

export const title = 'Statistiques en BD';
export default function DatabaseStatisticScreen ({withScreen,fetchDataProps,itemProps,itemContainerProps,tableFilter,fetchCount,fetchData,title:customTitle,contentProps,containerProps,tables,Component,...props}){
        Component = React.isComponent(Component)? Component : Grid;
        containerProps = defaultObj(containerProps);
        itemContainerProps = defaultObj(itemContainerProps);
        itemProps = defaultObj(itemProps);
        const title = containerProps.title = defaultStr(containerProps.title,DatabaseStatisticScreen.title);
        contentProps = defaultObj(contentProps);
        if(Component == Cell){
            containerProps.desktopSize = defaultNumber(containerProps.desktopSize,12);
            containerProps.tabletSize = defaultNumber(containerProps.tabletSize,8);
            containerProps.phoneSize = defaultNumber(containerProps.phoneSize,4);
        }
        let content = [];
        tableFilter = typeof tableFilter ==="function"? tableFilter : x=>true;
        Object.map(tables,(table,index,suffix)=>{
            if(!isObj(table)) return null;
            let tableName = defaultStr(table.tableName,table.table);
            if(!tableName || tableFilter({table,tableName}) === false) return null;
            const t = typeof getTable =='function'?getTable(defaultStr(table?.tableName,table?.table,index),table) :null;
            if(isObj(t) && defaultStr(t.table,t.tableName)){
               table = t;
            }
            if(table.databaseStatistic === false || table.databaseStatistics === false) return null;
            const chartAllowedPerm =  defaultStr(table.chartAllowedPerm);
            const testID = "RN_DatabaseStatisticsCell_"+index;
            if(chartAllowedPerm){
                if(!Auth.isAllowedFromStr(chartAllowedPerm)) return null;
            } else if((!Auth.isTableDataAllowed({table:tableName}))) return null;
            content.push(<Cell elevation = {5} withSurface mobileSize={12} desktopSize={3} tabletSize={6} {...contentProps} testID={testID} key = {index} >
                <Surface testID = {testID+"_Surface"} elevation = {5} {...itemContainerProps} style={[theme.styles.w100,styles.itemContainer,itemContainerProps.style]}>
                    <DatabaseStatistic
                        icon = {table.icon}
                        key = {index}
                        table = {table}
                        fetchData = {fetchData}
                        fetchDataProps = {fetchDataProps}
                        index = {suffix}
                        title = {defaultStr(table.text,table.label,table.title)}
                        fetchCount = {table.fetchCount|| typeof fetchCount =='function'? (a,b)=>{
                            return fetchCount({table,tableName})
                        }:undefined}
                        {...itemProps}
                    />
                </Surface>
            </Cell>
            )
        });
        if(!content.length) {
            return null;
        }
        content = <Component  {...containerProps} style={[containerProps.style,theme.styles.mr1,theme.styles.pv1,theme.styles.ml1]}>
            {content}
        </Component>;
        return  withScreen !== false ? <Screen containerProps={{style:[{flexGrow:0,flex:0}]}} withScrollView title={defaultVal(customTitle,title)} {...props}>{content}</Screen> : content;
}   

export const screenName = DatabaseStatisticScreen.screenName = "DatabaseStatistics";
DatabaseStatisticScreen.title = title;

DatabaseStatisticScreen.propTypes = {
    /*** les props supplémentaires à passer à la fonction fetchData */
    fetchDataProps : PropTypes.oneOfType([
        PropTypes.object,
    ]),
    itemContainerProps : PropTypes.object, //les props à appliquer au container surface de chaque database statistics item
    itemProps : PropTypes.object,//les props à appliquer à chaque database statistic item
    getTable : PropTypes.func,//la fonction permettant de récupérer la table à partir du nom
    tables : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object)
    ]).isRequired,
    /*** la fonction de filtre utilisée pour filtrer les table devant figurer sur le databaseStatistics */
    tableFilter : PropTypes.func,
}

const styles = StyleSheet.create({
    itemContainer : {
        minHeight : 80,
    },
})