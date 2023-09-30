import Menu from "$ecomponents/Menu";
import Icon from "$ecomponents/Icon";
import { useDatagrid } from "../hooks";
import {Pressable} from "react-native";
import {defaultStr} from "$cutils";
import theme from "$theme";
import Label from "$ecomponents/Label";
import React from "$react";
import { getMenuStyle } from "./styles";
import BottomSheetMenu from "$ecomponents/BottomSheet/Menu";

export default function DatagridFiltersMenuComponent({testID,...props}){
    const {filteredColumns,columns,context,filterableColumnsNames} = useDatagrid();
    const [visibleMenus,setVisibleMenus] = React.useState(filteredColumns);
    const isFiltered = !!Object.size(filteredColumns,true);
    testID = defaultStr(testID,"RN_DatagridFiltersMenuComponent")
    const items = React.useStableMemo(()=>{
        const items = [];
        if(!columns) return items;
        Object.map(filterableColumnsNames,(field,i)=>{
            const column = columns[field];
            if(!isObj(column)) return;
            const filterKey = defaultStr(column.field,column.name,i);
            items.push({
                ...column,
                icon  : !!visibleMenus[filterKey] ? "check":undefined,
                items : undefined,
                onPress : (e)=>{
                    const visible = !!visibleMenus[filterKey];
                    const nVisible  = context?.toggleFilterColumnVisibility? context.toggleFilterColumnVisibility(filterKey,!!!visible) : visible;
                    if(nVisible !== visible){
                        setVisibleMenus({...visibleMenus,[filterKey]:nVisible});
                    }
                }
            })
        });
        return items;
    },[filterableColumnsNames,visibleMenus]);
    return <BottomSheetMenu
        testID={testID}
        title = {"Filtres"}
        {...props}
        items = {items}
        anchor={(p)=>{
            return <Pressable {...p} testID={testID+"_FilterPressableContainer"} style={[theme.styles.row,theme.styles.justifyContentStart,theme.styles.alignItemsCenter,getMenuStyle()]}>
                <Icon
                    name={isFiltered?"filter-menu":"filter-plus"}
                    primary = {isFiltered}
                    size={20}
                    style={[theme.styles.noPadding,theme.styles.noMargin]}
                />
                <Label primary={isFiltered} textBold={isFiltered}>Filtres</Label>
            </Pressable>
        }}
    />
}