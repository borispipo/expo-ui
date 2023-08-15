import { ScrollView } from "react-native";
import React from "$react";
const TableScrollViewNative = React.forwardRef(({children,...props},ref)=>{
    return <ScrollView {...props} children={children} ref={ref}/>
});
TableScrollViewNative.displayName = "TableScrollViewNative";

export default TableScrollViewNative;