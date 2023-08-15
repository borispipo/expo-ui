import { forwardRef } from "react";

const TableRowWrapperComponent = forwardRef(({children},ref)=>children);

TableRowWrapperComponent.displayName = "TableRowWrapperComponent";

export default TableRowWrapperComponent;