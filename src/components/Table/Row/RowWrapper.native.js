import { forwardRef } from "react";
import View from "$ecomponents/View"

const TableRowWrapperComponent = forwardRef(({children,colSpan,...props},ref)=>{
    return <View ref={ref} {...props} children={children}/>
});

TableRowWrapperComponent.displayName = "TableRowWrapperComponent";

export default TableRowWrapperComponent;