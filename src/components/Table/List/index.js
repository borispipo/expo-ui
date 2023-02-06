import React from "$react";
import {Vertical as AutoSizeVertical} from "$ecomponents/AutoSizer";
import List from "./List";
import {defaultStr,isObj,defaultObj} from "$utils";
const normalize = (size)=>{
    if(isObj(size)){
        ["padding","paddingBottom","paddingTop","paddingLeft","paddingRight"].map(p=>{
            delete size[p];
        })
        return size;
    }
    return {};
}
const AutoSizeVerticalList = React.forwardRef(({testID,autoSizerProps,...props},ref)=>{
    testID = defaultStr(testID,"RN_AutoSizeVerticalListComponent")
    autoSizerProps = defaultObj(autoSizerProps);
    const sizeRef = React.useRef({});
    return <AutoSizeVertical withPadding={false} getRenderingStyle={(size)=>{sizeRef.current = normalize(sizeRef.current);}} testID={testID+"_AutoSizerVertical"} {...autoSizerProps} >
        <List {...props} autoSizedStyle = {sizeRef.current} style={[props.style,sizeRef.current]} ref={ref}/>
    </AutoSizeVertical>
})

AutoSizeVerticalList.displayName = "AutoSizeVerticalListComponent";

export default AutoSizeVerticalList;