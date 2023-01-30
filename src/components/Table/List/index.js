import React from "$react";
import {Vertical as AutoSizeVertical} from "$ecomponents/AutoSizer";
import List from "./List";
import {defaultStr,defaultObj} from "$utils";
const AutoSizeVerticalList = React.forwardRef(({testID,autoSizerProps,...props},ref)=>{
    testID = defaultStr(testID,"RN_AutoSizeVerticalListComponent")
    autoSizerProps = defaultObj(autoSizerProps);
    return <AutoSizeVertical testID={testID+"_AutoSizerVertical"} {...autoSizerProps} >
        <List {...props} ref={ref}/>
    </AutoSizeVertical>
})

AutoSizeVerticalList.displayName = "AutoSizeVerticalListComponent";

export default AutoSizeVerticalList;