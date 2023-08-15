import React from "$react";
import {Vertical as AutoSizeVertical} from "$ecomponents/AutoSizer";
import List from "$ecomponents/List/Virtuoso";
import {defaultStr,isObj,defaultObj} from "$cutils";

const AutoSizeVerticalList = React.forwardRef(({testID,autoSizerProps,...props},ref)=>{
    testID = defaultStr(testID,"RN_AutoSizeVerticalListComponent")
    autoSizerProps = defaultObj(autoSizerProps);
    return <AutoSizeVertical withPadding={false} testID={testID+"_AutoSizerVertical"} {...autoSizerProps} >
        <List {...props} style={[props.style]} ref={ref}/>
    </AutoSizeVertical>
})

AutoSizeVerticalList.displayName = "AutoSizeVerticalListComponent";
export default AutoSizeVerticalList;

export * from "$ecomponents/List/Virtuoso";