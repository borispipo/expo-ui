import { forwardRef,useMemo } from "react";
import View from "$ecomponents/View";
import styles from "../styles";
import { useTable } from "../hooks";
import {useIsRowSelected} from "$ecomponents/Datagrid/hooks";
import { getRowStyle } from "$ecomponents/Datagrid/utils";

const TableRowWrapperComponent = forwardRef(({children,colSpan,...props},ref)=>{
    const {bordered,withDatagridContext} = useTable();
    const selected = withDatagridContext ? useIsRowSelected(props) : false;
    const rowStyle = useMemo(()=>{
        return getRowStyle({...props,bordered});
    },[selected])
    return <View ref={ref} {...props} style={[styles.row,rowStyle,props.style]} children={children}/>
});

TableRowWrapperComponent.displayName = "TableRowWrapperComponent";

export default TableRowWrapperComponent;