import { forwardRef } from "react";
import View from "$ecomponents/View";
import styles from "../styles";

const TableRowWrapperComponent = forwardRef(({children,colSpan,...props},ref)=>{
    return <View ref={ref} {...props} style={[styles.row,props.style]} children={children}/>
});

TableRowWrapperComponent.displayName = "TableRowWrapperComponent";

export default TableRowWrapperComponent;