import Screen from "$screen";
import Grid,{Cell} from "$components/Grid";
import {defaultStr,defaultNumber,defaultVal} from "$utils";
import React from "$react";
import DatabaseStatistic from "./DatabaseStatistic";
import theme from "$theme";
import PropTypes from "prop-types";

export const title = 'Statistiques en BD';
export default function DatabaseStatisticScreen ({withScreen,title:customTitle,contentProps,containerProps,tables,Component,...props}){
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
        Object.map(tables,(table,index,suffix)=>{
            if(isObj(table) && table.databaseStatistic !== false && table.databaseStatistics !== false){
                content.push(
                    <Cell elevation = {5} withSurface mobileSize={12} desktopSize={3} tabletSize={4} {...contentProps} key = {index} >
                        <DatabaseStatistic
                            icon = {table.icon}
                            key = {index}
                            table = {table}
                            index = {suffix}
                            title = {table.text|| table.title}
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
    tables : PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.objectOf(PropTypes.object)
    ]).isRequired
}