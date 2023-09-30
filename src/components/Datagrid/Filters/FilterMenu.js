
import Icon from "$ecomponents/Icon";
import Menu from "$ecomponents/Menu";
import { useDatagrid } from "./hooks";
import React from "$react";
import { getMenuStyle } from "./styles";

export default function DatagridTableFilterMenuComponent({filterKey,filteredColumns,context,...props}){
    const cVisible = !!filteredColumns[filterKey];
    const [visible,setVisible] = React.useState(cVisible);
    React.useEffect(()=>{
        if(false && visible !== cVisible){
            setVisible(cVisible);
        }
    },[cVisible])
    return <Menu.Item
        {...props}
        icon = {visible ? "check" : null}
        onPress={(e)=>{
            const nVisible  = context?.toggleFilterColumnVisibility? context.toggleFilterColumnVisibility(filterKey,!!!filteredColumns[filterKey]) : visible;
            if(nVisible !== visible){
                setVisible(nVisible);
            }
        }}
    />
    return null;
}