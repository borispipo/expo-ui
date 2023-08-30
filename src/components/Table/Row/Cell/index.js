import React from "$react";
import CellContent from "./Content";
import { useTable } from "../../hooks";
import {defaultObj} from "$cutils";
import Label from "$ecomponents/Label";
import styles from "../../styles";
const TableRowCellComponent = React.forwardRef(({children,columnDef,className,columnField,rowData,colSpan,isSectionListHeader,rowIndex,style,...rest},ref)=>{
    if(isSectionListHeader){
        return <CellContent colSpan={colSpan} className={className} ref={ref} style={[styles.sectionListHeader,styles.cell,style]} >
            {children}
        </CellContent>
    }
    const {renderCell} = useTable();
    const {content,containerProps} = React.useMemo(()=>{
        const rArgs = {...rest,columnDef,columnField,rowData,rowIndex,containerProps : {}};
        const r = typeof renderCell =='function' && renderCell (rArgs) ||  children;
        return {
            content : r && React.isValidElement(r,true)? r : children,
            containerProps : defaultObj(rArgs.containerProps)
        }
    },[children]);
    return (<CellContent ref={ref}  {...containerProps} columnField={columnField} style={[styles.cell,style,containerProps.style]} >
        {<Label testID="RN_TableRowCell">{content}</Label>}
    </CellContent>);
});


TableRowCellComponent.displayName = "TableRowCellComponent";

export default TableRowCellComponent;