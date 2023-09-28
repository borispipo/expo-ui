import Menu from "$ecomponents/Menu";
import Icon from "$ecomponents/Icon";
import { useDatagrid } from "./hooks";
import {Pressable} from "react-native";
import {defaultStr} from "$cutils";
import theme from "$theme";
import Label from "$ecomponents/Label";
import React from "$react";
import { getMenuStyle } from "./styles";

export default function DatagridFiltersMenuComponent({testID,...props}){
    const {filteredColumns,filterableColumnsNames,...rest} = useDatagrid();
    const isFiltered = !!Object.size(filteredColumns,true);
    testID = defaultStr(testID,"RN_DatagridFiltersMenuComponent")
    console.log(props," is props heeein");
    const items = React.useStableMemo(()=>{
        const items = [];
        console.log(rest," is ressss",filterableColumnsNames);
        Object.map(filterableColumnsNames,(field)=>{
        
        });
        return;
        colMenus.push(<FilterMenu
            key = {key}
            filterKey={key}
            {...filter}
            context={context}
            filteredColumns={filteredColumns}
        />)
    },[filterableColumnsNames]);
    return <Menu
        testID={testID}
        {...props}
        anchor={(p)=>{
            return <Pressable {...p} testID={testID+"_FilterPressableContainer"} style={[theme.styles.row,theme.styles.justifyContentStart,theme.styles.alignItemsCenter,getMenuStyle()]}>
                <Icon
                    name={isFiltered?"filter-menu":"filter-plus"}
                    primary = {isFiltered}
                    size={20}
                />
                <Label primary={isFiltered} textBold={isFiltered}>Filtres</Label>
            </Pressable>
        }}
    />
}