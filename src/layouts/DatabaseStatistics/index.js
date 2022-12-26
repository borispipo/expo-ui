import Screen from "$screen";
import Grid,{Cell} from "$components/Grid";
import {defaultStr,defaultNumber,defaultVal} from "$utils";
import React from "$react";
import DatabaseStatistic from "./DatabaseStatistic";
import theme from "$theme";
import PropTypes from "prop-types";

export const title = 'Statistiques en BD';
export default function DatabaseStatisticScreen ({withScreen,fetchDataProps,tableFilter,getTable,fetchCount,fetchData,title:customTitle,contentProps,containerProps,tables,Component,...props}){
        Component = React.isComponent(Component)? Component : Grid;
        containerProps = defaultObj(containerProps);
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
            const t = typeof getTable =='function'?getTable(defaultStr(table?.tableName,table?.table,index)) : null;
            if(isObj(t) && defaultStr(t.table,t.tableName)){
                table = t;
            }
            if(isObj(table) && table.databaseStatistic !== false && table.databaseStatistics !== false && tableFilter(table) !== false){
                content.push(
                    <Cell elevation = {5} withSurface mobileSize={12} desktopSize={3} tabletSize={4} {...contentProps} key = {index} >
                        <DatabaseStatistic
                            icon = {table.icon}
                            key = {index}
                            table = {table}
                            fetchData = {fetchData}
                            fetchDataProps = {fetchDataProps}
                            index = {suffix}
                            title = {defaultStr(table.text,table.label,table.title)}
                            fetchCount = {table.fetchCount|| typeof fetchCount =='function'? (a,b)=>{
                                return fetchCount({table,tableName:defaultStr(table.tableName,table.table)})
                            }:undefined}
                        ></DatabaseStatistic>
                    </Cell>
                )
            }
        });
        if(!content.length) {
            Auth.showError();
            return null;
        }
        content = <Component  {...containerProps} style={[containerProps.style,theme.styles.mr1,theme.styles.ml1]}>
            {content}
        </Component>;
        return  withScreen !== false ? <Screen withScrollView title={defaultVal(customTitle,title)} {...props}>{content}</Screen> : content;
}   

export const screenName = DatabaseStatisticScreen.screenName = "DatabaseStatistics";
DatabaseStatisticScreen.title = title;

DatabaseStatisticScreen.propTypes = {
    /*** les props supplémentaires à passer à la fonction fetchData */
    fetchDataProps : PropTypes.oneOfType([
        PropTypes.object,
    ]),
    getTable : PropTypes.func,//la fonction permettant de récupérer la table à partir du nom
    tables : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object)
    ]).isRequired,
    /*** la fonction de filtre utilisée pour filtrer les table devant figurer sur le databaseStatistics */
    tableFilter : PropTypes.func,
}