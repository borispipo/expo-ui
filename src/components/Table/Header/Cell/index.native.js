import View from "$ecomponents/View";
import React from "$react";
const TableHeaderCellComponent = React.forwardRef(({width,style,...props},ref)=>{
    return <View ref={ref} {...props} style={[style,width && {width}]}/>
});
TableHeaderCellComponent.displayName = "TableTableHeaderCellComponent";
export default TableHeaderCellComponent;