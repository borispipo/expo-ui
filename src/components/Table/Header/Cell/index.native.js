import View from "$ecomponents/View";
import React from "$react";
import styles from "../../styles";
const TableHeaderCellComponentNative = React.forwardRef(({width,style,...props},ref)=>{
    return <View ref={ref} {...props} style={[styles.cell,style,width && {width}]}/>
});
TableHeaderCellComponentNative.displayName = "TableTableHeaderCellComponentNative";
export default TableHeaderCellComponentNative;