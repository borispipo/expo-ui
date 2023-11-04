import React from "$react";
import List from "$ecomponents/List/Virtuoso";

const AutoSizeVerticalList = React.forwardRef((props,ref)=>{
    return <List {...props} ref={ref}/>;
})

AutoSizeVerticalList.displayName = "AutoSizeVerticalListComponent";
export default AutoSizeVerticalList;

export * from "$ecomponents/List/Virtuoso";