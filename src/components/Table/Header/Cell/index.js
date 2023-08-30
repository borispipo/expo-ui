import React from "$react";
import {classNames} from "$cutils";
import theme from "$theme";

import { StyleSheet } from "react-native";
const TableHeaderCellComponent = React.forwardRef(({columnDef,className,width,style,children,...props},ref)=>{
    return <th ref={ref} className={classNames(className,"table-header-cell")} children={children} style={StyleSheet.flatten(style)}/>
});
TableHeaderCellComponent.displayName = "TableTableHeaderCellComponent";
export default TableHeaderCellComponent;