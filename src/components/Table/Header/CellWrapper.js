import React from "$react";
import {useTable,useGetColumnProps} from "../hooks";
import {defaultObj,defaultVal} from "$cutils";
import styles from "../styles";
import HeaderCell from "./Cell";
import Label from "$ecomponents/Label";
import theme from "$theme";

export default function HeaderCellWrapper({columnField,isFilter,isFooter}){
    const {render,sortedColumn,filtersValues,...props} = useGetColumnProps({columnField,isFilter,isFooter});
    const columnDef = props.columnDef;
    const rProps = isFilter ? sortedColumn : undefined;
    const isHeader = !isFilter && !isFooter;
    const width = props.width;
    const {containerProps,...rest} = props;
    return React.useMemo(()=>{
        let content = typeof render ==='function' ? render(props) : isHeader ? defaultVal(columnDef?.text,columnDef?.label,columnField):null;
        const wStyle = width && {width} || null;
        if(isHeader){
            content = <Label splitText numberOfLines={1} style={[theme.styles.w100,theme.styles.h100,styles.headerCellLabel,wStyle]} textBold primary>{content}</Label>
        } else if(isFooter){
            content = <Label primary textBold children={content}/>
        }
        return <HeaderCell {...containerProps} width={width} columnDef={columnDef} columnField={columnField} style={[styles.headerItem,styles.headerItemOrCell,styles.filterCell,containerProps.style,styles.cell,columnDef.style]} children={content}/>
    },[columnField,width,rProps]);
}