import React from "$react";
import CellContent from "./Content";
import { useTable } from "../../hooks";
import {defaultObj} from "$cutils";
import Label from "$ecomponents/Label";
const TableRowCellComponent = React.forwardRef(({children,rowData,colSpan,isSectionListHeader,rowIndex,style,...rest},ref)=>{
    if(isSectionListHeader){
        return <CellContent colSpan={colSpan} ref={ref} style={[style]} >
            {children}
        </CellContent>
    }
    const {renderCell} = useTable();
    const {content,containerProps} = React.useMemo(()=>{
        const rArgs = {...rest,rowData,rowIndex,containerProps : {}};
        const r = typeof renderCell =='function' && renderCell (rArgs) ||  children;
        return {
            content : typeof r =='string' || typeof r =='number' && r ? <Label children={r}/> : React.isValidElement(r)? r : children,
            containerProps : defaultObj(rArgs.containerProps)
        }
    },[children]);
    return (<CellContent ref={ref}  {...containerProps} style={[style,containerProps.style]} >
        {content}
    </CellContent>);
});


TableRowCellComponent.displayName = "TableRowCellComponent";

export default TableRowCellComponent;