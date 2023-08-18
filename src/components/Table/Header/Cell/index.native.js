import View from "$ecomponents/View";
import React from "$react";
import styles from "../../styles";
const TableHeaderCellComponent = React.forwardRef(({width,style,...props},ref)=>{
    return <View ref={ref} {...props} style={[styles.cell,style,width && {width}]}/>
});
TableHeaderCellComponent.displayName = "TableTableHeaderCellComponent";
export default TableHeaderCellComponent;