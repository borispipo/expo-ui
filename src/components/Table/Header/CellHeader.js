import React from "$react";
import Cell from "./Cell";
import useTable from "../useTable";
import Label from "$ecomponents/Label";
import {defaultVal} from "$cutils";
import theme from "$theme";
import styles from "../styles";

export default function TableCellMainHeaderComponent({columnField,columnDef,style,colArgs,...props}){
    const {sortedColumn,renderHeaderCell,colsWidths} = useTable();
    const width = colsWidths[columnField];
    const isSelectableColumnName = columnDef.isSelectableColumnName;
    const children = React.useMemo(()=>{
        const content = typeof renderHeaderCell =='function'? renderHeaderCell(colArgs) : defaultVal(columnDef.text,columnDef.label,columnField);
        if(!React.isValidElement(content,true)){
            console.error(content," is not valid element of header ",columnDef," it could not be render on table");
            return null;
        }
        return <Label splitText numberOfLines={1} style={[theme.styles.w100,theme.styles.h100,{maxHeight:70},width&&{width}]} textBold primary>{content}</Label>
    },[sortedColumn,columnField])
    return <Cell {...props} style={[styles.headerItem,style]} children={children}/>
}