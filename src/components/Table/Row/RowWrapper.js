import { forwardRef } from "react";

const TableRowWrapperComponent = forwardRef(({children,...rest},ref)=>{
    return children;
});

TableRowWrapperComponent.displayName = "TableRowWrapperComponent";

export default TableRowWrapperComponent;