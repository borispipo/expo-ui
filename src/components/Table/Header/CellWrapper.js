import React from "$react";
import {useTable,useGetColumnProps} from "../hooks";
import {defaultObj,defaultVal} from "$cutils";
import styles from "../styles";
import RowCell from "./Cell";
import Label from "$ecomponents/Label";
import theme from "$theme";

export default function HeaderCellWrapper({columnField,isFilter,isFooter}){
    const {render,sortedColumn,filtersValues,data,...props} = useGetColumnProps({columnField,isFilter,isFooter});
    const columnDef = props.columnDef;
    const isHeader = !isFilter && !isFooter;
    const rProps = isHeader ? sortedColumn : isFooter ? data : undefined;
    const width = props.width;
    const {containerProps} = props;
    return React.useMemo(()=>{
        let content = typeof render ==='function' ? render(props) : isHeader ? defaultVal(columnDef?.text,columnDef?.label,columnField):null;
        const wStyle = width && {width} || null;
        if(isHeader){
            content = <Label splitText numberOfLines={1} style={[theme.styles.w100,theme.styles.h100,styles.headerCellLabel,wStyle]} textBold primary>{content}</Label>
        } else if(isFooter){
            content = <Label primary textBold children={content}/>
        }
        return <RowCell {...containerProps} width={width} columnDef={columnDef} columnField={columnField} style={[styles.headerItem,styles.headerItemOrCell,styles.filterCell,containerProps.style,styles.cell,columnDef.style]} children={content}/>
    },[columnField,width,rProps]);
}